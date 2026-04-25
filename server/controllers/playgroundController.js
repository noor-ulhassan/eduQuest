import PlaygroundProgress from "../models/PlaygroundProgress.js";
import { User } from "../models/user.model.js";
import { incrementStreak } from "../utils/streak.js";
import { addXP } from "../utils/progression.js";
import { Curriculum } from "../models/Curriculum.js";

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

    // Bug #3 fix: Look up XP from server-side Curriculum Database
    const curriculum = await Curriculum.findOne({ language });
    if (!curriculum) {
      return res.status(400).json({
        success: false,
        message: "Unknown language curriculum",
      });
    }

    let xp = null;
    for (const chapter of curriculum.chapters) {
      const prob = chapter.problems.find(p => p.id === problemId);
      if (prob) {
        xp = prob.xp;
        break;
      }
    }

    if (xp === null) {
      return res.status(400).json({
        success: false,
        message: "Unknown problem ID",
      });
    }

    // Bug #4 fix (N6 perf): Single atomic findOneAndUpdate — prevents double XP race
    // and eliminates 2 extra DB queries by returning the updated doc directly.
    const updatedProgress = await PlaygroundProgress.findOneAndUpdate(
      { userId, language, completedProblems: { $ne: problemId } },
      {
        $addToSet: { completedProblems: problemId },
        $inc: { totalXpEarned: xp },
      },
      { new: true },
    );

    // modifiedCount === 0 means already completed or not enrolled
    if (!updatedProgress) {
      // Check if the problem was already completed
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
          totalXpEarned: xp,
        });
      } catch (createErr) {
        if (createErr.code !== 11000) throw createErr;
        // Another concurrent request enrolled first — treat as already completed
        return res.status(200).json({
          success: true,
          message: "Problem already completed",
          alreadyCompleted: true,
          user: req.user,
        });
      }
    }

    const progress = updatedProgress || await PlaygroundProgress.findOne({ userId, language });

    // Increment Streak + Give XP (Batched to save once)
    let user = await User.findById(userId);
    user = await incrementStreak(user, { autoSave: false });

    user = await addXP(user, xp, {
      totalSolved: progress.completedProblems.length,
    }, { autoSave: false });

    // Final single save for the user document
    await user.save();

    // Return updated user stats (without sensitive fields)
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
      message: `+${xp} XP earned!`,
      xp,
      user: updatedUser,
      progress,
    });
  } catch (error) {
    console.error("Error completing problem:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
