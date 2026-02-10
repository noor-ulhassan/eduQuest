import { User } from "../models/user.model.js";

// GET /api/v1/leaderboard/global
// Returns top 50 users sorted by XP
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find(
      {},
      "name username avatarUrl xp level rank badges",
    )
      .sort({ xp: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
