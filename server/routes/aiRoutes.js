import express from "express";
import {
  enrollToCourse,
  geminiCourseGenerator,
  generateChapterContent,
  getAllCourses,
  getCourseById,
  getEnrollmentStatus,
  getUserEnrollments,
  markChapterCompleted,
  updateUserXP,
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
router.get("/course/:courseId/", authenticate, getCourseById);
router.get("/enrollment-status", authenticate, getEnrollmentStatus);
router.post("/mark-chapter-completed", authenticate, markChapterCompleted);
router.get("/user-enrollments", authenticate, getUserEnrollments);
router.post("/update-user-xp", authenticate, updateUserXP);

export default router;
