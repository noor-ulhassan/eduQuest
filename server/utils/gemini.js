import { User } from "../models/user.model.js";
import { callAiModel } from "../config/aiProvider.js";
import { addXP } from "./progression.js";
import { asyncHandler } from "./asyncHandler.js";
import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";

export const updateUserXP = asyncHandler(async (req, res) => {
  const { xpAmount } = req.body;
  const userEmail = req.user.email;

  const parsedXP = Number(xpAmount);
  if (!Number.isFinite(parsedXP) || parsedXP <= 0) {
    throw new ApiError(400, "xpAmount must be a positive number");
  }

  const user = await User.findOne({ email: userEmail });
  if (!user) throw new ApiError(404, "User not found");

  const prevLevel = user.level;
  await addXP(user, parsedXP);
  const leveledUp = user.level > prevLevel;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          xp: user.xp,
          level: user.level,
          rank: user.rank,
          badges: user.badges,
        },
      },
      leveledUp ? "Level Up!" : "XP Updated",
    ),
  );
});

export const geminiPdfSummarizer = asyncHandler(async (req, res) => {
  const { text, maxSentences = 5 } = req.body || {};

  if (!text || typeof text !== "string") {
    throw new ApiError(400, "Text content is required for summarization");
  }

  const MAX_CHARS = 15000;
  const safeText = text.slice(0, MAX_CHARS);

  const prompt = `
You are an expert educational content summarizer.

TASK:
- Summarize the following content for a student.
- Use clear, simple language.
- Limit the summary to about ${maxSentences} short sentences.

CONTEXT:
${safeText}

OUTPUT FORMAT (JSON ONLY, no markdown, no backticks):
{
  "summary": "overall summary as a single string",
  "bullets": ["bullet 1", "bullet 2", "bullet 3"]
}
`;

  const aiResponse = await callAiModel(prompt);

  return res.status(200).json(new ApiResponse(200, { data: aiResponse }));
});
