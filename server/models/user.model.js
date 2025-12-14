import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, default: null },
  googleId: { type: String, default: null },
  avatar: String,
  provider: { type: String, enum: ["local", "google"], default: "local" },

  refreshToken: { type: String, default: null },
  totalRewards: { type: Number, default: 0 },
  dailyStreak: { type: Number, default: 0 },
  badges: { type: Number, default: 0 },
  level: { type: Number, default: 1 }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
