import express from "express";
import {
  getProgress,
  enrollPlayground,
  completeProblem,
} from "../controllers/playgroundController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.get("/progress", authenticate, getProgress);
router.post("/enroll", authenticate, enrollPlayground);
router.post("/complete", authenticate, completeProblem);

export default router;
