import {
  getOrInitQuests,
  enrichQuestDoc,
  claimQuestReward,
} from "../utils/questEngine.js";

const CLAIM_ERROR_STATUS = {
  "Invalid period": 400,
  "Quest not found": 404,
  "Quest not yet completed": 400,
  "Reward already claimed": 409,
  "User not found": 404,
};

// GET /api/v1/quests
export const getUserQuests = async (req, res) => {
  try {
    const userId = req.user._id;

    const [daily, weekly] = await Promise.all([
      getOrInitQuests(userId, "daily"),
      getOrInitQuests(userId, "weekly"),
    ]);

    return res.status(200).json({
      success: true,
      daily: enrichQuestDoc(daily),
      weekly: enrichQuestDoc(weekly),
      streakShields: req.user.streakShields || 0,
    });
  } catch (error) {
    console.error("[QuestController] getUserQuests:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/v1/quests/claim
export const claimReward = async (req, res) => {
  try {
    const userId = req.user._id;
    const { questId, period } = req.body;

    if (!questId || !period) {
      return res.status(400).json({
        success: false,
        message: "questId and period are required",
      });
    }

    const { user, xpAwarded, shieldAwarded } = await claimQuestReward(
      userId,
      questId,
      period
    );

    return res.status(200).json({
      success: true,
      message: `+${xpAwarded} XP claimed!`,
      xpAwarded,
      shieldAwarded,
      user: {
        xp: user.xp,
        level: user.level,
        rank: user.rank,
        badges: user.badges,
        streakShields: user.streakShields,
      },
    });
  } catch (error) {
    const status = CLAIM_ERROR_STATUS[error.message] || 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};
