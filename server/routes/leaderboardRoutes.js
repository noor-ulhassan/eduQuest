import express from "express";
import {
  getGlobalLeaderboard,
  getPlaygroundLeaderboard,
  getCompetitionLeaderboard,
  getLearnerLeaderboard,
  getWeeklyLeaderboard,
} from "../controllers/leaderboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/global",      authenticate, getGlobalLeaderboard);
router.get("/playground",  authenticate, getPlaygroundLeaderboard);
router.get("/competition", authenticate, getCompetitionLeaderboard);
router.get("/learner",     authenticate, getLearnerLeaderboard);
router.get("/weekly",      authenticate, getWeeklyLeaderboard);

export default router;
