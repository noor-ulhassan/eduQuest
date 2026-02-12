import express from "express";
import upload  from "../config/multer.js";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  updateDocument,
} from "../controllers/documentController.js";

const router = express.Router();

router.use(authenticate);

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", getDocuments);
// router.get("/:id", getDocument);
// router.delete("/:id", deleteDocument);
// router.put("/:id", updateDocument);

export default router;
