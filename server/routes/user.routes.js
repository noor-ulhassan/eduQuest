import express from "express";
import {
  getUser,
  getPublicProfile,
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  getFriendRequests,
  unfriend,
  uploadAvatar,
  uploadBanner,
  updateProfile,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { uploadAvatar as avatarMulter } from "../middleware/avatarMulter.js";

const router = express.Router();

router.post("/getUser", authenticate, getUser); // Existing
router.get("/profile/:userId", authenticate, getPublicProfile); // Public profile

// Profile: avatar and banner upload (multipart) and profile update (name, username)
router.post(
  "/avatar",
  authenticate,
  avatarMulter.single("avatar"),
  uploadAvatar,
);
router.post(
  "/banner",
  authenticate,
  avatarMulter.single("banner"),
  uploadBanner,
);
router.patch("/profile", authenticate, updateProfile);

// Friend Routes
router.post("/friend-request", authenticate, sendFriendRequest);
router.put("/friend-request/accept", authenticate, acceptFriendRequest);
router.get("/friends", authenticate, getFriends);
router.get("/friend-requests", authenticate, getFriendRequests);
router.post("/unfriend", authenticate, unfriend);

export default router;
