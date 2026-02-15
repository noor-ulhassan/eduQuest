import { CompetitionResult } from "../models/CompetitionResult.model.js";

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch all results for this user
    const results = await CompetitionResult.find({ userId }).sort({
      timestamp: -1,
    });

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
