import mongoose from "mongoose";

const competitionResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roomId: {
    type: String, // Determine if we need ObjectId or just roomCode string
    required: false,
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

export const CompetitionResult = mongoose.model(
  "CompetitionResult",
  competitionResultSchema,
);
