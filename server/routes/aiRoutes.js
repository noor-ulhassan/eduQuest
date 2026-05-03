import express from "express";
import {
  geminiCourseGenerator,
  getCourseById,
  generateChapterContent,
  getAllCourses,
  enrollToCourse,
  getEnrollmentStatus,
  markChapterCompleted,
  getUserEnrollments,
  generateFlashcards,
  courseMentorChat,
} from "../controllers/courseController.js";
import { updateUserXP } from "../utils/gemini.js";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  chatWithDocument,
  explainText,
  generateQuiz,
} from "../controllers/aiRagController.js";

const router = express.Router();

// Existing AI routes
router.route("/generate-course").post(authenticate, geminiCourseGenerator);
router.route("/get-course/:courseId").get(authenticate, getCourseById);
router
  .route("/generate-chapter-content")
  .post(authenticate, generateChapterContent);
router.route("/courses").get(authenticate, getAllCourses);
router.route("/enroll-course").post(authenticate, enrollToCourse);
router.get("/course/:courseId/", authenticate, getCourseById);
router.get("/enrollment-status", authenticate, getEnrollmentStatus);
router.post("/mark-chapter-completed", authenticate, markChapterCompleted);
router.get("/user-enrollments", authenticate, getUserEnrollments);
router.post("/update-user-xp", authenticate, updateUserXP);
router.post("/generate-flashcards", authenticate, generateFlashcards);
router.post("/course-mentor-chat", authenticate, courseMentorChat);

// RAG Routes
router.post("/rag/chat", authenticate, chatWithDocument);
router.post("/rag/explain", authenticate, explainText);
router.post("/rag/quiz/generate", authenticate, generateQuiz);

export default router;
