import { googleClient } from "../config/googleClient.js";
import { User } from "../models/user.model.js";
import { createTokens } from "../utils/createTokens.js";

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
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Google login successful",
      accessToken,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Google auth failed" });
  }
};
