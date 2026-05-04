import PlaygroundProgress from "../models/PlaygroundProgress.js";
import { User } from "../models/user.model.js";
import { incrementStreak } from "../utils/streak.js";
import { addXP } from "../utils/progression.js";
import { Curriculum } from "../models/Curriculum.js";
import { onPlaygroundSolve, updateStreakKeeperQuest } from "../utils/questEngine.js";

// GET /api/v1/playground/progress - Get all playground progress for user
export const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const progress = await PlaygroundProgress.find({ userId });
    return res.status(200).json({ success: true, progress });
  } catch (error) {
    console.error("Error fetching playground progress:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/v1/playground/progress/:language - Get progress for a specific language
export const getLanguageProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { language } = req.params;
    const progress = await PlaygroundProgress.findOne({ userId, language });
    return res.status(200).json({ success: true, progress });
  } catch (error) {
    console.error("Error fetching language progress:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/v1/playground/enroll - Enroll user in a playground
export const enrollPlayground = async (req, res) => {
  try {
    const userId = req.user._id;
    const { language } = req.body;

    if (
      !["html", "css", "javascript", "python", "react", "dsa"].includes(
        language,
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid language" });
    }

    // Check if already enrolled
    let progress = await PlaygroundProgress.findOne({ userId, language });

    if (progress) {
      return res.status(200).json({
        success: true,
        message: "Already enrolled",
        progress,
      });
    }

    // Create new progress document
    progress = await PlaygroundProgress.create({
      userId,
      language,
      completedProblems: [],
      totalXpEarned: 0,
    });

    return res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      progress,
    });
  } catch (error) {
    console.error("Error enrolling in playground:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/v1/playground/complete - Mark problem as complete and update XP/rank
export const completeProblem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { language, problemId } = req.body;

    if (!language || !problemId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Look up XP and difficulty from server-side Curriculum
    const curriculum = await Curriculum.findOne({ language });
    if (!curriculum) {
      return res.status(400).json({
        success: false,
        message: "Unknown language curriculum",
      });
    }

    let baseXP = null;
    let difficulty = "easy";
    for (const chapter of curriculum.chapters) {
      const prob = chapter.problems.find((p) => p.id === problemId);
      if (prob) {
        baseXP = prob.xp;
        difficulty = prob.difficulty || "easy";
        break;
      }
    }

    if (baseXP === null) {
      return res.status(400).json({
        success: false,
        message: "Unknown problem ID",
      });
    }

    // P2: Hint penalty & speed bonus
    const usedHints = req.body.usedHints === true;
    const solveTimeMs =
      typeof req.body.solveTimeMs === "number" && req.body.solveTimeMs > 0
        ? req.body.solveTimeMs
        : null;

    const penaltyFactor = usedHints ? 0.9 : 1.0;
    const diffLower = difficulty.toLowerCase();
    const isHardOrExpert = diffLower === "hard" || diffLower === "expert";
    const earnedSpeedBonus =
      isHardOrExpert && solveTimeMs !== null && solveTimeMs <= 600_000;
    const speedFactor = earnedSpeedBonus ? 1.25 : 1.0;
    const adjustedXP = Math.max(1, Math.round(baseXP * penaltyFactor * speedFactor));

    // Atomic upsert — prevents double XP race
    const updatedProgress = await PlaygroundProgress.findOneAndUpdate(
      { userId, language, completedProblems: { $ne: problemId } },
      {
        $addToSet: { completedProblems: problemId },
        $inc: { totalXpEarned: adjustedXP },
      },
      { new: true },
    );

    if (!updatedProgress) {
      const existing = await PlaygroundProgress.findOne({ userId, language });
      if (existing?.completedProblems.includes(problemId)) {
        return res.status(200).json({
          success: true,
          message: "Problem already completed",
          alreadyCompleted: true,
          user: req.user,
        });
      }
      // Not enrolled — auto-enroll (guard against concurrent duplicate-key)
      try {
        await PlaygroundProgress.create({
          userId,
          language,
          completedProblems: [problemId],
          totalXpEarned: adjustedXP,
        });
      } catch (createErr) {
        if (createErr.code !== 11000) throw createErr;
        return res.status(200).json({
          success: true,
          message: "Problem already completed",
          alreadyCompleted: true,
          user: req.user,
        });
      }
    }

    const progress =
      updatedProgress || (await PlaygroundProgress.findOne({ userId, language }));

    // Increment streak + award base XP (batched, single save)
    let user = await User.findById(userId);
    user = await incrementStreak(user, { autoSave: false });
    user = await addXP(
      user,
      adjustedXP,
      { totalSolved: progress.completedProblems.length, earnedSpeedBonus },
      { autoSave: false },
    );
    await user.save();

    // P2: Chapter & language completion bonuses
    let bonusXP = 0;
    let chapterCompleted = false;
    let languageCompleted = false;

    const completedSet = new Set(progress.completedProblems.map(String));

    const solvedChapter = curriculum.chapters.find((ch) =>
      ch.problems.some((p) => p.id === problemId),
    );

    if (solvedChapter) {
      chapterCompleted = solvedChapter.problems.every((p) =>
        completedSet.has(p.id),
      );
      if (chapterCompleted) bonusXP += 100;

      languageCompleted = curriculum.chapters.every((ch) =>
        ch.problems.every((p) => completedSet.has(p.id)),
      );
      if (languageCompleted) bonusXP += 500;
    }

    if (bonusXP > 0) {
      user = await addXP(
        user,
        bonusXP,
        { chapterCompleted, languageCompleted, language },
        { autoSave: true },
      );
    }

    // Quest hooks — fire-and-forget so they never block the response
    onPlaygroundSolve(userId, { language, difficulty: diffLower, usedHints })
      .catch((err) => console.error("[Playground] Quest update error:", err));
    updateStreakKeeperQuest(userId, user.dayStreak)
      .catch((err) => console.error("[Playground] Streak quest update error:", err));

    const updatedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      xp: user.xp,
      level: user.level,
      rank: user.rank,
      badges: user.badges,
      dayStreak: user.dayStreak,
    };

    return res.status(200).json({
      success: true,
      message: `+${adjustedXP} XP earned!`,
      xp: adjustedXP,
      bonusXP: bonusXP > 0 ? bonusXP : undefined,
      chapterCompleted: chapterCompleted || undefined,
      languageCompleted: languageCompleted || undefined,
      earnedSpeedBonus: earnedSpeedBonus || undefined,
      user: updatedUser,
      progress,
    });
  } catch (error) {
    console.error("Error completing problem:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
