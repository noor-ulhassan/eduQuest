import { rooms, userRoomMap } from "./store.js";

// ─── ROOM CODE ────────────────────────────────────────────
export function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

// ─── PLAYER FACTORY ───────────────────────────────────────
// Single place where a player object is built — avoids 3 identical inline constructions.
export function makePlayer(socketUser, socketId) {
  return {
    id:               socketUser.id,
    socketId,
    name:             socketUser.name,
    avatarUrl:        socketUser.avatarUrl,
    score:            0,
    currentQuestion:  0,
    correctAnswers:   0,
    comboCount:       0,
    finished:         false,
    eliminated:       false,
    ready:            false,
    lastQuestionTime: null,
    finishTime:       null,
    level:            socketUser.level || 1,
    winPercentage:    socketUser.winPercentage || 0,
  };
}

// ─── ROOM RESET ───────────────────────────────────────────
// Resets a room back to waiting state — used by resetRoom and requestRematch.
export function resetRoomState(room) {
  if (room._timerInterval) { clearInterval(room._timerInterval); room._timerInterval = null; }
  if (room._roundTimer)    { clearTimeout(room._roundTimer);     room._roundTimer    = null; }
  if (room._blitzTimers)   { room._blitzTimers.forEach(t => clearTimeout(t)); room._blitzTimers.clear(); }

  Object.assign(room, {
    status:      "waiting",
    questions:   [],
    startTime:   null,
    endTime:     null,
    _shuffleMaps: {},
    roundAnswers: {},
    roundIndex:  0,
    playerTeam:  null,
  });

  room.players.forEach(p => {
    p.score = 0; p.currentQuestion = 0; p.correctAnswers = 0; p.comboCount = 0;
    p.finished = false; p.eliminated = false; p.ready = false;
    p.lastQuestionTime = null; p.finishTime = null;
  });
}

// ─── SAFE ROOM PAYLOAD ────────────────────────────────────
// Strips questions/answers before sending room data to clients.
export function safeRoomPayload(room) {
  return {
    roomCode:      room.roomCode,
    hostId:        room.hostId,
    status:        room.status,
    category:      room.category,
    challengeMode: room.challengeMode,
    gameMode:      room.gameMode || "classic",
    difficulty:    room.difficulty,
    language:      room.language,
    topic:         room.topic,
    description:   room.description,
    totalQuestions: room.totalQuestions,
    timerDuration: room.timerDuration,
    pendingRequests: room.pendingRequests,
    players: room.players.map(p => ({
      id:            p.id,
      name:          p.name,
      avatarUrl:     p.avatarUrl || null,
      score:         p.score,
      finished:      p.finished,
      ready:         p.ready || false,
      level:         p.level || 1,
      winPercentage: p.winPercentage || 0,
    })),
    createdAt: room.createdAt,
  };
}

// ─── SANITIZE QUESTION ────────────────────────────────────
// Strips server-only fields (correctOrder, correctAnswer, etc.) before sending to client.
export function sanitizeQuestion(question, category, challengeMode = "classic", room = null, questionIndex = 0) {
  if (category === "general" || challengeMode !== "classic") {
    const base = {
      question:        question.question,
      options:         question.options,
      difficulty:      question.difficulty,
      interactionType: question.interactionType,
    };

    if (question.scenario)  base.scenario  = question.scenario;
    if (question.buggyCode) base.buggyCode = question.buggyCode;
    if (question.contextCode) base.contextCode = question.contextCode;

    if (question.interactionType === "drag_order") {
      base.items = question.items;

    } else if (question.interactionType === "drag_match") {
      // Shuffle right column per-room so all players see the same shuffle
      const leftItems  = question.pairs.map(p => p.left);
      const rightItems = question.pairs.map(p => p.right);
      if (!room) return base;
      if (!room._shuffleMaps) room._shuffleMaps = {};
      const mapKey = `q${questionIndex}_dragMatch`;
      if (!room._shuffleMaps[mapKey]) {
        const indices = rightItems.map((_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        room._shuffleMaps[mapKey] = indices;
      }
      base.pairs = { left: leftItems, right: room._shuffleMaps[mapKey].map(i => rightItems[i]) };

    } else if (question.interactionType === "fill_blank") {
      base.codeTemplate = question.codeTemplate;
      base.hint         = question.hint;

    } else if (question.interactionType === "predict_output") {
      base.codeSnippet = question.codeSnippet;
      base.language    = room?.language || "javascript";

    } else if (question.interactionType === "slider_adjust") {
      // Send config WITHOUT correctValue/tolerance
      base.sliders = question.sliders?.map(s => ({ label: s.label, unit: s.unit, min: s.min, max: s.max, step: s.step }));

    } else if (question.interactionType === "visual_sequence") {
      base.gridConfig = question.gridConfig;
      base.items      = question.items;
      base.context    = question.context;

    } else if (question.interactionType === "code_trace") {
      base.codeSnippet = question.codeSnippet;
      base.steps       = question.steps;
      base.language    = room?.language || "javascript";
    }

    return base;
  }

  // Classic programming mode — send code challenge fields
  return {
    title:       question.title,
    description: question.description,
    starterCode: question.starterCode,
    testCases:   question.testCases,
    difficulty:  question.difficulty,
  };
}

// ─── LEADERBOARD BROADCAST (throttled 500ms per room) ─────
const leaderboardTimers = new Map();

export function scheduleLeaderboardBroadcast(io, roomCode, room) {
  if (leaderboardTimers.has(roomCode)) return;
  leaderboardTimers.set(roomCode, setTimeout(() => {
    leaderboardTimers.delete(roomCode);
    if (!room || room.status === "finished") return;
    const leaderboard = room.players.map(p => ({
      id:             p.id,
      name:           p.name,
      avatarUrl:      p.avatarUrl,
      score:          p.score,
      currentQuestion: p.currentQuestion,
      correctAnswers: p.correctAnswers || 0,
      comboCount:     p.comboCount || 0,
      finished:       p.finished,
      eliminated:     p.eliminated || false,
      team:           room.playerTeam ? room.playerTeam[p.id] : null,
      level:          p.level || 1,
      winPercentage:  p.winPercentage || 0,
    })).sort((a, b) => b.score - a.score);
    io.to(roomCode).emit("leaderboardUpdate", { leaderboard, spectatorCount: (room.spectators || []).length });
  }, 500));
}

export { leaderboardTimers };

// ─── ROOM LIST BROADCAST (debounced 300ms) ────────────────
let roomListTimer = null;

export function broadcastRoomListUpdate(io) {
  if (roomListTimer) return;
  roomListTimer = setTimeout(() => {
    roomListTimer = null;
    const activeRooms = [];
    for (const [code, room] of rooms) {
      if (room.status !== "waiting" && room.status !== "active") continue;
      const hostPlayer = room.players.find(p => p.id === room.hostId);
      activeRooms.push({
        roomCode:       code,
        hostName:       hostPlayer?.name || "Unknown",
        hostAvatar:     hostPlayer?.avatarUrl || null,
        status:         room.status,
        category:       room.category,
        topic:          room.topic || null,
        description:    room.description || null,
        difficulty:     room.difficulty,
        language:       room.language,
        playerCount:    room.players.length,
        players:        room.players.map(p => ({ id: p.id, name: p.name, avatarUrl: p.avatarUrl || null, level: p.level || 1, winPercentage: p.winPercentage || 0 })),
        spectatorCount: (room.spectators || []).length,
        maxPlayers:     20,
        timerDuration:  room.timerDuration,
        createdAt:      room.createdAt,
      });
    }
    activeRooms.sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (b.status === "active" && a.status !== "active") return 1;
      return b.createdAt - a.createdAt;
    });
    io.emit("roomListUpdate", { rooms: activeRooms });
  }, 300);
}

// ─── ROOM TIMER ───────────────────────────────────────────
export function startRoomTimer(io, roomCode, room, endGameFn) {
  let lastSync = 0;
  const interval = setInterval(() => {
    const elapsed    = Math.floor((Date.now() - room.startTime) / 1000);
    const remaining  = room.timerDuration - elapsed;
    if (remaining <= 0 || room.status === "finished") {
      clearInterval(interval);
      if (room.status !== "finished") endGameFn(io, roomCode, room);
      return;
    }
    const now = Date.now();
    if (now - lastSync >= 30000) {
      lastSync = now;
      io.to(roomCode).emit("timerSync", { remaining, serverTime: now });
    }
  }, 1000);
  room._timerInterval = interval;
}
