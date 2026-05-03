import { User } from "../models/user.model.js";
import { callAiModel } from "../config/aiProvider.js";

export const updateUserXP = async (req, res) => {
  try {
    const { xpAmount } = req.body;
    const userEmail = req.user.email;

    const parsedXP = Number(xpAmount);
    if (!Number.isFinite(parsedXP) || parsedXP <= 0) {
      return res.status(400).json({
        success: false,
        message: "xpAmount must be a positive number",
      });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.xp = (user.xp || 0) + parsedXP;

    const newLevel = Math.floor(user.xp / 1000) + 1;

    const leveledUp = newLevel > user.level;
    user.level = newLevel;

    if (user.level >= 10) user.rank = "Silver";
    if (user.level >= 20) user.rank = "Gold";
    if (user.level >= 50) user.rank = "Grandmaster";

    await user.save();

    return res.status(200).json({
      success: true,
      message: leveledUp ? "Level Up!" : "XP Updated",
      user: {
        xp: user.xp,
        level: user.level,
        rank: user.rank,
        badges: user.badges,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const geminiPdfSummarizer = async (req, res) => {
  try {
    const { text, maxSentences = 5 } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "Text content is required for summarization",
      });
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

    return res.status(200).json({
      success: true,
      data: aiResponse,
    });
  } catch (error) {
    console.error("Gemini PDF Summarizer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate summary",
      error: error.message,
    });
  }
};
