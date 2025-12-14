import { User } from "../models/user.model.js";

export const getUser = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  // console.log("getUser:", req.user);
  return res.json({
    user: req.user,
  });
};

//i donut know what to do here

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
