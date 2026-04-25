import express from "express";
import {
  getProgress,
  getLanguageProgress,
  enrollPlayground,
  completeProblem,
} from "../controllers/playgroundController.js";
import { authenticate } from "../middleware/authMiddleware.js";

import rateLimit from "express-rate-limit";

const router = express.Router();

const completeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 completion requests per windowMs
  message: { success: false, message: "Too many requests, please try again later." }
});

// All routes require authentication
router.get("/progress", authenticate, getProgress);
router.get("/progress/:language", authenticate, getLanguageProgress);
router.post("/enroll", authenticate, enrollPlayground);
router.post("/complete", authenticate, completeLimiter, completeProblem);

export default router;
