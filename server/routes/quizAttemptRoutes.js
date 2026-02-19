import express from "express";
import { 
  saveQuizAttempt, 
  getAttemptsByDocument 
} from "../controllers/quizAttemptController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(authenticate); 

router.post("/", saveQuizAttempt);
router.get("/document/:documentId", getAttemptsByDocument);

export default router;