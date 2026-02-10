import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, sparse: true },
    name: String,
    email: { type: String, unique: true },
    password: { type: String, default: null },
    googleId: { type: String, default: null },
    avatarUrl: { type: String },

    bannerUrl: { type: String },
    provider: { type: String, enum: ["local", "google"], default: "local" },

    refreshToken: { type: String, default: null },
    skills: [{ type: String, default: [] }],

    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    rank: {
      type: String,
      default: "Novice",
    },
    badges: [
      {
        title: { type: String },
        icon: { type: String }, // e.g., "Zap", "Award", "Flame"
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    lastSolvedDate: {
      type: Date,
      default: null,
    },
    dayStreak: {
      type: Number,
      default: 0,
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
