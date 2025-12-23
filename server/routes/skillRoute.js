import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { addSkills } from "../controllers/skillsController.js";
const router = express.Router();

router.post("/", authenticate, addSkills);

export default router;
