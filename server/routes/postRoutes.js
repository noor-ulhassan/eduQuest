import express from "express";
import {
  createPost,
  getFeedPosts,
  getTopPosts,
  getUserPosts,
  likePost,
  commentOnPost,
  deletePost,
  deleteComment,
} from "../controllers/postController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/feed", authenticate, getFeedPosts);
router.get("/top", getTopPosts);
router.get("/user/:userId", authenticate, getUserPosts);
router.post("/", authenticate, createPost);
router.put("/:id/like", authenticate, likePost);
router.post("/:id/comment", authenticate, commentOnPost);
router.delete("/:id", authenticate, deletePost);
router.delete("/:id/comment/:commentId", authenticate, deleteComment);

export default router;
