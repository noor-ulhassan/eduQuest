import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { addSkills } from "../controllers/skillsController.js"; // create this

const router = express.Router();

// POST /api/skills — add skills for the logged-in user
router.post("/", authenticate, addSkills);

export default router;
