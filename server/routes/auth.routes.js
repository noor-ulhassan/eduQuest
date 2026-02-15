import express from "express";

import {
  login,
  register,
  googleAuth,
  logout,
} from "../controllers/auth.controller.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);

router.post("/logout", logout);

export default router;
