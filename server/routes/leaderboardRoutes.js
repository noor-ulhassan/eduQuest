import express from "express";
import { getGlobalLeaderboard } from "../controllers/leaderboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/global", authenticate, getGlobalLeaderboard);

export default router;
