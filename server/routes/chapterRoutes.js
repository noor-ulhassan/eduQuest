import express from "express";
import {
  getChaptersByCourse,
  updateChapter,
  removeBlock,
  reorderBlocks,
} from "../controllers/chapterController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:courseId", authenticate, getChaptersByCourse);
router.put("/:chapterId", authenticate, requireAdmin, updateChapter);
router.delete("/:chapterId/blocks/:blockId", authenticate, requireAdmin, removeBlock);
router.put("/:chapterId/reorder", authenticate, requireAdmin, reorderBlocks);

export default router;
