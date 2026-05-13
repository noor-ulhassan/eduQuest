import { User } from "../models/user.model.js";
import { Post } from "../models/Post.js";
import PlaygroundProgress from "../models/PlaygroundProgress.js";
import { CompetitionResult } from "../models/CompetitionResult.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs/promises";
import { checkStreak } from "../utils/streak.js";
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

export const getPublicProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId)
    .select(
      "name username avatarUrl bannerUrl xp level dayStreak friends league createdAt",
    )
    .populate("friends", "name username avatarUrl")
    .lean();

  if (!user) throw new ApiError(404, "User not found");

  const posts = await Post.find({ author: userId })
    .sort({ createdAt: -1 })
    .populate("author", "name username avatarUrl")
    .populate("comments.user", "name username avatarUrl")
    .lean();

  return res.status(200).json(
    new ApiResponse(200, {
      user: {
        ...user,
        friendsCount: user.friends?.length || 0,
        postsCount: posts.length,
      },
      posts,
    }),
  );
});

export const sendFriendRequest = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;
  const senderId = req.user._id;

  if (senderId.toString() === targetUserId) {
    throw new ApiError(400, "Cannot send request to yourself");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new ApiError(404, "User not found");

  if (targetUser.friends.includes(senderId)) {
    throw new ApiError(400, "Already friends");
  }

  const existingRequest = targetUser.friendRequests.find(
    (req) =>
      req.from.toString() === senderId.toString() && req.status === "pending",
  );
  if (existingRequest) {
    throw new ApiError(400, "Request already sent");
  }

  const reverseRequest = req.user.friendRequests.find(
    (req) => req.from.toString() === targetUserId && req.status === "pending",
  );
  if (reverseRequest) {
    throw new ApiError(
      400,
      "They already sent you a request. Check your requests.",
    );
  }

  targetUser.friendRequests.push({ from: senderId });
  await targetUser.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Friend request sent"));
});

export const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  const request = user.friendRequests.id(requestId);

  if (!request) throw new ApiError(404, "Request not found");
  if (request.status !== "pending") {
    throw new ApiError(400, "Request already handled");
  }

  const senderId = request.from;
  const sender = await User.findById(senderId);

  if (sender) {
    user.friends.push(senderId);
    sender.friends.push(userId);
    await sender.save();
  }

  request.status = "accepted";
  user.friendRequests.pull(requestId);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Friend request accepted"));
});

export const getFriends = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).populate(
    "friends",
    "name username avatarUrl",
  );
  return res.status(200).json(new ApiResponse(200, { friends: user.friends }));
});

export const getFriendRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).populate(
    "friendRequests.from",
    "name username avatarUrl",
  );

  const pendingRequests = user.friendRequests.filter(
    (r) => r.status === "pending",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { requests: pendingRequests }));
});

export const unfriend = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  const targetUser = await User.findById(targetUserId);

  if (!user || !targetUser) throw new ApiError(404, "User not found");
  if (!user.friends.includes(targetUserId)) {
    throw new ApiError(400, "Not friends");
  }

  user.friends = user.friends.filter((id) => id.toString() !== targetUserId);
  targetUser.friends = targetUser.friends.filter(
    (id) => id.toString() !== userId.toString(),
  );

  await user.save();
  await targetUser.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Unfriended successfully"));
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
