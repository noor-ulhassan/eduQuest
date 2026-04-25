import mongoose from "mongoose";
import { getRooms } from "../socket/roomHandler.js";
import { CompetitionResult } from "../models/CompetitionResult.model.js";

// ... existing code ...

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Single aggregation pipeline with $facet to compute all stats in one DB round-trip
    const [pipeline] = await CompetitionResult.aggregate([
      { $match: { userId: userObjectId } },
      {
        $facet: {
          // Core counts
          summary: [
            {
              $group: {
                _id: null,
                totalGames: { $sum: 1 },
                wins: {
                  $sum: {
                    $cond: [
                      { $and: [{ $eq: ["$rank", 1] }, { $eq: ["$status", "completed"] }] },
                      1,
                      0,
                    ],
                  },
                },
                dnf: {
                  $sum: { $cond: [{ $eq: ["$status", "dnf"] }, 1, 0] },
                },
              },
            },
          ],
          // Score stats (completed games only)
          scores: [
            { $match: { status: "completed" } },
            {
              $group: {
                _id: null,
                avgScore: { $avg: "$score" },
                bestScore: { $max: "$score" },
              },
            },
          ],
          // Category distribution
          categories: [
            { $group: { _id: "$category", value: { $sum: 1 } } },
          ],
          // Mode distribution
          modes: [
            { $group: { _id: "$challengeMode", value: { $sum: 1 } } },
          ],
          // Recent activity (last 10 games, newest first)
          recent: [
            { $sort: { timestamp: -1 } },
            { $limit: 10 },
            {
              $project: {
                score: 1,
                rank: 1,
                status: 1,
                timestamp: 1,
              },
            },
          ],
          // Streak: sorted recent results for JS iteration (eliminates second DB call)
          streak: [
            { $sort: { timestamp: -1 } },
            { $limit: 100 },
            { $project: { rank: 1, status: 1 } },
          ],
        },
      },
    ]);

    const summary = pipeline.summary[0] || { totalGames: 0, wins: 0, dnf: 0 };
    const scores = pipeline.scores[0] || { avgScore: 0, bestScore: 0 };

    if (summary.totalGames === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalGames: 0,
          wins: 0,
          losses: 0,
          dnf: 0,
          winRate: 0,
          currentStreak: 0,
          avgScore: 0,
          bestScore: 0,
          recentActivity: [],
          categoryDistribution: [],
          modeDistribution: [],
        },
      });
    }

    const { totalGames, wins, dnf } = summary;
    const losses = totalGames - wins - dnf;
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;

    let currentStreak = 0;
    for (const r of pipeline.streak || []) {
      if (r.rank === 1 && r.status === "completed") currentStreak++;
      else break;
    }

    const categoryDistribution = pipeline.categories.map((c) => ({
      name: (c._id || "unknown").charAt(0).toUpperCase() + (c._id || "unknown").slice(1),
      value: c.value,
    }));

    const modeDistribution = pipeline.modes.map((m) => ({
      name: (m._id || "classic").charAt(0).toUpperCase() + (m._id || "classic").slice(1),
      value: m.value,
    }));

    const recentActivity = pipeline.recent
      .reverse() // Chronological order for graph
      .map((r) => ({
        date: new Date(r.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        score: r.score || 0,
        rank: r.rank || 0,
        status: r.status,
      }));

    res.status(200).json({
      success: true,
      stats: {
        totalGames,
        wins,
        losses,
        dnf,
        winRate,
        currentStreak,
        avgScore: Math.round(scores.avgScore || 0),
        bestScore: scores.bestScore || 0,
        recentActivity,
        categoryDistribution,
        modeDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRoomInfo = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const rooms = getRooms();
    const room = rooms.get(roomCode);

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    return res.status(200).json({
      success: true,
      room: {
        roomCode: room.roomCode,
        hostId: room.hostId,
        status: room.status,
        category: room.category,
        difficulty: room.difficulty,
        language: room.language,
        topic: room.topic,
        description: room.description,
        totalQuestions: room.totalQuestions,
        timerDuration: room.timerDuration,
        playerCount: room.players.length,
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          avatarUrl: p.avatarUrl,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllActiveRooms = async (req, res) => {
  try {
    const rooms = getRooms();
    const activeRooms = [];

    for (const [code, room] of rooms) {
      if (room.status === "waiting" || room.status === "active") {
        const hostPlayer = room.players.find((p) => p.id === room.hostId);
        const elapsed = room.startTime
          ? Math.floor((Date.now() - room.startTime) / 1000)
          : 0;

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
          elapsedTime: elapsed,
          startTime: room.startTime || null,
          createdAt: room.createdAt,
        });
      }
    }

    // Sort: active games first, then waiting. Within each, newest first.
    activeRooms.sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (b.status === "active" && a.status !== "active") return 1;
      return b.createdAt - a.createdAt;
    });

    return res.status(200).json({ success: true, rooms: activeRooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
