import { User } from "../models/user.model.js";
import PlaygroundProgress from "../models/PlaygroundProgress.js";
import { CompetitionResult } from "../models/CompetitionResult.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs/promises";
import { checkStreak } from "../utils/streak.js";
import { processEvent, XP_EVENTS } from "../services/GamificationService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getUser = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  return res.json(new ApiResponse(200, { user: req.user }));
});

export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  let user = await User.findById(userId).select("-password");

  if (!user) throw new ApiError(404, "User not found");

  if (user.dayStreak > 0) {
    user = await checkStreak(user);
  }

  return res.status(200).json(new ApiResponse(200, { user }));
});


export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image file provided");

  const filePath = req.file.path;
  const result = await uploadOnCloudinary(filePath);
  await fs.unlink(filePath).catch(() => {});

  if (!result || !result.secure_url) {
    throw new ApiError(500, "Failed to upload image");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl: result.secure_url },
    { new: true },
  ).select("-password");

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, { user, avatarUrl: user.avatarUrl }));
});

export const uploadBanner = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image file provided");

  const filePath = req.file.path;
  const result = await uploadOnCloudinary(filePath);
  await fs.unlink(filePath).catch(() => {});

  if (!result || !result.secure_url) {
    throw new ApiError(500, "Failed to upload image");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { bannerUrl: result.secure_url },
    { new: true },
  ).select("-password");

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, { user, bannerUrl: user.bannerUrl }));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, username, avatarUrl, bannerUrl } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (username !== undefined) updates.username = username;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  if (bannerUrl !== undefined) updates.bannerUrl = bannerUrl;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
  }).select("-password");

  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, { user }));
});

export const updateUserXP = asyncHandler(async (req, res) => {
  const { xpAmount } = req.body;
  const parsedXP = Number(xpAmount);
  if (!Number.isFinite(parsedXP) || parsedXP <= 0) {
    throw new ApiError(400, "xpAmount must be a positive number");
  }

  const user = await User.findOne({ email: req.user.email });
  if (!user) throw new ApiError(404, "User not found");

  const prevLevel = user.level;
  await processEvent(user, XP_EVENTS.QUEST_CLAIMED, { xpReward: parsedXP });
  const leveledUp = user.level > prevLevel;

  return res.status(200).json(
    new ApiResponse(200, {
      user: { xp: user.xp, level: user.level, league: user.league, badges: user.badges },
    }, leveledUp ? "Level Up!" : "XP Updated"),
  );
});

export const getUserAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).select("-password").lean();

  if (!user) throw new ApiError(404, "User not found");

  const playgroundProgress = await PlaygroundProgress.find({ userId }).lean();
  let totalProblemsSolved = 0;
  const languageDistribution = playgroundProgress.map((p) => {
    totalProblemsSolved += (p.completedProblems || []).length;
    return {
      language: p.language,
      solvedCount: (p.completedProblems || []).length,
      xpEarned: p.totalXpEarned || 0,
    };
  });

  const competitionResults = await CompetitionResult.find({ userId })
    .sort({ timestamp: -1 })
    .lean();

  const totalCompetitions = competitionResults.length;
  let totalWins = 0;
  const competitionScores = [];

  competitionResults.forEach((comp, idx) => {
    if (comp.rank === 1 && comp.status === "completed") {
      totalWins++;
    }
    if (idx < 10) {
      competitionScores.push({
        date: new Date(comp.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        score: comp.score || 0,
        rank: comp.rank || 0,
        status: comp.status,
        category: comp.category,
      });
    }
  });

  const competitionWinRate =
    totalCompetitions > 0
      ? ((totalWins / totalCompetitions) * 100).toFixed(1)
      : 0;

  const analyticsPayload = {
    global: {
      totalXP: user.xp || 0,
      level: user.level || 1,
      league: user.league || "Bronze",
      dayStreak: user.dayStreak || 0,
      badges: user.badges || [],
    },
    playground: {
      totalProblemsSolved,
      languageDistribution,
    },
    competitions: {
      totalGamesPlayed: totalCompetitions,
      totalWins,
      winRate: Number(competitionWinRate),
      recentHistory: competitionScores.reverse(),
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, { analytics: analyticsPayload }));
});
