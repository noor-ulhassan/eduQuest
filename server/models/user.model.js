import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, sparse: true },
  name: String,
  email: { type: String, unique: true },
  password: { type: String, default: null },
  googleId: { type: String, default: null },
    avatarUrl: { type: String },

    
    bannerUrl: { type: String },
  provider: { type: String, enum: ["local", "google"], default: "local" },

  refreshToken: { type: String, default: null }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
