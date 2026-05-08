import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const addSkills = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { skills } = req.body;

  if (!skills || !Array.isArray(skills)) {
    throw new ApiError(400, "Skills must be an array");
  }

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const updatedSkills = [...new Set([...(user.skills || []), ...skills])];

  user.skills = updatedSkills;
  await user.save();

  return res.json(new ApiResponse(200, { skills: user.skills }));
});
