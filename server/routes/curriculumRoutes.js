import express from "express";
import { 
  getCurriculumByLanguage, 
  getAllCurriculumsMetadata,
  addProblem,
  updateProblem,
  deleteProblem
} from "../controllers/curriculumController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/metadata", getAllCurriculumsMetadata);
router.get("/:language", authenticate, getCurriculumByLanguage);

// Admin Routes (Currently protected by authenticate; later we can add a requireAdmin middleware)
router.post("/:language/chapter/:chapterId/problem", authenticate, addProblem);
router.put("/:language/problem/:problemId", authenticate, updateProblem);
router.delete("/:language/problem/:problemId", authenticate, deleteProblem);

export default router;
