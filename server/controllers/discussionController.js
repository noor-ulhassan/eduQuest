import { Discussion } from "../models/Discussion.js";

// GET /api/v1/discussions?language=javascript&problemId=js-var-1
export const getDiscussions = async (req, res) => {
  try {
    const { language, problemId } = req.query;

    if (!language || !problemId) {
      return res.status(400).json({
        success: false,
        message: "language and problemId are required",
      });
    }

    const discussions = await Discussion.find({ language, problemId })
      .sort({ createdAt: -1 })
      .populate("author", "name username avatarUrl")
      .populate("replies.user", "name username avatarUrl");

    res.status(200).json({ success: true, discussions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/discussions/user/:userId
export const getUserDiscussions = async (req, res) => {
  try {
    const { userId } = req.params;

    const discussions = await Discussion.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate("author", "name username avatarUrl")
      .populate("replies.user", "name username avatarUrl");

    res.status(200).json({ success: true, discussions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/discussions
export const createDiscussion = async (req, res) => {
  try {
    const { title, content, language, problemId } = req.body;

    if (!title || !content || !language || !problemId) {
      return res.status(400).json({
        success: false,
        message: "title, content, language, and problemId are required",
      });
    }

    const discussion = await Discussion.create({
      author: req.user._id,
      title,
      content,
      language,
      problemId,
    });

    await discussion.populate("author", "name username avatarUrl");

    res.status(201).json({ success: true, discussion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/v1/discussions/:id/vote
export const voteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res
        .status(404)
        .json({ success: false, message: "Discussion not found" });
    }

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

    res.status(200).json({ success: true, votes: discussion.votes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/discussions/:id/reply
export const replyToDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Reply text is required" });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res
        .status(404)
        .json({ success: false, message: "Discussion not found" });
    }

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

    res.status(200).json({ success: true, reply: addedReply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/discussions/:id
export const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res
        .status(404)
        .json({ success: false, message: "Discussion not found" });
    }

    if (discussion.author.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Discussion.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Discussion deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/discussions/:id/reply/:replyId
export const deleteReply = async (req, res) => {
  try {
    const { id, replyId } = req.params;
    const userId = req.user._id;

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res
        .status(404)
        .json({ success: false, message: "Discussion not found" });
    }

    const reply = discussion.replies.id(replyId);
    if (!reply) {
      return res
        .status(404)
        .json({ success: false, message: "Reply not found" });
    }

    if (
      reply.user.toString() !== userId.toString() &&
      discussion.author.toString() !== userId.toString()
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    discussion.replies.pull(replyId);
    await discussion.save();

    res.status(200).json({ success: true, message: "Reply deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
