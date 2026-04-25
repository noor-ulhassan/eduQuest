import express from "express";
import {
  getDiscussions,
  getUserDiscussions,
  createDiscussion,
  voteDiscussion,
  replyToDiscussion,
  deleteDiscussion,
  deleteReply,
} from "../controllers/discussionController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, getDiscussions);
router.get("/user/:userId", authenticate, getUserDiscussions);
router.post("/", authenticate, createDiscussion);
router.put("/:id/vote", authenticate, voteDiscussion);
router.post("/:id/reply", authenticate, replyToDiscussion);
router.delete("/:id", authenticate, deleteDiscussion);
router.delete("/:id/reply/:replyId", authenticate, deleteReply);

export default router;
