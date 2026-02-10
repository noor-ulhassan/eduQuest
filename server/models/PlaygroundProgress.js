import mongoose from "mongoose";

const PlaygroundProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["html", "css", "javascript"],
    },
    completedProblems: {
      type: [String],
      default: [],
    },
    totalXpEarned: {
      type: Number,
      default: 0,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Compound unique index: one progress doc per user per language
PlaygroundProgressSchema.index({ userId: 1, language: 1 }, { unique: true });

const PlaygroundProgress = mongoose.model(
  "PlaygroundProgress",
  PlaygroundProgressSchema,
);

export default PlaygroundProgress;
