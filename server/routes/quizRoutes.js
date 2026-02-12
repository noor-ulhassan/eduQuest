import express from "express";

import { authenticate } from "../middleware/authMiddleware.js";
import { generateQuiz } from "../controllers/quizController.js";


const router = express.Router();

router.use(authenticate);

router.post("/generate-quiz", authenticate, generateQuiz);


export default router;
