import {
  getOrInitQuests,
  enrichQuestDoc,
  claimQuestReward,
} from "../utils/questEngine.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getUserQuests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [daily, weekly] = await Promise.all([
    getOrInitQuests(userId, "daily"),
    getOrInitQuests(userId, "weekly"),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      daily: enrichQuestDoc(daily),
      weekly: enrichQuestDoc(weekly),
      streakShields: req.user.streakShields || 0,
    }),
  );
});

export const claimReward = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { questId, period } = req.body;

  if (!questId || !period) {
    throw new ApiError(400, "questId and period are required");
  }

  const { user, xpAwarded, shieldAwarded } = await claimQuestReward(
    userId,
    questId,
    period,
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        xpAwarded,
        shieldAwarded,
        user: {
          xp: user.xp,
          level: user.level,
          league: user.league,
          badges: user.badges,
          streakShields: user.streakShields,
        },
      },
      `+${xpAwarded} XP claimed!`,
    ),
  );
});
