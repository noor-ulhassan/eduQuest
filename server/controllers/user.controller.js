import { User } from "../models/user.model.js";

export const getUser = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  // console.log("getUser:", req.user);
  return res.json({
    user: req.user,
  });
};
