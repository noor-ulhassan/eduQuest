import { sanitizeQuestion, scheduleLeaderboardBroadcast } from "./helpers.js";
import { endGame } from "./endGame.js";

// ─── SURVIVAL MODE ────────────────────────────────────────
// Called after every player in the current round has answered (or the round timer expired).
// Eliminates the lowest scorer, sends the next question to survivors.
export function processSurvivalRound(io, roomCode, room) {
  if (room._roundTimer) { clearTimeout(room._roundTimer); room._roundTimer = null; }
  if (room.status !== "active") return;

  const active = room.players.filter(p => !p.eliminated && !p.finished);
  if (active.length <= 1) { endGame(io, roomCode, room); return; }

  // Eliminate player(s) with lowest score, tiebroken by correctAnswers
  const sorted = [...active].sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return (a.correctAnswers || 0) - (b.correctAnswers || 0);
  });
  const lowestScore   = sorted[0].score;
  const lowestCorrect = sorted[0].correctAnswers || 0;
  const toEliminate   = sorted.filter(p => p.score === lowestScore && (p.correctAnswers || 0) === lowestCorrect);
  const roundsPlayed  = (room.roundIndex || 0) + 1;

  toEliminate.forEach(p => {
    p.eliminated = true;
    p.finished   = true;
    p.finishTime = Date.now();
    const sock = io.sockets.sockets.get(p.socketId);
    if (sock) sock.emit("playerEliminated", { score: p.score, correctAnswers: p.correctAnswers || 0, totalQuestions: roundsPlayed });
    io.to(roomCode).emit("playerEliminatedUpdate", { playerId: p.id, playerName: p.name });
  });

  room.roundAnswers = {};
  room.roundIndex   = (room.roundIndex || 0) + 1;

  const stillActive = room.players.filter(p => !p.eliminated && !p.finished);
  scheduleLeaderboardBroadcast(io, roomCode, room);

  if (stillActive.length <= 1 || room.roundIndex >= room.questions.length) {
    endGame(io, roomCode, room);
    return;
  }

  // Send the next question to all survivors simultaneously
  const nextQ = room.questions[room.roundIndex];
  const now   = Date.now();
  stillActive.forEach(p => {
    p.currentQuestion  = room.roundIndex;
    p.lastQuestionTime = now;
    const sanitized = sanitizeQuestion(nextQ, room.category, room.challengeMode, room, room.roundIndex);
    const pSocket = io.sockets.sockets.get(p.socketId);
    if (pSocket) pSocket.emit("nextQuestion", {
      question:      sanitized,
      questionIndex: room.roundIndex,
      isPower:       room.questions.length > 1 && room.roundIndex === room.questions.length - 1,
    });
  });

  // 30s auto-submit timer for non-responders
  room._roundTimer = setTimeout(() => {
    if (room.status !== "active") return;
    room.players.filter(p => !p.eliminated && !p.finished)
      .forEach(p => { if (!room.roundAnswers[p.id]) room.roundAnswers[p.id] = { isCorrect: false }; });
    processSurvivalRound(io, roomCode, room);
  }, 30000);
}

// ─── BLITZ MODE ───────────────────────────────────────────
// Sets a 15s per-question timer for a specific player.
// If they don't answer in time, their question is skipped.
export function setBlitzQuestionTimer(io, roomCode, room, player, questionIndex) {
  if (!room._blitzTimers) room._blitzTimers = new Map();
  clearTimeout(room._blitzTimers.get(player.id));

  const timer = setTimeout(() => {
    if (room.status !== "active" || player.currentQuestion !== questionIndex || player.finished) return;
    room._blitzTimers.delete(player.id);

    player.currentQuestion  = questionIndex + 1;
    player.lastQuestionTime = Date.now();
    scheduleLeaderboardBroadcast(io, roomCode, room);

    const nextIndex  = questionIndex + 1;
    const playerSock = io.sockets.sockets.get(player.socketId);

    if (nextIndex >= room.questions.length) {
      player.finished  = true;
      player.finishTime = Date.now();
      const timeTaken   = Math.floor((player.finishTime - room.startTime) / 1000);
      const currentRank = room.players.filter(p => p.score > player.score).length + 1;
      if (playerSock) playerSock.emit("playerFinished", { score: player.score, rank: currentRank, timeTaken, correctAnswers: player.correctAnswers || 0, totalQuestions: room.questions.length });
      io.to(roomCode).emit("playerFinishedUpdate", { playerId: player.id, playerName: player.name, finished: true });
      if (room.players.every(p => p.finished)) endGame(io, roomCode, room);
    } else {
      const nextQ = sanitizeQuestion(room.questions[nextIndex], room.category, room.challengeMode, room, nextIndex);
      if (playerSock) playerSock.emit("nextQuestion", { question: nextQ, questionIndex: nextIndex, isPower: room.questions.length > 1 && nextIndex === room.questions.length - 1 });
      setBlitzQuestionTimer(io, roomCode, room, player, nextIndex);
    }
  }, 15000);

  room._blitzTimers.set(player.id, timer);
}
