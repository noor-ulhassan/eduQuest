import express from "express";
import { login, register } from "../controllers/user.controller.js";
import { googleAuth } from "../controllers/auth.controller.js";
import {User} from "../models/user.model.js";
const router = express.Router();
router.route("/register").post(register);
router.route("/login").post(login);
router.post("/google", googleAuth);
router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return res.status(401).json({ message: "User no longer exists" });

    return sendAuthTokens(user, res); // rotates refresh token + new access token
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});
router.post("/logout", (req, res) => {
  res
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    })
    .json({
      success: true,
      message: "Logged out",
    });
});

export default router;
