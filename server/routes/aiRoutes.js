import express from "express";
// Ensure the naming matches the export in your controller file
import {
  geminiCourseGenerator,
  generateChapterContent,
  getAllCourses,
  getCourseById,
} from "../utils/gemini.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// This route handles the POST request from your frontend
// Path: /api/ai/generate-course (depending on how you mount it in server.js)
router.route("/generate-course").post(authenticate, geminiCourseGenerator);
router.route("/get-course/:courseId").get(authenticate, getCourseById);
router
  .route("/generate-chapter-content")
  .post(authenticate, generateChapterContent);
router.route("/courses").get(authenticate, getAllCourses);

export default router;
