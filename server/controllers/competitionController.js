import { getRooms } from "../socket/roomHandler.js";
import { CompetitionResult } from "../models/CompetitionResult.model.js";

// ... existing code ...

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[Stats] Fetching stats for user: ${userId}`);

    // 1. Fetch all results for this user
    const results = await CompetitionResult.find({ userId }).sort({
      timestamp: -1,
    });
    console.log(`[Stats] Found ${results.length} results`);

    if (!results || results.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalGames: 0,
          wins: 0,
          losses: 0,
          dnf: 0,
          winRate: 0,
          recentActivity: [],
          categoryDistribution: [],
          modeDistribution: [],
        },
      });
    }

    // 2. Calculate aggregates
    const totalGames = results.length;
    const wins = results.filter(
      (r) => r.rank === 1 && r.status === "completed",
    ).length;
    const dnf = results.filter((r) => r.status === "dnf").length;
    // Loss is any game not won (rank > 1) OR dnf
    const losses = totalGames - wins;

    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;

    // 3. Category & Mode Distribution
    const categoryCount = {};
    const modeCount = {};

    results.forEach((r) => {
      categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
      modeCount[r.challengeMode] = (modeCount[r.challengeMode] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryCount).map(
      ([name, value]) => ({ name, value }),
    );
    const modeDistribution = Object.entries(modeCount).map(([name, value]) => ({
      name,
      value,
    }));

    // 4. Recent Activity (last 10 games) for graphing
    // Format: { date: "MM/DD", score: 120, rank: 2 }
    const recentActivity = results
      .slice(0, 10)
      .reverse() // Chronological order for graph
      .map((r) => ({
        date: new Date(r.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        score: r.score,
        rank: r.rank || 0, // 0 for DNF
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
