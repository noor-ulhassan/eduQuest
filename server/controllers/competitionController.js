import mongoose from "mongoose";
import { getRooms } from "../socket/roomHandler.js";
import { CompetitionResult } from "../models/CompetitionResult.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [pipeline] = await CompetitionResult.aggregate([
    { $match: { userId: userObjectId } },
    {
      $facet: {
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
        categories: [
          { $group: { _id: "$category", value: { $sum: 1 } } },
        ],
        modes: [
          { $group: { _id: "$challengeMode", value: { $sum: 1 } } },
        ],
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
    return res.status(200).json(
      new ApiResponse(200, {
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
      }),
    );
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
    .reverse()
    .map((r) => ({
      date: new Date(r.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      score: r.score || 0,
      rank: r.rank || 0,
      status: r.status,
    }));

  return res.status(200).json(
    new ApiResponse(200, {
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
    }),
  );
});

export const getRoomInfo = asyncHandler(async (req, res) => {
  const { roomCode } = req.params;
  const rooms = getRooms();
  const room = rooms.get(roomCode);

  if (!room) throw new ApiError(404, "Room not found");

  return res.status(200).json(
    new ApiResponse(200, {
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
    }),
  );
});

export const getAllActiveRooms = asyncHandler(async (req, res) => {
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

  activeRooms.sort((a, b) => {
    if (a.status === "active" && b.status !== "active") return -1;
    if (b.status === "active" && a.status !== "active") return 1;
    return b.createdAt - a.createdAt;
  });

  return res.status(200).json(new ApiResponse(200, { rooms: activeRooms }));
});
