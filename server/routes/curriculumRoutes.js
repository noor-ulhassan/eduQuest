import express from "express";
import {
  getCurriculumByLanguage,
  getAllCurriculumsMetadata,
  addProblem,
  updateProblem,
  deleteProblem,
  createCurriculum,
  deleteCurriculum,
  updateCurriculumSettings,
  addChapter,
  updateChapter,
  deleteChapter,
  generateProblems,
} from "../controllers/curriculumController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/metadata", getAllCurriculumsMetadata);
router.get("/:language", authenticate, getCurriculumByLanguage);

// Admin — curriculum
router.post("/", authenticate, requireAdmin, createCurriculum);
router.patch("/:language/settings", authenticate, requireAdmin, updateCurriculumSettings);
router.delete("/:language", authenticate, requireAdmin, deleteCurriculum);

// Admin — chapters
router.post("/:language/chapter", authenticate, requireAdmin, addChapter);
router.put("/:language/chapter/:chapterId", authenticate, requireAdmin, updateChapter);
router.delete("/:language/chapter/:chapterId", authenticate, requireAdmin, deleteChapter);

// Admin — problems
router.post("/:language/chapter/:chapterId/problem", authenticate, requireAdmin, addProblem);
router.put("/:language/problem/:problemId", authenticate, requireAdmin, updateProblem);
router.delete("/:language/problem/:problemId", authenticate, requireAdmin, deleteProblem);

// Admin — AI generation
router.post("/:language/chapter/:chapterId/generate", authenticate, requireAdmin, generateProblems);

export default router;
