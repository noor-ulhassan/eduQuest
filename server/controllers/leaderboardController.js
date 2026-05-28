import { User } from "../models/user.model.js";
import PlaygroundProgress from "../models/PlaygroundProgress.js";
import { CompetitionResult } from "../models/CompetitionResult.model.js";
import Enrollment from "../models/EnrollmentModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Shared projection after $lookup + $unwind on "user"
const USER_PROJECT = {
  _id: "$user._id",
  name: "$user.name",
  username: "$user.username",
  avatarUrl: "$user.avatarUrl",
  level: "$user.level",
  league: "$user.league",
  badges: "$user.badges",
};

// ─── 1. Global XP Leaderboard ─────────────────────────────────────────────────
export const getGlobalLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await User.find(
    {},
    "name username avatarUrl xp level league badges",
  )
    .sort({ xp: -1 })
    .limit(50);

  return res.status(200).json(new ApiResponse(200, { data: leaderboard }));
});

// ─── 2. Playground Leaderboard — top solvers by total problems solved ─────────
export const getPlaygroundLeaderboard = asyncHandler(async (req, res) => {
  const data = await PlaygroundProgress.aggregate([
    {
      $group: {
        _id: "$userId",
        totalSolved: { $sum: { $size: "$completedProblems" } },
      },
    },
    { $sort: { totalSolved: -1 } },
    { $limit: 50 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
    { $project: { ...USER_PROJECT, totalSolved: 1 } },
  ]);

  return res.status(200).json(new ApiResponse(200, { data }));
});

// ─── 3. Competition Leaderboard — top players by all-time wins ────────────────
export const getCompetitionLeaderboard = asyncHandler(async (req, res) => {
  const data = await CompetitionResult.aggregate([
    {
      $group: {
        _id: "$userId",
        totalWins: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$rank", 1] },
                  { $eq: ["$status", "completed"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalMatches: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
      },
    },
    { $sort: { totalWins: -1, totalMatches: -1 } },
    { $limit: 50 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
    { $project: { ...USER_PROJECT, totalWins: 1, totalMatches: 1 } },
  ]);

  return res.status(200).json(new ApiResponse(200, { data }));
});

// ─── 4. Learner Leaderboard — top learners by total chapters completed ─────────
export const getLearnerLeaderboard = asyncHandler(async (req, res) => {
  const data = await Enrollment.aggregate([
    {
      $group: {
        _id: "$userEmail",
        totalChapters: { $sum: { $size: "$completedChapters" } },
      },
    },
    { $sort: { totalChapters: -1 } },
    { $limit: 50 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "email",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
    { $project: { ...USER_PROJECT, totalChapters: 1 } },
  ]);

  return res.status(200).json(new ApiResponse(200, { data }));
});

// ─── 5. Weekly Competition Leaderboard — this week's competition XP ───────────
export const getWeeklyLeaderboard = asyncHandler(async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const data = await CompetitionResult.aggregate([
    { $match: { timestamp: { $gte: weekAgo }, status: "completed" } },
    {
      $group: {
        _id: "$userId",
        weeklyXP: { $sum: "$xpAwarded" },
        weeklyWins: {
          $sum: { $cond: [{ $eq: ["$rank", 1] }, 1, 0] },
        },
        weeklyMatches: { $sum: 1 },
      },
    },
    { $sort: { weeklyXP: -1 } },
    { $limit: 50 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
    {
      $project: {
        ...USER_PROJECT,
        weeklyXP: 1,
        weeklyWins: 1,
        weeklyMatches: 1,
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, { data }));
});
