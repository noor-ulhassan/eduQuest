import { Post } from "../models/Post.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createPost = asyncHandler(async (req, res) => {
  const { content, image } = req.body;
  const post = await Post.create({
    author: req.user._id,
    content,
    image,
  });

  await post.populate("author", "name username avatarUrl");

  return res.status(201).json(new ApiResponse(201, { post }));
});

export const getFeedPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("author", "name username avatarUrl")
    .populate("comments.user", "name username avatarUrl");

  return res.status(200).json(new ApiResponse(200, { posts }));
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const posts = await Post.find({ author: userId })
    .sort({ createdAt: -1 })
    .populate("author", "name username avatarUrl")
    .populate("comments.user", "name username avatarUrl");

  return res.status(200).json(new ApiResponse(200, { posts }));
});

export const getTopPosts = asyncHandler(async (req, res) => {
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
    { $sort: { popularity: -1, createdAt: -1 } },
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
        "author.password": 0,
        "author.email": 0,
      },
    },
  ]);

  await Post.populate(posts, {
    path: "comments.user",
    select: "name username avatarUrl",
  });

  return res.status(200).json(new ApiResponse(200, { posts }));
});

export const likePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, "Post not found");

  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== userId);
  } else {
    post.likes.push(userId);
  }

  await post.save();

  return res.status(200).json(new ApiResponse(200, { likes: post.likes }));
});

export const commentOnPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, "Post not found");

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

  return res.status(200).json(new ApiResponse(200, { comment: addedComment }));
});

export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, "Post not found");

  if (post.author.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  await Post.findByIdAndDelete(id);
  return res.status(200).json(new ApiResponse(200, null, "Post deleted"));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, "Post not found");

  const comment = post.comments.id(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  if (
    comment.user.toString() !== userId.toString() &&
    post.author.toString() !== userId.toString()
  ) {
    throw new ApiError(403, "Unauthorized");
  }

  post.comments.pull(commentId);
  await post.save();

  return res.status(200).json(new ApiResponse(200, null, "Comment deleted"));
});
