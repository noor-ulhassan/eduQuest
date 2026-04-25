import express from "express";
import { 
  getCurriculumByLanguage, 
  getAllCurriculumsMetadata,
  addProblem,
  updateProblem,
  deleteProblem
} from "../controllers/curriculumController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/metadata", getAllCurriculumsMetadata);
router.get("/:language", authenticate, getCurriculumByLanguage);

// Admin Routes
router.post("/:language/chapter/:chapterId/problem", authenticate, requireAdmin, addProblem);
router.put("/:language/problem/:problemId", authenticate, requireAdmin, updateProblem);
router.delete("/:language/problem/:problemId", authenticate, requireAdmin, deleteProblem);

export default router;
