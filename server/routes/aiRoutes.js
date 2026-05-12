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
  publishCourse,
  deleteCourse,
  updateCourseChapter,
  updateCourseMetadata,
  aiEditTopic,
} from "../controllers/courseController.js";
import { updateUserXP } from "../utils/gemini.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";
import {
  chatWithDocument,
  explainText,
  generateQuiz,
} from "../controllers/aiRagController.js";

const router = express.Router();

// Admin-only routes
router.post("/generate-course", authenticate, requireAdmin, geminiCourseGenerator);
router.patch("/course/:courseId/publish", authenticate, requireAdmin, publishCourse);
router.delete("/course/:courseId", authenticate, requireAdmin, deleteCourse);
router.put("/course/:courseId/chapter", authenticate, requireAdmin, updateCourseChapter);
router.put("/course/:courseId/metadata", authenticate, requireAdmin, updateCourseMetadata);
router.post("/course/:courseId/topic/ai-edit", authenticate, requireAdmin, aiEditTopic);

// Shared routes (admin + students)
router.get("/get-course/:courseId", authenticate, getCourseById);
router.post("/generate-chapter-content", authenticate, generateChapterContent);
router.get("/courses", authenticate, getAllCourses);
router.get("/course/:courseId", authenticate, getCourseById);

// Student routes
router.post("/enroll-course", authenticate, enrollToCourse);
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
