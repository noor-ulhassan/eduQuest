import express from "express";
import { getCurrentSuggestion, markActed } from "../controllers/suggestionController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/current", authenticate, getCurrentSuggestion);
router.post("/acted", authenticate, markActed);

export default router;
