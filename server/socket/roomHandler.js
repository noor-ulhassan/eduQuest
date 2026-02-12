import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { generateCompetitionQuestions } from "../utils/competitionQuestions.js";

// In-memory room storage
const rooms = new Map();

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getRooms() {
  return rooms;
}

export function initializeSocket(io) {
  // Authenticate socket connections via JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.id).select(
        "name email avatarUrl xp level",
      );
      if (!user) return next(new Error("User not found"));

      socket.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        level: user.level,
      };
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] ${socket.user.name} connected (${socket.id})`);

    // ─── CREATE ROOM ──────────────────────────────────────────
    socket.on("createRoom", (callback) => {
      let roomCode = generateRoomCode();
      while (rooms.has(roomCode)) roomCode = generateRoomCode();

      const room = {
        roomCode,
        hostId: socket.user.id,
        hostSocketId: socket.id,
        status: "waiting", // waiting | active | finished
        category: null, // programming | general
        difficulty: "medium",
        language: "javascript",
        topic: "",
        description: "",
        totalQuestions: 5,
        timerDuration: 300, // seconds
        players: [
          {
            id: socket.user.id,
            socketId: socket.id,
            name: socket.user.name,
            avatarUrl: socket.user.avatarUrl,
            score: 0,
            currentQuestion: 0,
            finished: false,
          },
        ],
        questions: [],
        pendingRequests: [],
        spectators: [],
        startTime: null,
        createdAt: Date.now(),
      };

      rooms.set(roomCode, room);
      socket.join(roomCode);
      console.log(`[Socket] Room ${roomCode} created by ${socket.user.name}`);

      if (typeof callback === "function") {
        callback({ success: true, roomCode, room });
      }
    });

    // ─── JOIN ROOM ────────────────────────────────────────────
    socket.on("joinRoom", ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);

      if (!room) {
        console.log(
          `[Socket] Join failed: room "${roomCode}" not found. Active rooms:`,
          [...rooms.keys()],
        );
        return callback?.({ success: false, message: "Room not found" });
      }
      // Check if player already in room
      const existing = room.players.find((p) => p.id === socket.user.id);
      if (existing) {
        existing.socketId = socket.id;
        socket.join(roomCode);
        return callback?.({ success: true, room });
      }

      if (room.status !== "waiting") {
        return callback?.({
          success: false,
          message: "Game already in progress",
        });
      }

      if (room.players.length >= 20) {
        return callback?.({ success: false, message: "Room is full" });
      }

      room.players.push({
        id: socket.user.id,
        socketId: socket.id,
        name: socket.user.name,
        avatarUrl: socket.user.avatarUrl,
        score: 0,
        currentQuestion: 0,
        finished: false,
      });

      socket.join(roomCode);
      io.to(roomCode).emit("playerJoined", {
        players: room.players,
        newPlayer: socket.user.name,
      });

      console.log(
        `[Socket] ${socket.user.name} joined room ${roomCode} (${room.players.length} players)`,
      );
      callback?.({ success: true, room });
    });

    // ─── UPDATE SETTINGS (host only) ─────────────────────────
    socket.on("updateSettings", ({ roomCode, settings }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.user.id) return;

      if (settings.category) room.category = settings.category;
      if (settings.difficulty) room.difficulty = settings.difficulty;
      if (settings.language) room.language = settings.language;
      if (settings.topic !== undefined) room.topic = settings.topic;
      if (settings.description !== undefined)
        room.description = settings.description;
      if (settings.totalQuestions)
        room.totalQuestions = Math.min(settings.totalQuestions, 10);
      if (settings.timerDuration)
        room.timerDuration = Math.min(settings.timerDuration, 900);

      io.to(roomCode).emit("settingsUpdated", {
        category: room.category,
        difficulty: room.difficulty,
        language: room.language,
        topic: room.topic,
        description: room.description,
        totalQuestions: room.totalQuestions,
        timerDuration: room.timerDuration,
      });
    });

    // ─── START GAME (host only) ──────────────────────────────
    socket.on("startGame", async ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);
      if (!room) {
        return callback?.({
          success: false,
          message:
            "Room not found. It may have expired — please create a new room.",
        });
      }
      if (room.hostId !== socket.user.id) {
        return callback?.({
          success: false,
          message: "Only the host can start the game",
        });
      }
      if (!room.category) {
        return callback?.({
          success: false,
          message: "Select a category first",
        });
      }
      if (room.players.length < 1) {
        return callback?.({
          success: false,
          message: "Need at least 1 player",
        });
      }

      try {
        io.to(roomCode).emit("gameStatus", { status: "generating" });

        // Generate questions via Gemini
        const questions = await generateCompetitionQuestions({
          category: room.category,
          difficulty: room.difficulty,
          language: room.language,
          topic: room.topic,
          description: room.description,
          totalQuestions: room.totalQuestions,
        });

        room.questions = questions;
        room.status = "ready";

        // Notify all players that questions are ready — host will confirm
        io.to(roomCode).emit("gameStatus", {
          status: "ready",
          totalQuestions: questions.length,
        });

        console.log(
          `[Socket] Questions ready in room ${roomCode} - ${questions.length} questions, waiting for host to launch`,
        );
        callback?.({ success: true });
      } catch (err) {
        console.error("[Socket] Error generating questions:", err);
        callback?.({
          success: false,
          message: "Failed to generate questions",
        });
        io.to(roomCode).emit("gameStatus", { status: "error" });
      }
    });

    // ─── LAUNCH GAME (host confirms after questions ready) ───
    socket.on("launchGame", ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);
      if (!room) {
        return callback?.({ success: false, message: "Room not found" });
      }
      if (room.hostId !== socket.user.id) {
        return callback?.({
          success: false,
          message: "Only the host can launch the game",
        });
      }
      if (room.status !== "ready" || !room.questions.length) {
        return callback?.({
          success: false,
          message: "Questions are not ready yet",
        });
      }

      room.status = "active";
      room.startTime = Date.now();

      const firstQuestion = sanitizeQuestion(room.questions[0], room.category);

      io.to(roomCode).emit("gameStarted", {
        totalQuestions: room.questions.length,
        timerDuration: room.timerDuration,
        question: firstQuestion,
        questionIndex: 0,
        category: room.category,
        language: room.language,
      });

      startRoomTimer(io, roomCode, room);

      console.log(
        `[Socket] Game launched in room ${roomCode} - ${room.questions.length} questions`,
      );
      callback?.({ success: true });
    });

    // ─── CANCEL GAME (host aborts before launch) ─────────────
    socket.on("cancelGame", ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);
      if (!room) {
        return callback?.({ success: false, message: "Room not found" });
      }
      if (room.hostId !== socket.user.id) {
        return callback?.({
          success: false,
          message: "Only the host can cancel",
        });
      }

      room.status = "waiting";
      room.questions = [];

      io.to(roomCode).emit("gameStatus", { status: "cancelled" });

      console.log(`[Socket] Game cancelled in room ${roomCode}`);
      callback?.({ success: true });
    });

    // ─── SUBMIT ANSWER ───────────────────────────────────────
    socket.on(
      "submitAnswer",
      ({ roomCode, questionIndex, answer }, callback) => {
        const room = rooms.get(roomCode);
        if (!room || room.status !== "active") return;

        const player = room.players.find((p) => p.id === socket.user.id);
        if (!player || player.finished) return;

        const question = room.questions[questionIndex];
        if (!question) return;

        let isCorrect = false;
        let pointsEarned = 0;

        if (room.category === "general") {
          // Direct answer comparison (case-insensitive)
          isCorrect =
            answer?.trim().toLowerCase() ===
            question.correctAnswer?.trim().toLowerCase();

          if (isCorrect) {
            // Time bonus: faster = more points
            const elapsed = (Date.now() - room.startTime) / 1000;
            const timeBonus = Math.max(0, Math.floor(100 - elapsed * 0.5));
            pointsEarned = 100 + timeBonus;
          }
        } else if (room.category === "programming") {
          // For programming, the client runs code via Piston and sends test results
          isCorrect = answer?.allPassed === true;
          if (isCorrect) {
            const elapsed = (Date.now() - room.startTime) / 1000;
            const timeBonus = Math.max(0, Math.floor(200 - elapsed * 0.5));
            pointsEarned = 200 + timeBonus;
          }
        }

        if (isCorrect) {
          player.score += pointsEarned;
        }

        player.currentQuestion = questionIndex + 1;

        // Send next question or mark as finished
        const nextIndex = questionIndex + 1;
        if (nextIndex >= room.questions.length) {
          player.finished = true;
        }

        // Broadcast leaderboard
        const leaderboard = room.players
          .map((p) => ({
            id: p.id,
            name: p.name,
            avatarUrl: p.avatarUrl,
            score: p.score,
            currentQuestion: p.currentQuestion,
            finished: p.finished,
          }))
          .sort((a, b) => b.score - a.score);

        io.to(roomCode).emit("leaderboardUpdate", { leaderboard });

        // Send result back to submitter
        callback?.({
          isCorrect,
          pointsEarned,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation || null,
        });

        // Send next question if available
        if (!player.finished) {
          const nextQ = sanitizeQuestion(
            room.questions[nextIndex],
            room.category,
          );
          socket.emit("nextQuestion", {
            question: nextQ,
            questionIndex: nextIndex,
          });
        } else {
          socket.emit("playerFinished", { score: player.score });
        }

        // Check if all players finished
        if (room.players.every((p) => p.finished)) {
          endGame(io, roomCode, room);
        }
      },
    );

    // ─── REQUEST TO JOIN (public, needs host approval) ───────
    socket.on("requestJoin", ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);
      if (!room) {
        return callback?.({ success: false, message: "Room not found" });
      }
      if (room.status === "finished") {
        return callback?.({ success: false, message: "Game has ended" });
      }
      if (room.players.length >= 20) {
        return callback?.({ success: false, message: "Room is full" });
      }
      // Check if already in room
      if (room.players.find((p) => p.id === socket.user.id)) {
        return callback?.({
          success: false,
          message: "You are already in this room",
        });
      }
      // Check if already pending
      if (room.pendingRequests.find((r) => r.id === socket.user.id)) {
        return callback?.({ success: false, message: "Request already sent" });
      }

      // Add to pending
      room.pendingRequests.push({
        id: socket.user.id,
        socketId: socket.id,
        name: socket.user.name,
        avatarUrl: socket.user.avatarUrl,
      });

      // Notify host
      const hostPlayer = room.players.find((p) => p.id === room.hostId);
      if (hostPlayer) {
        console.log(
          `[Socket] Sending join request from ${socket.user.name} to host ${hostPlayer.name} (${hostPlayer.socketId})`,
        );
        io.to(hostPlayer.socketId).emit("joinRequest", {
          roomCode,
          requester: {
            id: socket.user.id,
            name: socket.user.name,
            avatarUrl: socket.user.avatarUrl,
          },
        });

        console.log(
          `[Socket] ${socket.user.name} requested to join room ${roomCode}`,
        );
        callback?.({
          success: true,
          message: "Join request sent! Waiting for host approval.",
        });
      } else {
        console.warn(
          `[Socket] Host not found for room ${roomCode} (Host ID: ${room.hostId})`,
        );
        callback?.({ success: false, message: "Host is not in the room" });
      }
    });

    // ─── APPROVE JOIN (host only) ────────────────────────────
    socket.on("approveJoin", ({ roomCode, requesterId }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.user.id) return;

      const reqIndex = room.pendingRequests.findIndex(
        (r) => r.id === requesterId,
      );
      if (reqIndex === -1) return;

      const requester = room.pendingRequests[reqIndex];
      room.pendingRequests.splice(reqIndex, 1);

      // Add as player
      room.players.push({
        id: requester.id,
        socketId: requester.socketId,
        name: requester.name,
        avatarUrl: requester.avatarUrl,
        score: 0,
        currentQuestion: 0,
        finished: false,
      });

      // Tell requester they're approved
      io.to(requester.socketId).emit("joinApproved", {
        roomCode,
        room: {
          ...room,
          questions: [], // don't leak questions
        },
      });

      // Notify all players
      io.to(roomCode).emit("playerJoined", {
        players: room.players,
        newPlayer: requester.name,
      });

      // Join the socket room
      const requesterSocket = io.sockets.sockets.get(requester.socketId);
      if (requesterSocket) requesterSocket.join(roomCode);

      console.log(
        `[Socket] ${requester.name} approved to join room ${roomCode}`,
      );
    });

    // ─── DENY JOIN (host only) ───────────────────────────────
    socket.on("denyJoin", ({ roomCode, requesterId }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.user.id) return;

      const reqIndex = room.pendingRequests.findIndex(
        (r) => r.id === requesterId,
      );
      if (reqIndex === -1) return;

      const requester = room.pendingRequests[reqIndex];
      room.pendingRequests.splice(reqIndex, 1);

      io.to(requester.socketId).emit("joinDenied", {
        roomCode,
        message: "Your join request was declined.",
      });

      console.log(`[Socket] ${requester.name} denied from room ${roomCode}`);
    });

    // ─── SPECTATE ROOM ───────────────────────────────────────
    socket.on("spectateRoom", ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);
      if (!room) {
        return callback?.({ success: false, message: "Room not found" });
      }

      // Add to spectators if not already
      if (!room.spectators.find((s) => s.id === socket.user.id)) {
        room.spectators.push({
          id: socket.user.id,
          socketId: socket.id,
          name: socket.user.name,
        });
      }

      socket.join(roomCode);

      // Send current state to spectator
      const leaderboard = room.players
        .map((p) => ({
          id: p.id,
          name: p.name,
          avatarUrl: p.avatarUrl,
          score: p.score,
          currentQuestion: p.currentQuestion,
          finished: p.finished,
        }))
        .sort((a, b) => b.score - a.score);

      const elapsed = room.startTime
        ? Math.floor((Date.now() - room.startTime) / 1000)
        : 0;
      const remaining = room.startTime
        ? Math.max(0, room.timerDuration - elapsed)
        : room.timerDuration;

      callback?.({
        success: true,
        room: {
          roomCode: room.roomCode,
          status: room.status,
          category: room.category,
          topic: room.topic,
          difficulty: room.difficulty,
          language: room.language,
          timerDuration: room.timerDuration,
          timeRemaining: remaining,
          playerCount: room.players.length,
          leaderboard,
          hostName:
            room.players.find((p) => p.id === room.hostId)?.name || "Unknown",
        },
      });

      console.log(`[Socket] ${socket.user.name} spectating room ${roomCode}`);
    });

    // ─── LEAVE ROOM ──────────────────────────────────────────
    socket.on("leaveRoom", ({ roomCode }) => {
      handleLeave(io, socket, roomCode);
    });

    // ─── DISCONNECT ──────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`[Socket] ${socket.user.name} disconnected`);
      // Find rooms this user is in
      for (const [code, room] of rooms) {
        const idx = room.players.findIndex((p) => p.id === socket.user.id);
        if (idx !== -1) {
          handleLeave(io, socket, code);
        }
      }
    });
  });
}

// ─── HELPERS ──────────────────────────────────────────────────

function sanitizeQuestion(question, category) {
  if (category === "general") {
    return {
      question: question.question,
      options: question.options,
      difficulty: question.difficulty,
    };
  } else {
    return {
      title: question.title,
      description: question.description,
      starterCode: question.starterCode,
      testCases: question.testCases,
      difficulty: question.difficulty,
    };
  }
}

function startRoomTimer(io, roomCode, room) {
  const interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - room.startTime) / 1000);
    const remaining = room.timerDuration - elapsed;

    if (remaining <= 0 || room.status === "finished") {
      clearInterval(interval);
      if (room.status !== "finished") {
        endGame(io, roomCode, room);
      }
      return;
    }

    io.to(roomCode).emit("timerUpdate", { remaining });
  }, 1000);

  room._timerInterval = interval;
}

function endGame(io, roomCode, room) {
  room.status = "finished";
  if (room._timerInterval) clearInterval(room._timerInterval);

  const finalLeaderboard = room.players
    .map((p) => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      score: p.score,
      currentQuestion: p.currentQuestion,
    }))
    .sort((a, b) => b.score - a.score);

  io.to(roomCode).emit("gameOver", { leaderboard: finalLeaderboard });

  // Award XP to winner (async, no await needed for emit)
  awardXP(finalLeaderboard);

  // Cleanup room after 60 seconds
  setTimeout(() => {
    rooms.delete(roomCode);
    console.log(`[Socket] Room ${roomCode} cleaned up`);
  }, 60000);
}

async function awardXP(leaderboard) {
  try {
    for (let i = 0; i < leaderboard.length; i++) {
      const xpReward = i === 0 ? 100 : i === 1 ? 50 : 25;
      const user = await User.findById(leaderboard[i].id);
      if (user) {
        user.xp = (user.xp || 0) + xpReward;
        user.level = Math.floor(user.xp / 1000) + 1;
        await user.save();
      }
    }
  } catch (err) {
    console.error("[Socket] Error awarding XP:", err);
  }
}

function handleLeave(io, socket, roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;

  room.players = room.players.filter((p) => p.id !== socket.user.id);
  socket.leave(roomCode);

  if (room.players.length === 0) {
    if (room._timerInterval) clearInterval(room._timerInterval);
    rooms.delete(roomCode);
    console.log(`[Socket] Room ${roomCode} deleted (empty)`);
    return;
  }

  // If host left, assign new host
  if (room.hostId === socket.user.id) {
    room.hostId = room.players[0].id;
    room.hostSocketId = room.players[0].socketId;
    io.to(roomCode).emit("newHost", { hostId: room.hostId });
  }

  io.to(roomCode).emit("playerLeft", {
    players: room.players,
    leftPlayer: socket.user.name,
  });
}
