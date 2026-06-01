import jwt from "jsonwebtoken";
import { User }                     from "../models/user.model.js";
import { CompetitionResult }        from "../models/CompetitionResult.model.js";
import { generateCompetitionQuestions } from "./questions/generator.js";
import { rooms, userRoomMap }       from "./store.js";
import {
  generateRoomCode, makePlayer, resetRoomState,
  safeRoomPayload, sanitizeQuestion,
  scheduleLeaderboardBroadcast, broadcastRoomListUpdate, startRoomTimer,
} from "./helpers.js";
import { gradeAnswer }              from "./scoring.js";
import { endGame }                  from "./endGame.js";
import { processSurvivalRound, setBlitzQuestionTimer } from "./gameModes.js";

export function initializeSocket(io) {
  // ─── AUTH MIDDLEWARE ──────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token;
      if (!token) {
        const cookieHeader = socket.handshake.headers?.cookie || "";
        const match = cookieHeader.match(/(?:^|;\s*)token=([^;]*)/);
        token = match ? match[1] : null;
      }
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select("name email avatarUrl xp level");
      if (!user) return next(new Error("User not found"));

      const results       = await CompetitionResult.find({ userId: user._id, status: "completed" });
      const wins          = results.filter(r => r.rank === 1).length;
      const winPercentage = results.length > 0 ? Math.round((wins / results.length) * 100) : 0;

      socket.user = { id: user._id.toString(), name: user.name, email: user.email, avatarUrl: user.avatarUrl, xp: user.xp, level: user.level || 1, winPercentage };
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] ${socket.user.name} connected (${socket.id})`);

    // ─── RATE LIMITING ────────────────────────────────────
    let eventCount = 0, warnCount = 0, cleanWindows = 0;
    const rateLimitInterval = setInterval(() => {
      if (eventCount > 50) {
        warnCount++; cleanWindows = 0;
        console.warn(`[RateLimit] ${socket.user.name} exceeded rate limit (${eventCount} events/sec)`);
        if (warnCount >= 3) { socket.disconnect(true); clearInterval(rateLimitInterval); }
      } else {
        if (++cleanWindows >= 3) { warnCount = 0; cleanWindows = 0; }
      }
      eventCount = 0;
    }, 1000);
    socket.use((_, next) => { if (++eventCount > 50) return next(new Error("Rate limit exceeded")); next(); });
    socket.on("disconnect", () => clearInterval(rateLimitInterval));

    // ─── RECONNECT: SYNC STATE ────────────────────────────
    socket.on("syncState", ({ roomCode }, callback) => {
      if (typeof roomCode !== "string") return;
      const room   = rooms.get(roomCode);
      if (!room)   return callback?.({ success: false, message: "Room not found" });
      const player = room.players.find(p => p.id === socket.user.id);
      if (!player) return callback?.({ success: false, message: "Not in this room" });

      player.socketId = socket.id;
      socket.join(roomCode);

      const state = {
        success: true, gameState: room.status,
        leaderboard: room.players.map(p => ({ id: p.id, name: p.name, avatarUrl: p.avatarUrl, score: p.score, currentQuestion: p.currentQuestion, correctAnswers: p.correctAnswers || 0, finished: p.finished, eliminated: p.eliminated || false, level: p.level || 1, winPercentage: p.winPercentage || 0 })).sort((a, b) => b.score - a.score),
        settings: { category: room.category, challengeMode: room.challengeMode, gameMode: room.gameMode || "classic", difficulty: room.difficulty, language: room.language, topic: room.topic, description: room.description, totalQuestions: room.totalQuestions, timerDuration: room.timerDuration },
      };

      if (room.status === "active" && !player.finished) {
        const q = room.questions[player.currentQuestion || 0];
        if (q) { state.currentQuestion = sanitizeQuestion(q, room.category, room.challengeMode, room, player.currentQuestion || 0); state.questionIndex = player.currentQuestion || 0; }
        const elapsed = Math.floor((Date.now() - room.startTime) / 1000);
        state.timeRemaining = Math.max(0, room.timerDuration - elapsed);
        state.startTime     = room.startTime;
      }

      callback?.(state);
      console.log(`[Socket] ${socket.user.name} synced state for room ${roomCode}`);
    });

    // ─── CREATE ROOM ──────────────────────────────────────
    socket.on("createRoom", (callback) => {
      let roomCode = generateRoomCode();
      while (rooms.has(roomCode)) roomCode = generateRoomCode();

      const room = {
        roomCode, hostId: socket.user.id, hostSocketId: socket.id,
        status: "waiting", category: null, challengeMode: "classic",
        gameMode: "classic", difficulty: "medium", language: "javascript",
        topic: "", description: "", totalQuestions: 5, timerDuration: 300,
        players: [makePlayer(socket.user, socket.id)],
        questions: [], pendingRequests: [], spectators: [],
        startTime: null, createdAt: Date.now(),
      };

      rooms.set(roomCode, room);
      socket.join(roomCode);
      userRoomMap.set(socket.user.id, roomCode);
      console.log(`[Socket] Room ${roomCode} created by ${socket.user.name}`);
      callback?.({ success: true, roomCode, room: safeRoomPayload(room) });
      broadcastRoomListUpdate(io);
    });

    // ─── JOIN ROOM ────────────────────────────────────────
    socket.on("joinRoom", ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);
      if (!room) return callback?.({ success: false, message: "Room not found" });

      const existing = room.players.find(p => p.id === socket.user.id);
      if (existing) {
        existing.socketId = socket.id;
        socket.join(roomCode);
        userRoomMap.set(socket.user.id, roomCode);
        return callback?.({ success: true, room: safeRoomPayload(room) });
      }

      if (room.status !== "waiting") return callback?.({ success: false, message: "Game already in progress" });

      const maxPlayers = room.gameMode === "duel" ? 2 : 20;
      if (room.players.length >= maxPlayers) return callback?.({ success: false, message: room.gameMode === "duel" ? "Duel rooms are limited to 2 players" : "Room is full" });

      room.players.push(makePlayer(socket.user, socket.id));
      socket.join(roomCode);
      userRoomMap.set(socket.user.id, roomCode);
      io.to(roomCode).emit("playerJoined", { players: room.players, newPlayer: socket.user.name });
      console.log(`[Socket] ${socket.user.name} joined room ${roomCode} (${room.players.length} players)`);
      callback?.({ success: true, room: safeRoomPayload(room) });
      broadcastRoomListUpdate(io);
    });

    // ─── UPDATE SETTINGS (host only) ─────────────────────
    socket.on("updateSettings", ({ roomCode, settings }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.user.id || !settings || typeof settings !== "object") return;

      const validCategories  = ["programming", "general"];
      const validModes       = ["classic", "scenario", "debug", "outage", "visual_interactive"];
      const validGameModes   = ["classic", "survival", "blitz", "team", "duel", "practice"];
      const validDifficulties = ["easy", "medium", "hard"];

      if (settings.category      && validCategories.includes(settings.category))     room.category      = settings.category;
      if (settings.challengeMode && validModes.includes(settings.challengeMode))      room.challengeMode = settings.challengeMode;
      if (settings.gameMode      && validGameModes.includes(settings.gameMode))       room.gameMode      = settings.gameMode;
      if (settings.difficulty    && validDifficulties.includes(settings.difficulty))  room.difficulty    = settings.difficulty;
      if (typeof settings.language      === "string") room.language       = settings.language.slice(0, 30);
      if (typeof settings.topic         === "string") room.topic          = settings.topic.slice(0, 200);
      if (typeof settings.description   === "string") room.description    = settings.description.slice(0, 500);
      if (typeof settings.totalQuestions === "number") room.totalQuestions = Math.max(1, Math.min(Math.floor(settings.totalQuestions), 10));
      if (typeof settings.timerDuration  === "number") room.timerDuration  = Math.max(60, Math.min(Math.floor(settings.timerDuration), 3600));

      // If question-affecting settings changed after generation, invalidate
      const questionKeys = ["category", "challengeMode", "difficulty", "language", "topic", "description", "totalQuestions"];
      if ((room.status === "ready" || room.status === "generating") && Object.keys(settings).some(k => questionKeys.includes(k))) {
        room.status    = "waiting";
        room.questions = [];
        io.to(roomCode).emit("gameStatus", { status: "cancelled" });
      }

      io.to(roomCode).emit("settingsUpdated", { category: room.category, challengeMode: room.challengeMode, gameMode: room.gameMode || "classic", difficulty: room.difficulty, language: room.language, topic: room.topic, description: room.description, totalQuestions: room.totalQuestions, timerDuration: room.timerDuration });
    });

    // ─── START GAME (host — generates questions) ──────────
    socket.on("startGame", async ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);
      if (!room)                            return callback?.({ success: false, message: "Room not found. It may have expired — please create a new room." });
      if (room.hostId !== socket.user.id)   return callback?.({ success: false, message: "Only the host can start the game" });
      if (!room.category)                   return callback?.({ success: false, message: "Select a category first" });
      if (room.players.length < 1)          return callback?.({ success: false, message: "Need at least 1 player" });

      const modeMin    = { duel: 2, survival: 2, team: 2 };
      const modeLabels = { duel: "Duel", survival: "Survival", team: "Team Battle" };
      const required   = modeMin[room.gameMode];
      if (required && room.players.length < required) return callback?.({ success: false, message: `${modeLabels[room.gameMode]} mode requires at least ${required} players` });

      if (room.status === "ready" && room.questions?.length > 0) {
        io.to(roomCode).emit("gameStatus", { status: "ready", totalQuestions: room.questions.length });
        return callback?.({ success: true });
      }
      if (room.status === "generating") return callback?.({ success: false, message: "Questions are already being generated" });

      try {
        room.status = "generating";
        io.to(roomCode).emit("gameStatus", { status: "generating" });

        const questions = await generateCompetitionQuestions({ category: room.category, challengeMode: room.challengeMode || "classic", difficulty: room.difficulty, language: room.language, topic: room.topic, description: room.description, totalQuestions: room.totalQuestions });

        room.questions = questions;
        room.status    = "ready";
        io.to(roomCode).emit("gameStatus", { status: "ready", totalQuestions: questions.length });
        console.log(`[Socket] Questions ready in room ${roomCode} — ${questions.length} questions`);
        callback?.({ success: true });
      } catch (err) {
        console.error("[Socket] Error generating questions:", err);
        if (rooms.has(roomCode)) rooms.get(roomCode).status = "waiting";
        const isQuota = err.message === "QUOTA_EXCEEDED";
        const message = isQuota ? "AI quota exceeded. Please try again later." : "Failed to generate questions. Please try again.";
        callback?.({ success: false, message });
        io.to(roomCode).emit("gameStatus", { status: "error", message });
      }
    });

    // ─── LAUNCH GAME (host confirms after questions ready) ─
    socket.on("launchGame", ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);
      if (!room)                              return callback?.({ success: false, message: "Room not found" });
      if (room.hostId !== socket.user.id)     return callback?.({ success: false, message: "Only the host can launch the game" });
      if (room.status !== "ready" || !room.questions.length) return callback?.({ success: false, message: "Questions are not ready yet" });

      const launchMin = { duel: 2, survival: 2, team: 2 };
      const launchLabels = { duel: "Duel", survival: "Survival", team: "Team Battle" };
      const required = launchMin[room.gameMode];
      if (required && room.players.length < required) return callback?.({ success: false, message: `${launchLabels[room.gameMode]} mode requires at least ${required} players` });
      if (room.gameMode === "team" && room.players.length % 2 !== 0) return callback?.({ success: false, message: "Team Battle requires an even number of players." });

      room.status    = "active";
      room.startTime = Date.now();

      if (room.gameMode === "team") {
        const half = Math.ceil(room.players.length / 2);
        room.playerTeam = {};
        room.players.forEach((p, i) => { room.playerTeam[p.id] = i < half ? 0 : 1; });
      }

      if (room.gameMode === "survival") {
        room.roundAnswers = {};
        room.roundIndex   = 0;
        room._roundTimer  = setTimeout(() => {
          if (room.status !== "active") return;
          room.players.filter(p => !p.eliminated && !p.finished).forEach(p => { if (!room.roundAnswers[p.id]) room.roundAnswers[p.id] = { isCorrect: false }; });
          processSurvivalRound(io, roomCode, room);
        }, 30000);
      }

      const firstQ = sanitizeQuestion(room.questions[0], room.category, room.challengeMode, room, 0);
      io.to(roomCode).emit("gameStarted", { totalQuestions: room.questions.length, timerDuration: room.timerDuration, question: firstQ, questionIndex: 0, isPower: room.questions.length === 1, category: room.category, challengeMode: room.challengeMode || "classic", gameMode: room.gameMode || "classic", playerTeam: room.playerTeam || null, language: room.language });

      startRoomTimer(io, roomCode, room, endGame);

      if (room.gameMode === "blitz") room.players.forEach(p => setBlitzQuestionTimer(io, roomCode, room, p, 0));

      console.log(`[Socket] Game launched in room ${roomCode} — ${room.questions.length} questions`);
      callback?.({ success: true });
    });

    // ─── CANCEL GAME ──────────────────────────────────────
    socket.on("cancelGame", ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.user.id) return callback?.({ success: false, message: !room ? "Room not found" : "Only the host can cancel" });
      room.status = "waiting"; room.questions = [];
      io.to(roomCode).emit("gameStatus", { status: "cancelled" });
      console.log(`[Socket] Game cancelled in room ${roomCode}`);
      callback?.({ success: true });
    });

    // ─── RESET ROOM (play again) ──────────────────────────
    socket.on("resetRoom", ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);
      if (!room)                            return callback?.({ success: false, message: "Room not found" });
      if (room.hostId !== socket.user.id)   return callback?.({ success: false, message: "Only the host can reset" });
      if (room.status !== "finished")       return callback?.({ success: false, message: "Room is still active" });
      resetRoomState(room);
      io.to(roomCode).emit("roomReset", { room: safeRoomPayload(room) });
      callback?.({ success: true });
      broadcastRoomListUpdate(io);
      console.log(`[Socket] Room ${roomCode} reset by ${socket.user.name}`);
    });

    // ─── SET READY ────────────────────────────────────────
    socket.on("setReady", ({ roomCode, ready }, callback) => {
      const room   = rooms.get(roomCode);
      if (!room || room.status !== "waiting") return callback?.({ success: false });
      const player = room.players.find(p => p.id === socket.user.id);
      if (!player) return callback?.({ success: false });
      player.ready = Boolean(ready);
      const readyCount = room.players.filter(p => p.ready).length;
      io.to(roomCode).emit("playerReadyUpdate", { playerId: socket.user.id, ready: player.ready, readyCount, totalPlayers: room.players.length });
      callback?.({ success: true });
    });

    // ─── REQUEST REMATCH ──────────────────────────────────
    socket.on("requestRematch", ({ roomCode }, callback) => {
      const room   = rooms.get(roomCode);
      if (!room || room.status !== "finished") return callback?.({ success: false });
      const player = room.players.find(p => p.id === socket.user.id);
      if (!player) return callback?.({ success: false });

      if (!room.rematchVotes) room.rematchVotes = new Set();
      room.rematchVotes.add(socket.user.id);

      const voteCount  = room.rematchVotes.size;
      const voterNames = [...room.rematchVotes].map(id => room.players.find(p => p.id === id)?.name).filter(Boolean);
      io.to(roomCode).emit("rematchUpdate", { voteCount, totalPlayers: room.players.length, voterNames });

      if (voteCount >= room.players.length && room.players.length >= 2) {
        room.rematchVotes = null;
        resetRoomState(room);
        io.to(roomCode).emit("roomReset", { room: safeRoomPayload(room) });
        broadcastRoomListUpdate(io);
      }
      callback?.({ success: true, voteCount, totalPlayers: room.players.length });
    });

    // ─── SUBMIT ANSWER ────────────────────────────────────
    socket.on("submitAnswer", ({ roomCode, questionIndex, answer }, callback) => {
      if (typeof roomCode !== "string") return;
      if (typeof questionIndex !== "number" || !Number.isInteger(questionIndex) || questionIndex < 0) return;
      if (answer === undefined || answer === null) return;
      if (typeof answer === "string" && answer.length > 500) return;
      if (typeof answer === "object" && JSON.stringify(answer).length > 5000) return;

      const room = rooms.get(roomCode);
      if (!room || room.status !== "active") return;
      if (questionIndex >= (room.questions?.length || 0)) return;

      const player = room.players.find(p => p.id === socket.user.id);
      if (!player || player.finished || player.eliminated) return;
      if (questionIndex !== player.currentQuestion) return; // prevent double-submit

      const question = room.questions[questionIndex];
      if (!question) return;

      const now           = Date.now();
      const questionElapsed = (now - (player.lastQuestionTime || room.startTime)) / 1000;
      const isPowerQuestion = room.questions.length > 1 && questionIndex === room.questions.length - 1;

      // Clear blitz per-question timer
      if (room.gameMode === "blitz" && room._blitzTimers) {
        clearTimeout(room._blitzTimers.get(player.id));
        room._blitzTimers.delete(player.id);
      }

      const { isCorrect, pointsEarned: basePoints, correctAnswerData } = gradeAnswer({ question, answer, room, questionIndex, questionElapsed, isPowerQuestion });

      let pointsEarned = basePoints;
      if (isCorrect) {
        player.comboCount    = (player.comboCount || 0) + 1;
        const comboMult      = player.comboCount >= 7 ? 1.3 : player.comboCount >= 5 ? 1.2 : player.comboCount >= 3 ? 1.1 : 1.0;
        pointsEarned         = Math.round(pointsEarned * comboMult);
        player.score        += pointsEarned;
        player.correctAnswers = (player.correctAnswers || 0) + 1;
      } else {
        player.comboCount = 0;
      }

      player.currentQuestion  = questionIndex + 1;
      player.lastQuestionTime = now;
      if (questionIndex + 1 >= room.questions.length) { player.finished = true; player.finishTime = now; }

      scheduleLeaderboardBroadcast(io, roomCode, room);
      callback?.({ isCorrect, pointsEarned, comboCount: player.comboCount || 0, correctAnswer: correctAnswerData, explanation: question.explanation || null });

      // Survival: wait for all active players before advancing round
      if (room.gameMode === "survival") {
        if (!room.roundAnswers) room.roundAnswers = {};
        room.roundAnswers[player.id] = { isCorrect, pointsEarned };
        const active = room.players.filter(p => !p.eliminated && !p.finished);
        if (active.every(p => room.roundAnswers[p.id] !== undefined)) processSurvivalRound(io, roomCode, room);
        return;
      }

      if (!player.finished) {
        const nextIndex = questionIndex + 1;
        const nextQ     = sanitizeQuestion(room.questions[nextIndex], room.category, room.challengeMode, room, nextIndex);
        socket.emit("nextQuestion", { question: nextQ, questionIndex: nextIndex, isPower: room.questions.length > 1 && nextIndex === room.questions.length - 1 });
        if (room.gameMode === "blitz") setBlitzQuestionTimer(io, roomCode, room, player, nextIndex);
      } else {
        const timeTaken   = Math.floor((player.finishTime - room.startTime) / 1000);
        const currentRank = room.players.filter(p => p.score > player.score).length + 1;
        socket.emit("playerFinished", { score: player.score, rank: currentRank, timeTaken, correctAnswers: player.correctAnswers || 0, totalQuestions: room.questions.length });
        io.to(roomCode).emit("playerFinishedUpdate", { playerId: player.id, playerName: player.name, finished: true });
      }

      if (room.players.every(p => p.finished || p.eliminated)) endGame(io, roomCode, room);
    });

    // ─── PLAYER STARTED (Q0 speed bonus timer fix) ───────
    socket.on("playerStarted", ({ roomCode }) => {
      const room   = rooms.get(roomCode);
      if (!room || room.status !== "active") return;
      const player = room.players.find(p => p.id === socket.user.id);
      if (player && player.currentQuestion === 0 && !player.lastQuestionTime) player.lastQuestionTime = Date.now();
    });

    // ─── TIMER SYNC ───────────────────────────────────────
    socket.on("getTimerSync", ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);
      if (!room || room.status !== "active") return callback?.({});
      const elapsed = Math.floor((Date.now() - room.startTime) / 1000);
      callback?.({ remaining: Math.max(0, room.timerDuration - elapsed) });
    });

    // ─── REQUEST JOIN (public, needs host approval) ───────
    socket.on("requestJoin", ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);
      if (!room)                             return callback?.({ success: false, message: "Room not found" });
      if (room.status === "finished")        return callback?.({ success: false, message: "Game has ended" });
      if (room.players.length >= 20)         return callback?.({ success: false, message: "Room is full" });
      if (room.players.find(p => p.id === socket.user.id))        return callback?.({ success: false, message: "You are already in this room" });
      if (room.pendingRequests.find(r => r.id === socket.user.id)) return callback?.({ success: false, message: "Request already sent" });

      room.pendingRequests.push({ id: socket.user.id, socketId: socket.id, name: socket.user.name, avatarUrl: socket.user.avatarUrl });

      const hostPlayer = room.players.find(p => p.id === room.hostId);
      if (hostPlayer) {
        io.to(hostPlayer.socketId).emit("joinRequest", { roomCode, requester: { id: socket.user.id, name: socket.user.name, avatarUrl: socket.user.avatarUrl } });
        console.log(`[Socket] ${socket.user.name} requested to join room ${roomCode}`);
        callback?.({ success: true, message: "Join request sent! Waiting for host approval." });
      } else {
        callback?.({ success: false, message: "Host is not in the room" });
      }
    });

    // ─── APPROVE JOIN ─────────────────────────────────────
    socket.on("approveJoin", ({ roomCode, requesterId }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.user.id) return;
      const reqIndex = room.pendingRequests.findIndex(r => r.id === requesterId);
      if (reqIndex === -1) return;

      const requester = room.pendingRequests[reqIndex];
      room.pendingRequests.splice(reqIndex, 1);

      const maxSlots = room.gameMode === "duel" ? 2 : 20;
      if (room.players.length >= maxSlots) {
        io.to(requester.socketId).emit("joinDenied", { roomCode, message: room.gameMode === "duel" ? "Duel rooms are limited to 2 players." : "Room is full." });
        return;
      }

      room.players.push(makePlayer({ id: requester.id, name: requester.name, avatarUrl: requester.avatarUrl, level: 1, winPercentage: 0 }, requester.socketId));

      io.to(requester.socketId).emit("joinApproved", { roomCode, room: { roomCode: room.roomCode, hostId: room.hostId, status: room.status, category: room.category, challengeMode: room.challengeMode, difficulty: room.difficulty, language: room.language, topic: room.topic, description: room.description, totalQuestions: room.totalQuestions, timerDuration: room.timerDuration, players: room.players.map(p => ({ id: p.id, name: p.name, avatarUrl: p.avatarUrl, score: p.score })) } });
      io.to(roomCode).emit("playerJoined", { players: room.players, newPlayer: requester.name });

      const requesterSocket = io.sockets.sockets.get(requester.socketId);
      if (requesterSocket) requesterSocket.join(roomCode);
      broadcastRoomListUpdate(io);
      console.log(`[Socket] ${requester.name} approved to join room ${roomCode}`);
    });

    // ─── DENY JOIN ────────────────────────────────────────
    socket.on("denyJoin", ({ roomCode, requesterId }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.user.id) return;
      const reqIndex = room.pendingRequests.findIndex(r => r.id === requesterId);
      if (reqIndex === -1) return;
      const requester = room.pendingRequests[reqIndex];
      room.pendingRequests.splice(reqIndex, 1);
      io.to(requester.socketId).emit("joinDenied", { roomCode, message: "Your join request was declined." });
      console.log(`[Socket] ${requester.name} denied from room ${roomCode}`);
    });

    // ─── SPECTATE ROOM ────────────────────────────────────
    socket.on("spectateRoom", ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);
      if (!room) return callback?.({ success: false, message: "Room not found" });

      if (!room.spectators.find(s => s.id === socket.user.id)) room.spectators.push({ id: socket.user.id, socketId: socket.id, name: socket.user.name });
      socket.join(roomCode);

      const elapsed   = room.startTime ? Math.floor((Date.now() - room.startTime) / 1000) : 0;
      const remaining = room.startTime ? Math.max(0, room.timerDuration - elapsed) : room.timerDuration;

      callback?.({ success: true, room: { roomCode: room.roomCode, status: room.status, category: room.category, topic: room.topic, difficulty: room.difficulty, language: room.language, timerDuration: room.timerDuration, timeRemaining: remaining, playerCount: room.players.length, leaderboard: room.players.map(p => ({ id: p.id, name: p.name, avatarUrl: p.avatarUrl, score: p.score, currentQuestion: p.currentQuestion, finished: p.finished })).sort((a, b) => b.score - a.score), hostName: room.players.find(p => p.id === room.hostId)?.name || "Unknown" } });
      console.log(`[Socket] ${socket.user.name} spectating room ${roomCode}`);
    });

    // ─── LEAVE ROOM ───────────────────────────────────────
    socket.on("leaveRoom",  ({ roomCode }) => handleLeave(io, socket, roomCode));
    socket.on("disconnect", () => {
      console.log(`[Socket] ${socket.user.name} disconnected`);
      const code = userRoomMap.get(socket.user.id);
      if (code) handleLeave(io, socket, code);
    });
  });
}

// ─── HANDLE LEAVE ─────────────────────────────────────────
async function handleLeave(io, socket, roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const playerIndex   = room.players.findIndex(p => p.id === socket.user.id);
  const spectatorIndex = room.spectators.findIndex(s => s.id === socket.user.id);

  if (playerIndex !== -1) {
    const player = room.players[playerIndex];

    if (room.status === "active") {
      try {
        await CompetitionResult.create({ userId: player.id, roomCode, category: room.category, challengeMode: room.challengeMode || "classic", difficulty: room.difficulty, rank: null, score: player.score, status: "dnf" });
        console.log(`[Result] Recorded DNF for ${player.name} in room ${roomCode}`);
      } catch (err) { console.error("Error saving DNF result:", err); }
    }

    room.players.splice(playerIndex, 1);
    userRoomMap.delete(socket.user.id);
    io.to(roomCode).emit("playerLeft", { playerId: player.id, leftPlayer: player.name, players: room.players });

    if (room.status === "active") {
      if (room.players.length === 0 || room.players.every(p => p.finished || p.eliminated)) { endGame(io, roomCode, room); return; }
    }

    if (player.id === room.hostId) {
      if (room.players.length > 0) {
        room.hostId       = room.players[0].id;
        room.hostSocketId = room.players[0].socketId;
        io.to(roomCode).emit("newHost",    { hostId: room.hostId, hostName: room.players[0].name });
        io.to(roomCode).emit("gameStatus", { message: `Host left. ${room.players[0].name} is now the host.` });
      } else {
        rooms.delete(roomCode);
        console.log(`[Socket] Room ${roomCode} deleted (host left, empty)`);
        broadcastRoomListUpdate(io);
      }
    }
  } else if (spectatorIndex !== -1) {
    room.spectators.splice(spectatorIndex, 1);
  }

  socket.leave(roomCode);
}
