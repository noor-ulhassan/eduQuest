import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  questions: [
    {
      question: {
        type: [String],
        required: true,
        validate: [(arr) => Array.length === 4, "Must have exactly 4 options"],
      },
      correctAnswer: {
        type: String,
        required: true,
      },
      explanation: {
        type: String,
        default: "",
      },
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
      },
    },
  ],
});
