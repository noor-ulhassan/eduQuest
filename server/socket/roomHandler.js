import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { generateCompetitionQuestions } from "../utils/competitionQuestions.js";
import { CompetitionResult } from "../models/CompetitionResult.model.js";

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
      // Try auth.token first, then fall back to HTTP-only cookie
      let token = socket.handshake.auth?.token;

      if (!token) {
        // Parse token from cookie header (same cookie set by auth.controller.js)
        const cookieHeader = socket.handshake.headers?.cookie || "";
        const match = cookieHeader.match(/(?:^|;\s*)token=([^;]*)/);
        token = match ? match[1] : null;
      }

      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
        challengeMode: "classic", // classic | scenario | debug | outage | refactor | missing
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
            correctAnswers: 0,
            finished: false,
            lastQuestionTime: null,
            finishTime: null,
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
        correctAnswers: 0,
        finished: false,
        lastQuestionTime: null,
        finishTime: null,
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
      if (settings.challengeMode) room.challengeMode = settings.challengeMode;
      if (settings.difficulty) room.difficulty = settings.difficulty;
      if (settings.language) room.language = settings.language;
      if (settings.topic !== undefined) room.topic = settings.topic;
      if (settings.description !== undefined)
        room.description = settings.description;
      if (settings.totalQuestions)
        room.totalQuestions = Math.min(settings.totalQuestions, 10);
      if (settings.timerDuration)
        room.timerDuration = Math.min(settings.timerDuration, 3600);

      io.to(roomCode).emit("settingsUpdated", {
        category: room.category,
        challengeMode: room.challengeMode,
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
          challengeMode: room.challengeMode || "classic",
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

      const firstQuestion = sanitizeQuestion(
        room.questions[0],
        room.category,
        room.challengeMode,
      );

      io.to(roomCode).emit("gameStarted", {
        totalQuestions: room.questions.length,
        timerDuration: room.timerDuration,
        question: firstQuestion,
        questionIndex: 0,
        category: room.category,
        challengeMode: room.challengeMode || "classic",
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

        // Per-question time tracking: measure time since last question was received
        const now = Date.now();
        const questionStartTime = player.lastQuestionTime || room.startTime;
        const questionElapsed = (now - questionStartTime) / 1000; // seconds for this question

        // Speed bonus calculation helper
        const calcSpeedBonus = (base, maxBonus, decayTime) => {
          const speedBonus = Math.max(
            0,
            Math.floor(maxBonus * (1 - questionElapsed / decayTime)),
          );
          return base + speedBonus;
        };

        // ─── INTERACTIVE QUESTION TYPES ───────────────────────
        if (question.interactionType) {
          const iType = question.interactionType;

          if (iType === "type_answer") {
            // Fuzzy match against acceptedAnswers[]
            const userAnswer = (answer?.value || "").trim().toLowerCase();
            isCorrect = (question.acceptedAnswers || []).some(
              (accepted) => accepted.trim().toLowerCase() === userAnswer,
            );
          } else if (iType === "drag_order") {
            // Compare submitted order array against correctOrder
            const submitted = answer?.value; // array of indices
            const correct = question.correctOrder;
            isCorrect =
              Array.isArray(submitted) &&
              Array.isArray(correct) &&
              submitted.length === correct.length &&
              submitted.every((v, i) => v === correct[i]);
          } else if (iType === "drag_match") {
            // Compare submitted matches: { [leftIndex]: rightIndex }
            const submitted = answer?.value; // object mapping leftIdx -> rightIdx
            if (submitted && question.pairs) {
              // Correct mapping: index i on left matches index i on right (before shuffle)
              // Client sends { leftIdx: selectedRightIdx } using the shuffled right indices
              // We need the shuffleMap from the sanitized question to validate
              const shuffleMap = question._rightShuffleMap; // set during sanitize
              if (shuffleMap) {
                isCorrect = question.pairs.every((_, i) => {
                  const selectedRightIdx = submitted[i];
                  // The correct right item for left[i] is the original right[i]
                  // shuffleMap[j] = original index, so we need shuffleMap[selectedRightIdx] === i
                  return shuffleMap[selectedRightIdx] === i;
                });
              } else {
                // Fallback: direct index matching (left[i] matches right[i])
                isCorrect = question.pairs.every((_, i) => submitted[i] === i);
              }
            }
          } else if (iType === "fill_blank") {
            // Compare each blank value
            const submitted = answer?.value; // array of strings
            const correct = question.blanks;
            isCorrect =
              Array.isArray(submitted) &&
              Array.isArray(correct) &&
              submitted.length === correct.length &&
              submitted.every(
                (v, i) =>
                  v.trim().toLowerCase() === correct[i].trim().toLowerCase(),
              );
          } else if (iType === "predict_output") {
            // Fuzzy match against acceptedAnswers[]
            const userAnswer = (answer?.value || "").trim().toLowerCase();
            isCorrect = (question.acceptedAnswers || []).some(
              (accepted) => accepted.trim().toLowerCase() === userAnswer,
            );
          } else if (iType === "slider_adjust") {
            // Check each slider value is within tolerance of correctValue
            const submitted = answer?.value; // object { sliderIndex: value }
            if (submitted && question.sliders) {
              isCorrect = question.sliders.every((slider, i) => {
                const userVal = Number(submitted[i]);
                const tolerance = slider.tolerance || 0;
                return Math.abs(userVal - slider.correctValue) <= tolerance;
              });
            }
          }

          if (isCorrect) {
            pointsEarned = calcSpeedBonus(100, 50, 30);
          }
        }
        // ─── STANDARD MCQ / PROGRAMMING ───────────────────────
        else if (room.category === "general") {
          isCorrect =
            answer?.trim().toLowerCase() ===
            question.correctAnswer?.trim().toLowerCase();

          if (isCorrect) {
            pointsEarned = calcSpeedBonus(100, 50, 30);
          }
        } else if (room.category === "programming") {
          isCorrect = answer?.allPassed === true;
          if (isCorrect) {
            pointsEarned = calcSpeedBonus(200, 100, 60);
          }
        }

        if (isCorrect) {
          player.score += pointsEarned;
          player.correctAnswers = (player.correctAnswers || 0) + 1;
        }

        // Build correct answer info for feedback
        let correctAnswerData = question.correctAnswer || null;
        if (question.interactionType === "drag_order") {
          correctAnswerData = question.correctOrder;
        } else if (question.interactionType === "drag_match") {
          correctAnswerData = question.pairs?.map((p) => p.right);
        } else if (question.interactionType === "fill_blank") {
          correctAnswerData = question.blanks;
        } else if (
          question.interactionType === "type_answer" ||
          question.interactionType === "predict_output"
        ) {
          correctAnswerData = question.acceptedAnswers?.[0] || null;
        } else if (question.interactionType === "slider_adjust") {
          correctAnswerData = question.sliders?.map(
            (s) => `${s.label}: ${s.correctValue}${s.unit}`,
          );
        }

        player.currentQuestion = questionIndex + 1;

        // Send next question or mark as finished
        const nextIndex = questionIndex + 1;
        if (nextIndex >= room.questions.length) {
          player.finished = true;
          player.finishTime = now;
        }

        // Update lastQuestionTime for the next question's speed calculation
        player.lastQuestionTime = now;

        // Broadcast leaderboard
        const leaderboard = room.players
          .map((p) => ({
            id: p.id,
            name: p.name,
            avatarUrl: p.avatarUrl,
            score: p.score,
            currentQuestion: p.currentQuestion,
            correctAnswers: p.correctAnswers || 0,
            finished: p.finished,
          }))
          .sort((a, b) => b.score - a.score);

        io.to(roomCode).emit("leaderboardUpdate", { leaderboard });

        // Send result back to submitter
        callback?.({
          isCorrect,
          pointsEarned,
          correctAnswer: correctAnswerData, // Send the rich correct answer data
          explanation: question.explanation || null,
        });

        // Send next question if available
        if (!player.finished) {
          const nextQ = sanitizeQuestion(
            room.questions[nextIndex],
            room.category,
            room.challengeMode,
          );
          socket.emit("nextQuestion", {
            question: nextQ,
            questionIndex: nextIndex,
          });
        } else {
          // Player finished all questions — send rich individual results
          const timeTaken = Math.floor(
            (player.finishTime - room.startTime) / 1000,
          );
          const currentRank =
            room.players.filter((p) => p.score > player.score).length + 1;

          socket.emit("playerFinished", {
            score: player.score,
            rank: currentRank,
            timeTaken,
            correctAnswers: player.correctAnswers || 0,
            totalQuestions: room.questions.length,
          });

          // Notify others that this player finished
          io.to(roomCode).emit("playerFinishedUpdate", {
            playerId: player.id,
            playerName: player.name,
            finished: true,
          });
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
        correctAnswers: 0,
        finished: false,
        lastQuestionTime: null,
        finishTime: null,
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

const handleLeave = async (io, socket, roomCode) => {
  const room = rooms.get(roomCode);
  if (!room) return;

  // Check if player or spectator
  const playerIndex = room.players.findIndex((p) => p.socketId === socket.id);
  const spectatorIndex = room.spectators.findIndex(
    (s) => s.socketId === socket.id,
  );

  if (playerIndex !== -1) {
    const player = room.players[playerIndex];

    // If game is ACTIVE, record as DNF (Loss)
    if (room.status === "active") {
      try {
        await CompetitionResult.create({
          userId: player.id,
          roomId: roomCode,
          roomCode: roomCode,
          category: room.category,
          challengeMode: room.challengeMode || "classic",
          difficulty: room.difficulty,
          rank: null, // DNF has no rank
          score: player.score,
          status: "dnf",
        });
        console.log(
          `[Result] Recorded DNF for ${player.name} in room ${roomCode}`,
        );
      } catch (err) {
        console.error("Error saving DNF result:", err);
      }
    }

    room.players.splice(playerIndex, 1);
    io.to(roomCode).emit("playerLeft", { playerId: player.id });

    // If host left, assign new host or close room
    if (player.id === room.hostId) {
      if (room.players.length > 0) {
        room.hostId = room.players[0].id;
        room.hostSocketId = room.players[0].socketId; // Update host socket ID
        io.to(roomCode).emit("newHost", {
          hostId: room.hostId,
          hostName: room.players[0].name,
        });
        io.to(roomCode).emit("gameStatus", {
          message: `Host left. ${room.players[0].name} is now the host.`,
        });
      } else {
        rooms.delete(roomCode); // Room empty
        console.log(`[Socket] Room ${roomCode} deleted (host left, empty)`);
      }
    }
  } else if (spectatorIndex !== -1) {
    room.spectators.splice(spectatorIndex, 1);
  }

  socket.leave(roomCode);
};

// ─── HELPERS ──────────────────────────────────────────────────

function sanitizeQuestion(question, category, challengeMode = "classic") {
  // Base fields for general category
  if (category === "general" || challengeMode !== "classic") {
    // For scenario-based modes (debug, outage, refactor, missing) or interactive, include extra fields
    const base = {
      question: question.question,
      options: question.options,
      difficulty: question.difficulty,
      interactionType: question.interactionType,
    };

    // Add scenario if present
    if (question.scenario) base.scenario = question.scenario;
    // Add buggy/context code for code-based modes
    if (question.buggyCode) base.buggyCode = question.buggyCode;
    if (question.contextCode) base.contextCode = question.contextCode;

    // Interactive fields
    if (question.interactionType === "type_answer") {
      base.hint = question.hint;
    } else if (question.interactionType === "drag_order") {
      base.items = question.items; // Already shuffled by genAI, or we can shuffle here if needed
    } else if (question.interactionType === "drag_match") {
      // Shuffle right column, keep track of mapping for validation
      // question.pairs is [{left, right}, ...]
      // We send pairs: [{left: "A", right: "Y"}, ...] where right is shuffled?
      // Actually better: Send { left: ["A", "B"], right: ["Y", "X"] } where right is shuffled
      // But for simplicity let's stick to the prompt structure.
      // The prompt generates: pairs: [{left, right}] where left matches right.
      // We need to shuffle the 'right' values for the client presentation.

      const leftItems = question.pairs.map((p) => p.left);
      const rightItems = question.pairs.map((p) => p.right);

      let indices;
      if (question._rightShuffleMap) {
        // Reuse existing shuffle map (important for consistency across players/reconnects)
        indices = question._rightShuffleMap;
      } else {
        // Shuffle right items and store mapping
        indices = rightItems.map((_, i) => i);
        // Fisher-Yates shuffle indices
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        // Store shuffle map on the question object for validation (TEMPORARY on the active room object)
        question._rightShuffleMap = indices; // indices[newPos] = originalPos
      }

      const shuffledRight = indices.map((i) => rightItems[i]);

      base.pairs = {
        left: leftItems,
        right: shuffledRight,
      };
    } else if (question.interactionType === "fill_blank") {
      base.codeTemplate = question.codeTemplate;
      base.hint = question.hint;
    } else if (question.interactionType === "predict_output") {
      base.codeSnippet = question.codeSnippet;
    } else if (question.interactionType === "slider_adjust") {
      // Send slider config WITHOUT correctValue/tolerance
      base.sliders = question.sliders?.map((s) => ({
        label: s.label,
        unit: s.unit,
        min: s.min,
        max: s.max,
        step: s.step,
      }));
    }

    return base;
  }

  // Classic programming mode
  return {
    title: question.title,
    description: question.description,
    starterCode: question.starterCode,
    testCases: question.testCases,
    difficulty: question.difficulty,
  };
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
  if (room.status === "finished") return; // Prevent double-trigger
  room.status = "finished";
  room.endTime = Date.now();
  if (room._timerInterval) clearInterval(room._timerInterval);

  // Sort leaderboard
  const finalLeaderboard = room.players
    .map((p) => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      score: p.score,
      currentQuestion: p.currentQuestion,
      correctAnswers: p.correctAnswers || 0,
      finished: p.finished,
      timeTaken: p.finishTime
        ? Math.floor((p.finishTime - room.startTime) / 1000)
        : null,
    }))
    .sort((a, b) => b.score - a.score);

  // Save results to DB
  (async () => {
    try {
      const results = finalLeaderboard.map((p, index) => ({
        userId: p.id,
        roomId: roomCode,
        roomCode: roomCode,
        category: room.category,
        challengeMode: room.challengeMode || "classic",
        difficulty: room.difficulty,
        rank: index + 1,
        score: p.score || 0, // Ensure strictly number
        status: "completed",
      }));

      if (results.length > 0) {
        await CompetitionResult.insertMany(results);
        console.log(
          `[Result] Saved ${results.length} results for room ${roomCode}`,
        );
      }
    } catch (err) {
      console.error("Error saving game results:", err);
    }
  })();

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
      const playerEntry = leaderboard[i];
      if (playerEntry.score <= 0) continue; // No XP for 0 score

      const xpReward = i === 0 ? 100 : i === 1 ? 50 : 25;
      const user = await User.findById(playerEntry.id);
      if (user) {
        user.xp =
          (user.xp || 0) + xpReward + Math.floor(playerEntry.score / 10); // Add match score (scaled) + bonus
        user.level = Math.floor(user.xp / 1000) + 1;
        await user.save();
      }
    }
  } catch (err) {
    console.error("[Socket] Error awarding XP:", err);
  }
}
