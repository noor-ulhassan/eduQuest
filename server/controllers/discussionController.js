import { Discussion } from "../models/Discussion.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getDiscussions = asyncHandler(async (req, res) => {
  const { language, problemId } = req.query;

  if (!language || !problemId) {
    throw new ApiError(400, "language and problemId are required");
  }

  const discussions = await Discussion.find({ language, problemId })
    .sort({ createdAt: -1 })
    .populate("author", "name username avatarUrl")
    .populate("replies.user", "name username avatarUrl");

  return res.status(200).json(new ApiResponse(200, { discussions }));
});

export const getUserDiscussions = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const discussions = await Discussion.find({ author: userId })
    .sort({ createdAt: -1 })
    .populate("author", "name username avatarUrl")
    .populate("replies.user", "name username avatarUrl");

  return res.status(200).json(new ApiResponse(200, { discussions }));
});

export const createDiscussion = asyncHandler(async (req, res) => {
  const { title, content, language, problemId } = req.body;

  if (!title || !content || !language || !problemId) {
    throw new ApiError(
      400,
      "title, content, language, and problemId are required",
    );
  }

  if (title.length > 200) {
    throw new ApiError(400, "Title exceeds 200 characters");
  }

  if (content.length > 5000) {
    throw new ApiError(400, "Content exceeds 5000 characters");
  }

  const discussion = await Discussion.create({
    author: req.user._id,
    title,
    content,
    language,
    problemId,
  });

  await discussion.populate("author", "name username avatarUrl");

  return res.status(201).json(new ApiResponse(201, { discussion }));
});

export const voteDiscussion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const discussion = await Discussion.findById(id);
  if (!discussion) throw new ApiError(404, "Discussion not found");

  const hasVoted = discussion.votes.some(
    (v) => v.toString() === userId.toString(),
  );

  if (hasVoted) {
    discussion.votes = discussion.votes.filter(
      (v) => v.toString() !== userId.toString(),
    );
  } else {
    discussion.votes.push(userId);
  }

  await discussion.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { votes: discussion.votes }));
});

export const replyToDiscussion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  if (!text) throw new ApiError(400, "Reply text is required");

  if (text.length > 2000) {
    throw new ApiError(400, "Reply exceeds 2000 characters");
  }

  const discussion = await Discussion.findById(id);
  if (!discussion) throw new ApiError(404, "Discussion not found");

  discussion.replies.push({
    user: userId,
    text,
    createdAt: new Date(),
  });

  await discussion.save();

  const updated = await Discussion.findById(id).populate(
    "replies.user",
    "name username avatarUrl",
  );

  const addedReply = updated.replies[updated.replies.length - 1];

  return res.status(200).json(new ApiResponse(200, { reply: addedReply }));
});

export const deleteDiscussion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const discussion = await Discussion.findById(id);
  if (!discussion) throw new ApiError(404, "Discussion not found");

  if (discussion.author.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  await Discussion.findByIdAndDelete(id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Discussion deleted"));
});

export const deleteReply = asyncHandler(async (req, res) => {
  const { id, replyId } = req.params;
  const userId = req.user._id;

  const discussion = await Discussion.findById(id);
  if (!discussion) throw new ApiError(404, "Discussion not found");

  const reply = discussion.replies.id(replyId);
  if (!reply) throw new ApiError(404, "Reply not found");

  if (
    reply.user.toString() !== userId.toString() &&
    discussion.author.toString() !== userId.toString()
  ) {
    throw new ApiError(403, "Unauthorized");
  }

  discussion.replies.pull(replyId);
  await discussion.save();

  return res.status(200).json(new ApiResponse(200, null, "Reply deleted"));
});
