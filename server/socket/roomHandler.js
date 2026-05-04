import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { generateCompetitionQuestions } from "../utils/competitionQuestions.js";
import { CompetitionResult } from "../models/CompetitionResult.model.js";
import { registerVoiceEvents } from "./voiceHandler.js";
import { addXP } from "../utils/progression.js";

// In-memory room storage
const rooms = new Map();
const userRoomMap = new Map(); // userId → roomCode for O(1) disconnect lookup

// Leaderboard broadcast throttle — max once per 500ms per room
const leaderboardTimers = new Map();

function scheduleLeaderboardBroadcast(io, roomCode, room) {
  if (leaderboardTimers.has(roomCode)) return; // Already scheduled

  leaderboardTimers.set(
    roomCode,
    setTimeout(() => {
      leaderboardTimers.delete(roomCode);
      if (!room || room.status === "finished") return;

      const leaderboard = room.players
        .map((p) => ({
          id: p.id,
          name: p.name,
          avatarUrl: p.avatarUrl,
          score: p.score,
          currentQuestion: p.currentQuestion,
          correctAnswers: p.correctAnswers || 0,
          finished: p.finished,
          eliminated: p.eliminated || false,
          team: room.playerTeam ? room.playerTeam[p.id] : null,
        }))
        .sort((a, b) => b.score - a.score);

      io.to(roomCode).emit("leaderboardUpdate", { leaderboard });
    }, 500),
  );
}

let roomListBroadcastTimer = null;

// Notify homepage listeners when room list changes — debounced 300ms
function broadcastRoomListUpdate(io) {
  if (roomListBroadcastTimer) return;
  roomListBroadcastTimer = setTimeout(() => {
    roomListBroadcastTimer = null;
    const activeRooms = [];
    for (const [code, room] of rooms) {
      if (room.status === "waiting" || room.status === "active") {
        const hostPlayer = room.players.find((p) => p.id === room.hostId);
        activeRooms.push({
          roomCode: code,
          hostName: hostPlayer?.name || "Unknown",
          hostAvatar: hostPlayer?.avatarUrl || null,
          status: room.status,
          category: room.category,
          topic: room.topic || null,
          description: room.description || null,
          difficulty: room.difficulty,
          language: room.language,
          playerCount: room.players.length,
          players: room.players.map((p) => ({
            id: p.id,
            name: p.name,
            avatarUrl: p.avatarUrl || null,
          })),
          spectatorCount: (room.spectators || []).length,
          maxPlayers: 20,
          timerDuration: room.timerDuration,
          createdAt: room.createdAt,
        });
      }
    }
    activeRooms.sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (b.status === "active" && a.status !== "active") return 1;
      return b.createdAt - a.createdAt;
    });
    io.emit("roomListUpdate", { rooms: activeRooms });
  }, 300);
}

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

    // SEC-2: Per-socket rate limiting (30 events/sec, disconnect on sustained abuse)
    let eventCount = 0;
    let warnCount = 0;
    let cleanWindows = 0;
    const rateLimitInterval = setInterval(() => {
      if (eventCount > 50) {
        warnCount++;
        cleanWindows = 0;
        console.warn(`[RateLimit] ${socket.user.name} exceeded rate limit (${eventCount} events/sec)`);
        if (warnCount >= 3) {
          console.error(`[RateLimit] Disconnecting ${socket.user.name} for sustained abuse`);
          socket.disconnect(true);
          clearInterval(rateLimitInterval);
        }
      } else {
        cleanWindows++;
        if (cleanWindows >= 3) {
          warnCount = 0;
          cleanWindows = 0;
        }
      }
      eventCount = 0;
    }, 1000);

    socket.use((packet, next) => {
      eventCount++;
      if (eventCount > 50) {
        return next(new Error("Rate limit exceeded"));
      }
      next();
    });

    socket.on("disconnect", () => {
      clearInterval(rateLimitInterval);
    });

    // Register voice chat events for this socket
    registerVoiceEvents(io, socket);

    // ─── CLI-3: SYNC STATE (reconnection recovery) ───────────
    socket.on("syncState", ({ roomCode }, callback) => {
      if (typeof roomCode !== "string") return;
      const room = rooms.get(roomCode);
      if (!room) return callback?.({ success: false, message: "Room not found" });

      const player = room.players.find((p) => p.id === socket.user.id);
      if (!player) return callback?.({ success: false, message: "Not in this room" });

      // Update socket ID for reconnected player
      player.socketId = socket.id;
      socket.join(roomCode);

      // Build current game state
      const state = {
        success: true,
        gameState: room.status, // waiting | active | finished
        leaderboard: room.players
          .map((p) => ({
            id: p.id,
            name: p.name,
            avatarUrl: p.avatarUrl,
            score: p.score,
            currentQuestion: p.currentQuestion,
            correctAnswers: p.correctAnswers || 0,
            finished: p.finished,
          }))
          .sort((a, b) => b.score - a.score),
        settings: {
          category: room.category,
          challengeMode: room.challengeMode,
          gameMode: room.gameMode || "classic",
          difficulty: room.difficulty,
          language: room.language,
          topic: room.topic,
          description: room.description,
          totalQuestions: room.totalQuestions,
          timerDuration: room.timerDuration,
        },
      };

      // If game is active, include the player's current question
      if (room.status === "active" && !player.finished) {
        const qIndex = player.currentQuestion || 0;
        const question = room.questions[qIndex];
        if (question) {
          state.currentQuestion = sanitizeQuestion(question, room.category, room.challengeMode, room, qIndex);
          state.questionIndex = qIndex;
        }
        // Include time remaining
        const elapsed = Math.floor((Date.now() - room.startTime) / 1000);
        state.timeRemaining = Math.max(0, room.timerDuration - elapsed);
        state.startTime = room.startTime;
      }

      callback?.(state);
      console.log(`[Socket] ${socket.user.name} synced state for room ${roomCode}`);
    });
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
        gameMode: "classic", // classic | survival | blitz
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
      userRoomMap.set(socket.user.id, roomCode);
      console.log(`[Socket] Room ${roomCode} created by ${socket.user.name}`);

      if (typeof callback === "function") {
        callback({ success: true, roomCode, room: safeRoomPayload(room) });
      }
      broadcastRoomListUpdate(io);
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
        userRoomMap.set(socket.user.id, roomCode);
        return callback?.({ success: true, room: safeRoomPayload(room) });
      }

      if (room.status !== "waiting") {
        return callback?.({
          success: false,
          message: "Game already in progress",
        });
      }

      const maxPlayers = room.gameMode === "duel" ? 2 : 20;
      if (room.players.length >= maxPlayers) {
        return callback?.({ success: false, message: room.gameMode === "duel" ? "Duel rooms are limited to 2 players" : "Room is full" });
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
      userRoomMap.set(socket.user.id, roomCode);
      io.to(roomCode).emit("playerJoined", {
        players: room.players,
        newPlayer: socket.user.name,
      });

      console.log(
        `[Socket] ${socket.user.name} joined room ${roomCode} (${room.players.length} players)`,
      );
      callback?.({ success: true, room: safeRoomPayload(room) });
      broadcastRoomListUpdate(io);
    });

    // ─── UPDATE SETTINGS (host only) ─────────────────────────
    socket.on("updateSettings", ({ roomCode, settings }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.user.id) return;
      if (!settings || typeof settings !== "object") return;

      // Validate and apply settings with allow-lists and bounds
      const validCategories = ["programming", "general"];
      const validModes = ["classic", "scenario", "debug", "outage", "refactor", "missing", "interactive"];
      const validGameModes = ["classic", "survival", "blitz", "team", "duel", "practice"];
      const validDifficulties = ["easy", "medium", "hard"];

      if (settings.category && validCategories.includes(settings.category)) {
        room.category = settings.category;
      }
      if (settings.challengeMode && validModes.includes(settings.challengeMode)) {
        room.challengeMode = settings.challengeMode;
      }
      if (settings.gameMode && validGameModes.includes(settings.gameMode)) {
        room.gameMode = settings.gameMode;
      }
      if (settings.difficulty && validDifficulties.includes(settings.difficulty)) {
        room.difficulty = settings.difficulty;
      }
      if (typeof settings.language === "string") {
        room.language = settings.language.slice(0, 30);
      }
      if (typeof settings.topic === "string") {
        room.topic = settings.topic.slice(0, 200);
      }
      if (typeof settings.description === "string") {
        room.description = settings.description.slice(0, 500);
      }
      if (typeof settings.totalQuestions === "number") {
        room.totalQuestions = Math.max(1, Math.min(Math.floor(settings.totalQuestions), 10));
      }
      if (typeof settings.timerDuration === "number") {
        room.timerDuration = Math.max(60, Math.min(Math.floor(settings.timerDuration), 3600));
      }

      io.to(roomCode).emit("settingsUpdated", {
        category: room.category,
        challengeMode: room.challengeMode,
        gameMode: room.gameMode || "classic",
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

      // If questions already generated, skip API call and re-notify
      if (room.status === "ready" && room.questions?.length > 0) {
        io.to(roomCode).emit("gameStatus", {
          status: "ready",
          totalQuestions: room.questions.length,
        });
        return callback?.({ success: true });
      }

      // Prevent concurrent generation for the same room
      if (room.status === "generating") {
        return callback?.({ success: false, message: "Questions are already being generated" });
      }

      try {
        room.status = "generating";
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
        // Reset status so host can retry (unless quota — no point retrying)
        if (rooms.has(roomCode)) rooms.get(roomCode).status = "lobby";
        const isQuota = err.message === "QUOTA_EXCEEDED";
        const message = isQuota
          ? "AI quota exceeded. Please upgrade your Gemini API plan or try again later."
          : "Failed to generate questions. Please try again.";
        callback?.({ success: false, message });
        io.to(roomCode).emit("gameStatus", {
          status: "error",
          message,
        });
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

      // Team Battle: auto-assign players to 2 teams
      if (room.gameMode === "team") {
        const half = Math.ceil(room.players.length / 2);
        room.playerTeam = {};
        room.players.forEach((p, i) => { room.playerTeam[p.id] = i < half ? 0 : 1; });
      }

      // Survival: require at least 2 players
      if (room.gameMode === "survival" && room.players.length < 2) {
        return callback?.({ success: false, message: "Survival mode requires at least 2 players" });
      }

      // Survival: initialize round tracking
      if (room.gameMode === "survival") {
        room.roundAnswers = {};
        room.roundIndex = 0;
        room._roundTimer = setTimeout(() => {
          if (room.status !== "active") return;
          room.players.filter(p => !p.eliminated && !p.finished)
            .forEach(p => { if (!room.roundAnswers[p.id]) room.roundAnswers[p.id] = { isCorrect: false }; });
          processSurvivalRound(io, roomCode, room);
        }, 30000);
      }

      const firstQuestion = sanitizeQuestion(
        room.questions[0],
        room.category,
        room.challengeMode,
        room,
        0,
      );

      io.to(roomCode).emit("gameStarted", {
        totalQuestions: room.questions.length,
        timerDuration: room.timerDuration,
        question: firstQuestion,
        questionIndex: 0,
        category: room.category,
        challengeMode: room.challengeMode || "classic",
        gameMode: room.gameMode || "classic",
        playerTeam: room.playerTeam || null,
        language: room.language,
      });

      startRoomTimer(io, roomCode, room);

      // Blitz: set 15s per-question timer for each player's first question
      if (room.gameMode === "blitz") {
        room.players.forEach(p => setBlitzQuestionTimer(io, roomCode, room, p, 0));
      }

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
        // Input validation
        if (typeof roomCode !== "string") return;
        if (typeof questionIndex !== "number" || !Number.isInteger(questionIndex) || questionIndex < 0) return;
        if (answer === undefined || answer === null) return;

        const room = rooms.get(roomCode);
        if (!room || room.status !== "active") return;
        if (questionIndex >= (room.questions?.length || 0)) return;

        const player = room.players.find((p) => p.id === socket.user.id);
        if (!player || player.finished || player.eliminated) return;
        if (questionIndex !== player.currentQuestion) return; // C-3: prevent double-submit

        const question = room.questions[questionIndex];
        if (!question) return;

        let isCorrect = false;
        let pointsEarned = 0;

        // Per-question time tracking: measure time since last question was received
        const now = Date.now();
        const questionStartTime = player.lastQuestionTime || room.startTime;
        const questionElapsed = (now - questionStartTime) / 1000; // seconds for this question

        // Blitz: clear the per-question 15s timer since player answered
        if (room.gameMode === "blitz" && room._blitzTimers) {
          clearTimeout(room._blitzTimers.get(player.id));
          room._blitzTimers.delete(player.id);
        }

        // Blitz mode: 3× more bonus XP, in a 3× tighter window (answer within ~10s for full bonus)
        const blitzFactor = room.gameMode === "blitz" ? 3 : 1;

        // Speed bonus calculation helper
        const calcSpeedBonus = (base, maxBonus, decayTime) => {
          const speedBonus = Math.max(
            0,
            Math.floor(
              maxBonus * blitzFactor * (1 - questionElapsed / (decayTime / blitzFactor)),
            ),
          );
          return base + speedBonus;
        };

        const iType = question.interactionType;

        // ─── INTERACTIVE QUESTION TYPES ───────────────────────
        if (iType === "type_answer") {
          const userAnswer = (answer?.value || "").trim().toLowerCase();
          isCorrect = (question.acceptedAnswers || []).some(
            (accepted) => accepted.trim().toLowerCase() === userAnswer,
          );
          if (isCorrect) pointsEarned = calcSpeedBonus(100, 50, 30);
        } else if (iType === "drag_order") {
          const submitted = answer?.value;
          const correct = question.correctOrder;
          isCorrect =
            Array.isArray(submitted) &&
            Array.isArray(correct) &&
            submitted.length === correct.length &&
            submitted.every((v, i) => v === correct[i]);
          if (isCorrect) pointsEarned = calcSpeedBonus(100, 50, 30);
        } else if (iType === "drag_match") {
          const submitted = answer?.value;
          if (submitted && question.pairs) {
            const mapKey = `q${questionIndex}_dragMatch`;
            const shuffleMap = room._shuffleMaps?.[mapKey];
            if (shuffleMap) {
              isCorrect = question.pairs.every((_, i) => {
                const selectedRightIdx = submitted[i];
                return shuffleMap[selectedRightIdx] === i;
              });
            } else {
              isCorrect = question.pairs.every((_, i) => submitted[i] === i);
            }
          }
          if (isCorrect) pointsEarned = calcSpeedBonus(100, 50, 30);
        } else if (iType === "fill_blank") {
          const submitted = answer?.value;
          const correct = question.blanks;
          isCorrect =
            Array.isArray(submitted) &&
            Array.isArray(correct) &&
            submitted.length === correct.length &&
            submitted.every(
              (v, i) => v.trim().toLowerCase() === correct[i].trim().toLowerCase(),
            );
          if (isCorrect) pointsEarned = calcSpeedBonus(100, 50, 30);
        } else if (iType === "predict_output") {
          const userAnswer = (answer?.value || "").trim().toLowerCase();
          isCorrect = (question.acceptedAnswers || []).some(
            (accepted) => accepted.trim().toLowerCase() === userAnswer,
          );
          if (isCorrect) pointsEarned = calcSpeedBonus(100, 50, 30);
        } else if (iType === "slider_adjust") {
          const submitted = answer?.value;
          if (submitted && question.sliders) {
            isCorrect = question.sliders.every((slider, i) => {
              const userVal = Number(submitted[i]);
              const tolerance = slider.tolerance || 0;
              return Math.abs(userVal - slider.correctValue) <= tolerance;
            });
          }
          if (isCorrect) pointsEarned = calcSpeedBonus(100, 50, 30);

        // ─── CODE EXECUTION (programming + classic) ───────────
        } else if (room.category === "programming" && (!room.challengeMode || room.challengeMode === "classic")) {
          isCorrect = answer?.allPassed === true;
          if (isCorrect) pointsEarned = calcSpeedBonus(200, 100, 60);

        // ─── STANDARD MCQ (all other cases) ───────────────────
        } else {
          isCorrect =
            typeof answer === "string" &&
            answer.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
          if (isCorrect) pointsEarned = calcSpeedBonus(100, 50, 30);
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

        // Broadcast leaderboard (throttled — max once per 500ms)
        scheduleLeaderboardBroadcast(io, roomCode, room);

        // Send result back to submitter
        callback?.({
          isCorrect,
          pointsEarned,
          correctAnswer: correctAnswerData, // Send the rich correct answer data
          explanation: question.explanation || null,
        });

        // Survival: record answer and wait for all active players before advancing
        if (room.gameMode === "survival") {
          if (!room.roundAnswers) room.roundAnswers = {};
          room.roundAnswers[player.id] = { isCorrect, pointsEarned };
          const active = room.players.filter(p => !p.eliminated && !p.finished);
          if (active.length >= 2 && active.every(p => room.roundAnswers[p.id] !== undefined)) {
            processSurvivalRound(io, roomCode, room);
          }
          return; // Don't use normal next-question flow
        }

        // Send next question if available
        if (!player.finished) {
          const nextQ = sanitizeQuestion(
            room.questions[nextIndex],
            room.category,
            room.challengeMode,
            room,
            nextIndex,
          );
          socket.emit("nextQuestion", {
            question: nextQ,
            questionIndex: nextIndex,
          });
          if (room.gameMode === "blitz") setBlitzQuestionTimer(io, roomCode, room, player, nextIndex);
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

        // Check if all players finished (or eliminated in survival)
        if (room.players.every((p) => p.finished || p.eliminated)) {
          endGame(io, roomCode, room);
        }
      },
    );

    // ─── PLAYER STARTED (VS screen dismissed — fix Q0 speed bonus) ──
    socket.on("playerStarted", ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room || room.status !== "active") return;
      const player = room.players.find((p) => p.id === socket.user.id);
      // Only update if player hasn't answered Q0 yet (lastQuestionTime is still null)
      if (player && player.currentQuestion === 0 && !player.lastQuestionTime) {
        player.lastQuestionTime = Date.now();
      }
    });

    // ─── GET TIMER SYNC (immediate sync after VS screen) ────────
    socket.on("getTimerSync", ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);
      if (!room || room.status !== "active") return callback?.({});
      const elapsed = Math.floor((Date.now() - room.startTime) / 1000);
      const remaining = Math.max(0, room.timerDuration - elapsed);
      callback?.({ remaining });
    });

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

      // Tell requester they're approved (explicit allow-list — don't leak internals)
      io.to(requester.socketId).emit("joinApproved", {
        roomCode,
        room: {
          roomCode: room.roomCode,
          hostId: room.hostId,
          status: room.status,
          category: room.category,
          challengeMode: room.challengeMode,
          difficulty: room.difficulty,
          language: room.language,
          topic: room.topic,
          description: room.description,
          totalQuestions: room.totalQuestions,
          timerDuration: room.timerDuration,
          players: room.players.map((p) => ({
            id: p.id,
            name: p.name,
            avatarUrl: p.avatarUrl,
            score: p.score,
          })),
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
      broadcastRoomListUpdate(io);

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
      const code = userRoomMap.get(socket.user.id);
      if (code) handleLeave(io, socket, code);
    });
  });
}

const handleLeave = async (io, socket, roomCode) => {
  const room = rooms.get(roomCode);
  if (!room) return;

  // Check if player or spectator — use user ID to avoid stale socket ID after reconnect
  const playerIndex = room.players.findIndex((p) => p.id === socket.user.id);
  const spectatorIndex = room.spectators.findIndex(
    (s) => s.id === socket.user.id,
  );

  if (playerIndex !== -1) {
    const player = room.players[playerIndex];

    // If game is ACTIVE, record as DNF (Loss)
    if (room.status === "active") {
      try {
        await CompetitionResult.create({
          userId: player.id,
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
    userRoomMap.delete(socket.user.id);
    io.to(roomCode).emit("playerLeft", {
      playerId: player.id,
      leftPlayer: player.name,
      players: room.players,
    });

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
        broadcastRoomListUpdate(io);
      }
    }
  } else if (spectatorIndex !== -1) {
    room.spectators.splice(spectatorIndex, 1);
  }

  socket.leave(roomCode);
};

// ─── HELPERS ──────────────────────────────────────────────────

// Returns room data safe to send to players — never includes questions/answers
function safeRoomPayload(room) {
  return {
    roomCode: room.roomCode,
    hostId: room.hostId,
    status: room.status,
    category: room.category,
    challengeMode: room.challengeMode,
    gameMode: room.gameMode || "classic",
    difficulty: room.difficulty,
    language: room.language,
    topic: room.topic,
    description: room.description,
    totalQuestions: room.totalQuestions,
    timerDuration: room.timerDuration,
    pendingRequests: room.pendingRequests,
    players: room.players,
    createdAt: room.createdAt,
  };
}

function sanitizeQuestion(question, category, challengeMode = "classic", room = null, questionIndex = 0) {
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
      // Use room-level shuffle maps to keep question objects immutable
      if (!room) return base; // drag_match requires room context
      if (!room._shuffleMaps) room._shuffleMaps = {};
      const mapKey = `q${questionIndex}_dragMatch`;

      if (room._shuffleMaps[mapKey]) {
        // Reuse existing shuffle map (important for consistency across players/reconnects)
        indices = room._shuffleMaps[mapKey];
      } else {
        // Shuffle right items and store mapping
        indices = rightItems.map((_, i) => i);
        // Fisher-Yates shuffle indices
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        room._shuffleMaps[mapKey] = indices;
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
  let lastSync = 0;

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

    // Sync timer to clients every 30 seconds to correct any drift
    const now = Date.now();
    if (now - lastSync >= 30000) {
      lastSync = now;
      io.to(roomCode).emit("timerSync", { remaining, serverTime: now });
    }
  }, 1000);

  room._timerInterval = interval;
}

async function endGame(io, roomCode, room) {
  if (room.status === "finished") return; // Prevent double-trigger
  room.status = "finished";
  room.endTime = Date.now();
  if (room._timerInterval) clearInterval(room._timerInterval);
  if (room._roundTimer) { clearTimeout(room._roundTimer); room._roundTimer = null; }
  if (room._blitzTimers) { room._blitzTimers.forEach(t => clearTimeout(t)); room._blitzTimers.clear(); }

  // Sort leaderboard — eliminated players go after finishers, sorted by score
  const finalLeaderboard = room.players
    .map((p) => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      score: p.score,
      currentQuestion: p.currentQuestion,
      correctAnswers: p.correctAnswers || 0,
      finished: p.finished,
      eliminated: p.eliminated || false,
      timeTaken: p.finishTime
        ? Math.floor((p.finishTime - room.startTime) / 1000)
        : null,
    }))
    .sort((a, b) => {
      if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
      return b.score - a.score;
    });

  let teamScores = null;
  if (room.playerTeam) {
    teamScores = { 0: 0, 1: 0 };
    finalLeaderboard.forEach(p => {
      const team = room.playerTeam[p.id];
      if (team === 0 || team === 1) teamScores[team] += p.score;
    });
  }

  io.to(roomCode).emit("gameOver", {
    leaderboard: finalLeaderboard,
    playerTeam: room.playerTeam || null,
    teamScores,
  });

  // Award XP to winner (skip for practice mode)
  if (room.gameMode !== "practice") awardXP(finalLeaderboard);

  // Save results to DB — skip for practice (unranked)
  if (room.gameMode === "practice") {
    setTimeout(() => { rooms.delete(roomCode); broadcastRoomListUpdate(io); }, 60000);
    return;
  }

  try {
    // DATA-1: Remove any existing DNF records for these players in this room
    // (prevents double-recording if a player disconnected then reconnected)
    const playerIds = finalLeaderboard.map((p) => p.id);
    await CompetitionResult.deleteMany({
      roomCode: roomCode,
      userId: { $in: playerIds },
      status: "dnf",
    });

    const results = finalLeaderboard.map((p, index) => ({
      userId: p.id,
      roomCode: roomCode,
      category: room.category,
      challengeMode: room.challengeMode || "classic",
      difficulty: room.difficulty,
      rank: (p.finished && !p.eliminated) ? index + 1 : null,
      score: p.score || 0,
      status: (p.finished && !p.eliminated) ? "completed" : "dnf",
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

  // Cleanup room after 60 seconds
  setTimeout(() => {
    rooms.delete(roomCode);
    console.log(`[Socket] Room ${roomCode} cleaned up`);
    broadcastRoomListUpdate(io);
  }, 60000);
}

// ─── SURVIVAL: Round-based elimination ────────────────────────
function processSurvivalRound(io, roomCode, room) {
  if (room._roundTimer) { clearTimeout(room._roundTimer); room._roundTimer = null; }
  if (room.status !== "active") return;

  const active = room.players.filter(p => !p.eliminated && !p.finished);
  if (active.length <= 1) { endGame(io, roomCode, room); return; }

  // Eliminate the player with the lowest cumulative score
  const sorted = [...active].sort((a, b) => a.score - b.score);
  const lowestPlayer = sorted[0];

  lowestPlayer.eliminated = true;
  lowestPlayer.finished = true;
  lowestPlayer.finishTime = Date.now();

  const lowestSocket = io.sockets.sockets.get(lowestPlayer.socketId);
  if (lowestSocket) {
    lowestSocket.emit("playerEliminated", {
      score: lowestPlayer.score,
      correctAnswers: lowestPlayer.correctAnswers || 0,
      totalQuestions: room.questions.length,
    });
  }
  io.to(roomCode).emit("playerEliminatedUpdate", { playerId: lowestPlayer.id, playerName: lowestPlayer.name });

  room.roundAnswers = {};
  room.roundIndex = (room.roundIndex || 0) + 1;

  const stillActive = room.players.filter(p => !p.eliminated && !p.finished);
  scheduleLeaderboardBroadcast(io, roomCode, room);

  if (stillActive.length <= 1 || room.roundIndex >= room.questions.length) {
    endGame(io, roomCode, room);
    return;
  }

  // Send next question to all survivors simultaneously
  const nextQ = room.questions[room.roundIndex];
  const now = Date.now();
  stillActive.forEach(p => {
    p.currentQuestion = room.roundIndex;
    p.lastQuestionTime = now;
    const sanitized = sanitizeQuestion(nextQ, room.category, room.challengeMode, room, room.roundIndex);
    const pSocket = io.sockets.sockets.get(p.socketId);
    if (pSocket) pSocket.emit("nextQuestion", { question: sanitized, questionIndex: room.roundIndex });
  });

  // 30s per-round timer — auto-submit wrong for non-responders
  room._roundTimer = setTimeout(() => {
    if (room.status !== "active") return;
    room.players.filter(p => !p.eliminated && !p.finished)
      .forEach(p => { if (!room.roundAnswers[p.id]) room.roundAnswers[p.id] = { isCorrect: false }; });
    processSurvivalRound(io, roomCode, room);
  }, 30000);
}

// ─── BLITZ: 15s per-question timer ────────────────────────────
function setBlitzQuestionTimer(io, roomCode, room, player, questionIndex) {
  if (!room._blitzTimers) room._blitzTimers = new Map();
  clearTimeout(room._blitzTimers.get(player.id));

  const timer = setTimeout(() => {
    if (room.status !== "active" || player.currentQuestion !== questionIndex || player.finished) return;
    room._blitzTimers.delete(player.id);

    player.currentQuestion = questionIndex + 1;
    player.lastQuestionTime = Date.now();
    scheduleLeaderboardBroadcast(io, roomCode, room);

    const nextIndex = questionIndex + 1;
    const playerSocket = io.sockets.sockets.get(player.socketId);

    if (nextIndex >= room.questions.length) {
      player.finished = true;
      player.finishTime = Date.now();
      const timeTaken = Math.floor((player.finishTime - room.startTime) / 1000);
      const currentRank = room.players.filter(p => p.score > player.score).length + 1;
      if (playerSocket) {
        playerSocket.emit("playerFinished", { score: player.score, rank: currentRank, timeTaken, correctAnswers: player.correctAnswers || 0, totalQuestions: room.questions.length });
      }
      io.to(roomCode).emit("playerFinishedUpdate", { playerId: player.id, playerName: player.name, finished: true });
      if (room.players.every(p => p.finished)) endGame(io, roomCode, room);
    } else {
      const nextQ = sanitizeQuestion(room.questions[nextIndex], room.category, room.challengeMode, room, nextIndex);
      if (playerSocket) playerSocket.emit("nextQuestion", { question: nextQ, questionIndex: nextIndex });
      setBlitzQuestionTimer(io, roomCode, room, player, nextIndex);
    }
  }, 15000);

  room._blitzTimers.set(player.id, timer);
}

async function awardXP(leaderboard) {
  await Promise.all(
    leaderboard.map(async (playerEntry, i) => {
      if (playerEntry.score <= 0) return;
      try {
        const xpReward = i === 0 ? 100 : i === 1 ? 50 : 25;
        const totalEarned = xpReward + Math.floor(playerEntry.score / 10);
        const user = await User.findById(playerEntry.id);
        if (!user) return;
        const totalWins = await CompetitionResult.countDocuments({
          userId: user._id,
          rank: 1,
          status: "completed",
        });
        await addXP(user, totalEarned, { totalWins });
      } catch (err) {
        console.error(`[Socket] Error awarding XP for ${playerEntry.name}:`, err);
      }
    })
  );
}
