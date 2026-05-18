import PlaygroundProgress from "../models/PlaygroundProgress.js";
import TopicPerformance from "../models/TopicPerformance.js";
import { User } from "../models/user.model.js";
import { incrementStreak } from "../utils/streak.js";
import { processEvent, computeXP, XP_EVENTS } from "../services/GamificationService.js";
import { Curriculum } from "../models/Curriculum.js";
import { onPlaygroundSolve, updateStreakKeeperQuest } from "../utils/questEngine.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { computeAndSave } from "../services/SuggestionEngine.js";

export const trackLinkedAttempt = asyncHandler(async (req, res) => {
  const { exerciseId, courseId, chapterIndex, passed } = req.body;
  const userId = req.user._id;

  if (!exerciseId || !courseId || chapterIndex == null || passed == null) {
    throw new ApiError(400, "exerciseId, courseId, chapterIndex and passed are required");
  }

  const existing = await TopicPerformance.findOne({ userId, exerciseId });

  // Already passed — ignore entirely
  if (existing?.passed) {
    return res.status(200).json(new ApiResponse(200, null, "Already passed, not tracked"));
  }

  if (!existing) {
    await TopicPerformance.create({
      userId,
      courseId,
      chapterIndex,
      exerciseId,
      attemptCount: 1,
      passed: !!passed,
      lastAttemptAt: new Date(),
    });
  } else {
    // Still working towards a pass
    await TopicPerformance.updateOne(
      { userId, exerciseId },
      {
        $inc: { attemptCount: 1 },
        $set: {
          passed: passed ? true : existing.passed,
          lastAttemptAt: new Date(),
        },
      },
    );
  }

  computeAndSave(req.user).catch(() => {});
  return res.status(200).json(new ApiResponse(200, null, "Attempt tracked"));
});

export const getProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const progress = await PlaygroundProgress.find({ userId });
  return res.status(200).json(new ApiResponse(200, { progress }));
});

export const getLanguageProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { language } = req.params;
  const progress = await PlaygroundProgress.findOne({ userId, language });
  return res.status(200).json(new ApiResponse(200, { progress }));
});

export const enrollPlayground = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { language } = req.body;

  if (!language?.trim()) throw new ApiError(400, "Language is required");

  const curriculumExists = await Curriculum.exists({ language });
  if (!curriculumExists) throw new ApiError(400, "Invalid language");

  let progress = await PlaygroundProgress.findOne({ userId, language });

  if (progress) {
    return res.status(200).json(
      new ApiResponse(200, { progress }, "Already enrolled"),
    );
  }

  progress = await PlaygroundProgress.create({
    userId,
    language,
    completedProblems: [],
    totalXpEarned: 0,
  });

  return res.status(201).json(
    new ApiResponse(201, { progress }, "Enrolled successfully"),
  );
});

export const completeProblem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { language, problemId } = req.body;

  if (!language || !problemId) {
    throw new ApiError(400, "Missing required fields");
  }

  const curriculum = await Curriculum.findOne({ language });
  if (!curriculum) {
    throw new ApiError(400, "Unknown language curriculum");
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
    throw new ApiError(400, "Unknown problem ID");
  }

  const usedHints = req.body.usedHints === true;
  const solveTimeMs =
    typeof req.body.solveTimeMs === "number" && req.body.solveTimeMs > 0
      ? req.body.solveTimeMs
      : null;

  const adjustedXP = computeXP(XP_EVENTS.PROBLEM_SOLVED, { baseXP, usedHints, difficulty, solveTimeMs });

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
      return res.status(200).json(
        new ApiResponse(200, {
          message: "Problem already completed",
          alreadyCompleted: true,
          user: req.user,
        }),
      );
    }
    try {
      await PlaygroundProgress.create({
        userId,
        language,
        completedProblems: [problemId],
        totalXpEarned: adjustedXP,
      });
    } catch (createErr) {
      if (createErr.code !== 11000) throw createErr;
      return res.status(200).json(
        new ApiResponse(200, {
          message: "Problem already completed",
          alreadyCompleted: true,
          user: req.user,
        }),
      );
    }
  }

  const progress =
    updatedProgress || (await PlaygroundProgress.findOne({ userId, language }));

  let user = await User.findById(userId);
  user = await incrementStreak(user, { autoSave: false });
  user = await processEvent(
    user,
    XP_EVENTS.PROBLEM_SOLVED,
    { baseXP, usedHints, difficulty, solveTimeMs, totalSolved: progress.completedProblems.length },
    { autoSave: false },
  );
  await user.save();

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
    if (chapterCompleted) {
      bonusXP += computeXP(XP_EVENTS.CHAPTER_COMPLETED, {});
      user = await processEvent(user, XP_EVENTS.CHAPTER_COMPLETED, {}, { autoSave: false });
    }

    languageCompleted = curriculum.chapters.every((ch) =>
      ch.problems.every((p) => completedSet.has(p.id)),
    );
    if (languageCompleted) {
      bonusXP += computeXP(XP_EVENTS.LANGUAGE_MASTERED, { language });
      user = await processEvent(user, XP_EVENTS.LANGUAGE_MASTERED, { language }, { autoSave: false });
    }
  }

  if (bonusXP > 0) await user.save();

  onPlaygroundSolve(userId, { language, difficulty: difficulty.toLowerCase(), usedHints })
    .catch((err) => console.error("[Playground] Quest update error:", err));
  updateStreakKeeperQuest(userId, user.dayStreak)
    .catch((err) => console.error("[Playground] Streak quest update error:", err));
  computeAndSave(req.user).catch(() => {});

  const isHardOrExpert = ["hard", "expert"].includes(difficulty.toLowerCase());
  const earnedSpeedBonus = isHardOrExpert && solveTimeMs != null && solveTimeMs <= 600_000;

  const updatedUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    xp: user.xp,
    level: user.level,
    league: user.league,
    badges: user.badges,
    dayStreak: user.dayStreak,
  };

  return res.status(200).json(
    new ApiResponse(200, {
      message: `+${adjustedXP} XP earned!`,
      xp: adjustedXP,
      bonusXP: bonusXP > 0 ? bonusXP : undefined,
      chapterCompleted: chapterCompleted || undefined,
      languageCompleted: languageCompleted || undefined,
      earnedSpeedBonus: earnedSpeedBonus || undefined,
      user: updatedUser,
      progress,
    }),
  );
});
