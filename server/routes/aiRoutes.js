import express from "express";
import { generateCourse } from "../controllers/aiController.js";
const router = express.Router();


router.route("/generate-course").post(generateCourse)





export default router;