import express from "express";
// Ensure the naming matches the export in your controller file
import { geminiCourseGenerator, getCourseById } from "../utils/gemini.js";

const router = express.Router();

// This route handles the POST request from your frontend
// Path: /api/ai/generate-course (depending on how you mount it in server.js)
router.route("/generate-course").post(geminiCourseGenerator);
router.route("/get-course/:courseId").get(getCourseById);

export default router;
