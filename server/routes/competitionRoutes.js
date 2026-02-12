import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getRoomInfo,
  getAllActiveRooms,
} from "../controllers/competitionController.js";

const router = express.Router();

// List all active competition rooms (for homepage cards)
router.get("/rooms", authenticate, getAllActiveRooms);

// Get room info by code (for join-via-link)
router.get("/room/:roomCode", authenticate, getRoomInfo);

export default router;
