import PlaygroundProgress from "../models/PlaygroundProgress.js";
import { User } from "../models/user.model.js";
import { incrementStreak } from "../utils/streak.js";
import { addXP } from "../utils/progression.js";

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
    const { language, problemId, xp } = req.body;

    if (!language || !problemId || typeof xp !== "number") {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Find or create progress document
    let progress = await PlaygroundProgress.findOne({ userId, language });

    if (!progress) {
      // Auto-enroll if not enrolled
      progress = await PlaygroundProgress.create({
        userId,
        language,
        completedProblems: [],
        totalXpEarned: 0,
      });
    }

    // Check if problem already completed (idempotent)
    if (progress.completedProblems.includes(problemId)) {
      return res.status(200).json({
        success: true,
        message: "Problem already completed",
        alreadyCompleted: true,
        user: req.user,
      });
    }

    // Add problem to completed list
    progress.completedProblems.push(problemId);
    progress.totalXpEarned += xp;
    await progress.save();

    // Increment Streak
    let user = await User.findById(userId);
    user = await incrementStreak(user);

    // Give XP and calculate new levels / ranks / badges globally
    user = await addXP(user, xp, {
      totalSolved: progress.completedProblems.length,
    });

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
      user: updatedUser,
      progress,
    });
  } catch (error) {
    console.error("Error completing problem:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
