import { googleClient } from "../config/googleClient.js";
import { User } from "../models/user.model.js";
import { createToken } from "../utils/createTokens.js";
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
        user.avatarUrl = picture;
        await user.save();
      }
    } else {
      // create new user
      user = await User.create({
        name,
        email,
        googleId: sub,
        avatarUrl: picture,
        provider: "google",
      });
    }

    // Create token
    const token = createToken(user);

    // Set token in HTTP-only cookie
    res.cookie("token", token, cookieOptions);

    return res.json({
      token,
      message: "Google login successful",
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatarUrl,
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

    const token = createToken(user);
    // Send tokens in response
    return res
      .status(200)
      .cookie("token", token, cookieOptions)
      .json({
        token,
        success: true,
        message: `Welcome back ${user.name}`,
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatarUrl,
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

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
};
