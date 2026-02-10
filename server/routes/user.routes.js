import express from "express";
import {
  getUser,
  getPublicProfile,
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  getFriendRequests,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/getUser", authenticate, getUser); // Existing
router.get("/profile/:userId", authenticate, getPublicProfile); // Public profile

// Friend Routes
router.post("/friend-request", authenticate, sendFriendRequest);
router.put("/friend-request/accept", authenticate, acceptFriendRequest);
router.get("/friends", authenticate, getFriends);
router.get("/friend-requests", authenticate, getFriendRequests);

export default router;
