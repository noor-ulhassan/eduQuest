import { googleClient } from "../config/googleClient.js";
import { User } from "../models/user.model.js";
import { createToken } from "../utils/createTokens.js";
import bcrypt from "bcryptjs";
import { checkStreak } from "../utils/streak.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new ApiError(400, "Token missing");

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub, email, name, picture } = payload;

  let user = await User.findOne({ email });

  if (user) {
    if (!user.googleId) {
      user.googleId = sub;
      user.provider = "google";
      user.avatarUrl = picture;
      await user.save();
    }
  } else {
    const baseUsername = email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const username = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
    user = await User.create({
      name,
      email,
      username,
      googleId: sub,
      avatarUrl: picture,
      provider: "google",
    });
  }

  if (user.dayStreak > 0) {
    user = await checkStreak(user);
  }

  const token = createToken(user);
  res.cookie("token", token, cookieOptions);

  return res.json(
    new ApiResponse(
      200,
      {
        token,
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatarUrl,
          provider: user.provider,
          xp: user.xp,
          level: user.level,
          league: user.league,
          badges: user.badges,
          dayStreak: user.dayStreak,
          role: user.role,
        },
      },
      "Google login successful",
    ),
  );
});

export const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const name = req.body.name || req.body.fullName;
  if (!name || !email || !password) {
    throw new ApiError(400, "All fields required");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  const user = await User.findOne({ email });
  if (user) {
    throw new ApiError(400, "User already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  let role = "user";

  if (req.body.adminPasscode) {
    const serverSecret = process.env.ADMIN_SECRET_KEY || "eduquest_admin_777";
    if (req.body.adminPasscode === serverSecret) {
      role = "admin";
    } else {
      throw new ApiError(401, "Invalid Admin Passcode");
    }
  }

  const baseUsername = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const username = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;

  await User.create({
    name,
    email,
    username,
    password: hashedPassword,
    provider: "local",
    role,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, null, "Account created Successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  let user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "Incorrect email or password");
  }
  if (user.provider === "google") {
    throw new ApiError(400, "Registered via google");
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(400, "Incorrect email or password");
  }

  if (req.body.adminPasscode) {
    const serverSecret = process.env.ADMIN_SECRET_KEY || "eduquest_admin_777";
    if (req.body.adminPasscode === serverSecret) {
      user.role = "admin";
      await user.save();
    } else {
      throw new ApiError(401, "Invalid Admin Passcode");
    }
  }

  if (user.dayStreak > 0) {
    user = await checkStreak(user);
  }

  const token = createToken(user);

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          token,
          user: {
            name: user.name,
            email: user.email,
            avatar: user.avatarUrl,
            provider: user.provider,
            xp: user.xp,
            level: user.level,
            league: user.league,
            badges: user.badges,
            dayStreak: user.dayStreak,
            role: user.role,
          },
        },
        `Welcome back ${user.name}`,
      ),
    );
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});
