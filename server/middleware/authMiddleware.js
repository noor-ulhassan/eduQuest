// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    // console.log("Extracted Token:", token);
    if (!token) return res.status(401).json({ message: "Login Required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    // If token expired or invalid
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
