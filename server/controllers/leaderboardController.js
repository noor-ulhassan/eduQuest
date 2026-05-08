import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getGlobalLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await User.find(
    {},
    "name username avatarUrl xp level rank badges",
  )
    .sort({ xp: -1 })
    .limit(50);

  return res.status(200).json(new ApiResponse(200, { data: leaderboard }));
});
