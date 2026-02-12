import { googleClient } from "../config/googleClient.js";
import { User } from "../models/user.model.js";
import { createTokens } from "../utils/createTokens.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "Token missing" });

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { sub, email, name, picture } = payload;

    // Check existing user
    let user = await User.findOne({ email });

    if (user) {
      // If existing local account but Google login — update provider
      if (!user.googleId) {
        user.googleId = sub;
        user.provider = "google";
        user.avatar = picture;
        await user.save();
      }
    } else {
      // create new user
      user = await User.create({
        name,
        email,
        googleId: sub,
        avatar: picture,
        provider: "google",
      });
    }

    // Create access + refresh tokens
    const { accessToken, refreshToken } = createTokens(user);

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.json({
      message: "Google login successful",
      accessToken,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider,
        xp: user.xp,
        level: user.level,
        rank: user.rank,
        badges: user.badges,
        dayStreak: user.dayStreak,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Google auth failed" });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
      provider: "local",
    });
    return res.status(201).json({
      success: true,
      message: "Account created Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Register",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }
    if (user.provider === "google") {
      return res.status(400).json({
        success: false,
        message: "Registered via google",
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    const { accessToken, refreshToken } = createTokens(user);
    user.refreshToken = refreshToken;
    await user.save();
    // Send tokens in response
    return res
      .status(200)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        success: true,
        message: `Welcome back ${user.name}`,
        accessToken,
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          provider: user.provider,
          xp: user.xp,
          level: user.level,
          rank: user.rank,
          badges: user.badges,
          dayStreak: user.dayStreak,
        },
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Login",
    });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  console.log("Refresh token called:");
  if (!token) {
    return res.status(402).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // 🔒 IMPORTANT: match refresh token with DB
    if (user.refreshToken !== token) {
      return res.status(403).json({ message: "Refresh token mismatch" });
    }

    // 🔄 Rotate token
    const { accessToken } = createTokens(user);

    return res.status(200).json({
      accessToken,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider,
        xp: user.xp,
        level: user.level,
        rank: user.rank,
        badges: user.badges,
        dayStreak: user.dayStreak,
      },
    });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    const user = await User.findOne({ refreshToken: token });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.json({ success: true, message: "Logged out" });
};
