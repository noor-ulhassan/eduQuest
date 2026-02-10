import { User } from "../models/user.model.js";
import { Post } from "../models/Post.js";

export const getUser = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  return res.json({
    user: req.user,
  });
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Public Profile
export const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select("name username avatarUrl xp level dayStreak friends rank")
      .lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate("author", "name username avatarUrl")
      .populate("comments.user", "name username avatarUrl")
      .lean();

    res.status(200).json({
      success: true,
      user: {
        ...user,
        friendsCount: user.friends?.length || 0,
        postsCount: posts.length,
      },
      posts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Friend Logic

export const sendFriendRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const senderId = req.user._id;

    if (senderId.toString() === targetUserId) {
      return res
        .status(400)
        .json({ message: "Cannot send request to yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already friends
    if (targetUser.friends.includes(senderId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Check if request already pending
    const existingRequest = targetUser.friendRequests.find(
      (req) =>
        req.from.toString() === senderId.toString() && req.status === "pending",
    );
    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // Check if they sent US a request
    const reverseRequest = req.user.friendRequests.find(
      (req) => req.from.toString() === targetUserId && req.status === "pending",
    );
    if (reverseRequest) {
      // Auto accept? Or tell them to check requests.
      return res.status(400).json({
        message: "They already sent you a request. Check your requests.",
      });
    }

    targetUser.friendRequests.push({ from: senderId });
    await targetUser.save();

    res.status(200).json({ success: true, message: "Friend request sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const request = user.friendRequests.id(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already handled" });
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

    res.status(200).json({ success: true, message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate(
      "friends",
      "name username avatarUrl",
    );
    res.status(200).json({ success: true, friends: user.friends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate(
      "friendRequests.from",
      "name username avatarUrl",
    );

    // Filter only pending
    const pendingRequests = user.friendRequests.filter(
      (r) => r.status === "pending",
    );

    res.status(200).json({ success: true, requests: pendingRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const unfriend = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.friends.includes(targetUserId)) {
      return res.status(400).json({ message: "Not friends" });
    }

    // Remove from both
    user.friends = user.friends.filter((id) => id.toString() !== targetUserId);
    targetUser.friends = targetUser.friends.filter(
      (id) => id.toString() !== userId.toString(),
    );

    await user.save();
    await targetUser.save();

    res.status(200).json({ success: true, message: "Unfriended successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
