import { Post } from "../models/Post.js";
import { User } from "../models/user.model.js";

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const post = await Post.create({
      author: req.user._id,
      content,
      image,
    });

    // Populate author details for immediate frontend display
    await post.populate("author", "name username avatarUrl");

    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeedPosts = async (req, res) => {
  try {
    // For now, fetch all posts sorted by newest.
    // In future, filter by friends + self.
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "name username avatarUrl")
      .populate("comments.user", "name username avatarUrl");

    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate("author", "name username avatarUrl")
      .populate("comments.user", "name username avatarUrl");

    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTopPosts = async (req, res) => {
  try {
    // Top posts logic: Sort by likes count + comments count
    // This is a simple approximation.
    const posts = await Post.find()
      .sort({ likes: -1, "comments.length": -1 }) // Sort by likes descending
      .limit(5)
      .populate("author", "name username avatarUrl");

    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({ success: true, likes: post.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const newComment = {
      user: userId,
      text,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the user of the new comment to return it
    // We need to re-fetch or just return the user info if we have it,
    // but populating is safer to ensure consistency.
    const updatedPost = await Post.findById(id).populate(
      "comments.user",
      "name username avatarUrl",
    );

    const addedComment = updatedPost.comments[updatedPost.comments.length - 1];

    res.status(200).json({ success: true, comment: addedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
