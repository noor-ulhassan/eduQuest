import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getUserStats } from "../controllers/competition.controller.js";

const router = express.Router();

// GET /api/competition/stats
router.get("/stats", protect, getUserStats);

// Placeholder for future endpoints
// router.get("/results", protect, getResults);

export default router;
