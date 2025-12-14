import { User } from "../models/user.model.js";

export const getUser = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  // console.log("getUser:", req.user);
  return res.json({
    user: req.user,
  });
};
// for making page dynamic

export const getUserProfile = async (req, res) => {
  try {
    // Mock data for now (replace with real auth later)
    const mockUser = {
      email: "noor@gmail.com",
      totalRewards: 20,
      dailyStreak: 20,
      badges: 3,
      level: 2,
      avatar: "/alex_walk.gif"
    };
    return res.status(200).json(mockUser);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};
