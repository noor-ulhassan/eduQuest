import express from "express";
import {
  getUser,
  uploadAvatar,
  uploadBanner,
  updateProfile,
  getUserAnalytics,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { uploadAvatar as avatarMulter } from "../middleware/avatarMulter.js";

const router = express.Router();

router.post("/getUser", authenticate, getUser); // Existing

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


// Analytics Route
router.get("/analytics", authenticate, getUserAnalytics);

export default router;
