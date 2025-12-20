import express from "express";
import { User } from "../models/user.model.js";
import { getUser } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/getUser",authenticate, getUser)
export default router;

