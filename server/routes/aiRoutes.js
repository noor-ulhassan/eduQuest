import express from "express";
import {
  enrollToCourse,
  geminiCourseGenerator,
  generateChapterContent,
  getAllCourses,
  getCourseById,
} from "../utils/gemini.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/generate-course").post(authenticate, geminiCourseGenerator);
router.route("/get-course/:courseId").get(authenticate, getCourseById);
router
  .route("/generate-chapter-content")
  .post(authenticate, generateChapterContent);
router.route("/courses").get(authenticate, getAllCourses);
router.route("/enroll-course").post(authenticate, enrollToCourse);

export default router;
