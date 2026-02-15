import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getRoomInfo,
  getAllActiveRooms,
  getUserStats,
} from "../controllers/competitionController.js";

const router = express.Router();

// Get user competition stats
router.get("/stats", authenticate, getUserStats);

// List all active competition rooms (for homepage cards)
router.get("/rooms", authenticate, getAllActiveRooms);

// Get room info by code (for join-via-link)
router.get("/room/:roomCode", authenticate, getRoomInfo);

export default router;
