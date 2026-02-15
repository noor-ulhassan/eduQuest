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

    await post.populate("author", "name username avatarUrl");

    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeedPosts = async (req, res) => {
  try {
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
    const posts = await Post.aggregate([
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          commentsCount: { $size: "$comments" },
          popularity: {
            $add: [{ $size: "$likes" }, { $size: "$comments" }],
          },
        },
      },
      { $sort: { popularity: -1, createdAt: -1 } }, // Sort by popularity, then newest
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          "author.password": 0, // Exclude sensitive data
          "author.email": 0,
        },
      },
    ]);

    // Populate comments.user manually since aggregate doesn't do deep populate easily without complex lookups
    // A simpler way is to just do a second query or use Post.populate() on the result
    await Post.populate(posts, {
      path: "comments.user",
      select: "name username avatarUrl",
    });

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

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    // Allow deletion if user is author of comment OR author of post
    if (
      comment.user.toString() !== userId.toString() &&
      post.author.toString() !== userId.toString()
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    post.comments.pull(commentId);
    await post.save();

    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
