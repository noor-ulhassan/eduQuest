import { CompetitionResult }       from "../models/CompetitionResult.model.js";
import { processEvent, XP_EVENTS, computeXP } from "../services/GamificationService.js";
import { addXP }                  from "../utils/progression.js";
import { User }                   from "../models/user.model.js";
import { leaderboardTimers }      from "./helpers.js";
import { rooms }                  from "./store.js";
import { broadcastRoomListUpdate } from "./helpers.js";

export async function endGame(io, roomCode, room) {
  if (room.status === "finished") return; // prevent double-trigger
  room.status  = "finished";
  room.endTime = Date.now();

  // Cancel any pending leaderboard broadcast
  clearTimeout(leaderboardTimers.get(roomCode));
  leaderboardTimers.delete(roomCode);

  // Clear all timers
  if (room._timerInterval) clearInterval(room._timerInterval);
  if (room._roundTimer)    { clearTimeout(room._roundTimer); room._roundTimer = null; }
  if (room._blitzTimers)   { room._blitzTimers.forEach(t => clearTimeout(t)); room._blitzTimers.clear(); }

  // Build final leaderboard
  const finalLeaderboard = room.players.map(p => {
    const perfectScore = p.finished && !p.eliminated &&
      (p.correctAnswers || 0) === room.questions.length && room.questions.length > 0;
    return {
      id:             p.id,
      name:           p.name,
      avatarUrl:      p.avatarUrl,
      score:          perfectScore ? p.score + 50 : p.score, // +50 for perfect accuracy
      currentQuestion: p.currentQuestion,
      correctAnswers: p.correctAnswers || 0,
      finished:       p.finished,
      eliminated:     p.eliminated || false,
      perfectScore,
      timeTaken:      p.finishTime ? Math.floor((p.finishTime - room.startTime) / 1000) : null,
    };
  }).sort((a, b) => {
    if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
    if (b.score !== a.score) return b.score - a.score;
    if (a.timeTaken === null && b.timeTaken === null) return 0;
    if (a.timeTaken === null) return 1;
    if (b.timeTaken === null) return -1;
    return a.timeTaken - b.timeTaken;
  });

  const activePlayers = finalLeaderboard.filter(p => !p.eliminated && p.finished);
  const isDraw = activePlayers.length >= 2 && activePlayers[0].score === activePlayers[1].score;

  // Team scoring
  let teamScores = null;
  if (room.playerTeam) {
    teamScores = { 0: 0, 1: 0 };
    finalLeaderboard.forEach(p => {
      const team = room.playerTeam[p.id];
      if (team === 0 || team === 1) teamScores[team] += p.score;
    });
    const winningTeam = teamScores[0] > teamScores[1] ? 0 : teamScores[1] > teamScores[0] ? 1 : null;
    if (winningTeam !== null) {
      finalLeaderboard.forEach(p => {
        if (room.playerTeam[p.id] === winningTeam && p.finished && !p.eliminated) {
          p.score += 15;
          p.teamWinBonus = true;
        }
      });
      teamScores[winningTeam] += finalLeaderboard.filter(p => room.playerTeam[p.id] === winningTeam && p.teamWinBonus).length * 15;
    }
  }

  io.to(roomCode).emit("gameOver", { leaderboard: finalLeaderboard, playerTeam: room.playerTeam || null, teamScores, isDraw });

  // Practice mode — skip XP and DB, clean up quickly
  if (room.gameMode === "practice") {
    setTimeout(() => { rooms.delete(roomCode); broadcastRoomListUpdate(io); }, 60000);
    return;
  }

  awardXP(io, finalLeaderboard, room, finalLeaderboard.length, isDraw);

  try {
    // Remove any existing DNF records for these players (reconnect scenario)
    await CompetitionResult.deleteMany({
      roomCode,
      userId: { $in: finalLeaderboard.map(p => p.id) },
      status: "dnf",
    });

    const topScore    = finalLeaderboard[0]?.score ?? 0;
    const totalPlayers = finalLeaderboard.length;

    const results = finalLeaderboard.map((p, index) => {
      const isCompleted     = p.finished && !p.eliminated;
      const effectivePlacement = (isDraw && p.score === topScore) ? 0 : index;
      const xpAwarded = (isCompleted && p.score > 0)
        ? computeXP(XP_EVENTS.COMPETITION_FINISHED, { placement: effectivePlacement, score: p.score || 0, totalPlayers })
        : 0;
      return {
        userId:        p.id,
        roomCode,
        category:      room.category,
        challengeMode: room.challengeMode || "classic",
        difficulty:    room.difficulty,
        rank:          isCompleted ? index + 1 : null,
        score:         p.score || 0,
        xpAwarded,
        status:        isCompleted ? "completed" : "dnf",
      };
    });

    if (results.length > 0) {
      await CompetitionResult.insertMany(results);
      console.log(`[Result] Saved ${results.length} results for room ${roomCode}`);
    }
  } catch (err) {
    console.error("Error saving game results:", err);
  }

  setTimeout(() => {
    rooms.delete(roomCode);
    console.log(`[Socket] Room ${roomCode} cleaned up`);
    broadcastRoomListUpdate(io);
  }, 60000);
}

async function awardXP(io, leaderboard, room, totalPlayers = 2, isDraw = false) {
  const topScore = leaderboard[0]?.score ?? 0;
  await Promise.all(leaderboard.map(async (playerEntry, i) => {
    if (!playerEntry.finished || playerEntry.eliminated) return;

    // Participation XP even for zero-score finishers
    if (playerEntry.score <= 0) {
      try {
        const user = await User.findById(playerEntry.id);
        if (user) await addXP(user, 10, {}, { source: "PARTICIPATION", autoSave: true });
      } catch (_) {}
      return;
    }

    try {
      const user = await User.findById(playerEntry.id);
      if (!user) return;

      const prevXP     = user.xp;
      const prevLevel  = user.level;
      const prevLeague = user.league;
      const prevBadges = new Set((user.badges || []).map(b => b.title));

      const dbWins = await CompetitionResult.countDocuments({ userId: user._id, rank: 1, status: "completed" });
      const effectivePlacement = (isDraw && playerEntry.score === topScore) ? 0 : i;
      const totalWins = dbWins + (effectivePlacement === 0 ? 1 : 0);

      await processEvent(user, XP_EVENTS.COMPETITION_FINISHED, {
        placement: effectivePlacement,
        score:     playerEntry.score,
        totalPlayers,
        totalWins,
      });

      const xpGained  = Math.max(0, user.xp - prevXP);
      const leveledUp = user.level > prevLevel;
      const rankedUp  = user.league !== prevLeague;
      const newBadges = (user.badges || []).filter(b => !prevBadges.has(b.title));

      const player = room.players.find(p => String(p.id) === String(playerEntry.id));
      if (player?.socketId) {
        io.to(player.socketId).emit("userXPUpdated", {
          xpGained, leveledUp, rankedUp, newBadges,
          user: { xp: user.xp, level: user.level, league: user.league, badges: user.badges },
        });
      }
    } catch (err) {
      console.error(`[Socket] Error awarding XP for ${playerEntry.name}:`, err);
    }
  }));
}
