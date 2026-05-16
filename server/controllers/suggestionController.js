import { Suggestion } from "../models/Suggestion.js";
import { generateSuggestion } from "../services/SuggestionEngine.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const getCurrentSuggestion = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const force = req.query.force === "true";

  if (!force) {
    const cached = await Suggestion.findOne({ userId });
    if (
      cached &&
      !cached.actedOn &&
      Date.now() - cached.generatedAt.getTime() < CACHE_TTL_MS
    ) {
      return res
        .status(200)
        .json(new ApiResponse(200, { suggestion: cached }, "Cached"));
    }
  }

  const payload = await generateSuggestion(req.user);

  if (!payload) {
    return res
      .status(200)
      .json(new ApiResponse(200, { suggestion: null }, "No suggestion available"));
  }

  const suggestion = await Suggestion.findOneAndUpdate(
    { userId },
    { ...payload, userId, generatedAt: new Date(), actedOn: false },
    { upsert: true, new: true },
  );

  return res.status(200).json(new ApiResponse(200, { suggestion }));
});

export const markActed = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await Suggestion.findOneAndUpdate({ userId }, { actedOn: true });
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Marked as acted"));
});
