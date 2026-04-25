import mongoose from "mongoose";

const competitionResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roomCode: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["programming", "general"],
    required: true,
  },
  challengeMode: {
    type: String,
    default: "classic",
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  rank: {
    type: Number,
    default: null, // Null for DNF
  },
  score: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["completed", "dnf"], // Did Not Finish
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for common query patterns
competitionResultSchema.index({ userId: 1, timestamp: -1 });
competitionResultSchema.index({ userId: 1, rank: 1, status: 1 });
competitionResultSchema.index({ roomCode: 1 });
competitionResultSchema.index({ roomCode: 1, userId: 1 });

export const CompetitionResult = mongoose.model(
  "CompetitionResult",
  competitionResultSchema,
);
