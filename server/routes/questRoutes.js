import express from "express";
import { getUserQuests, claimReward } from "../controllers/questController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, getUserQuests);
router.post("/claim", authenticate, claimReward);

export default router;
