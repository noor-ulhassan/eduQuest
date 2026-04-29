import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
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
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    // We save the exact questions and answers so the user can review them later
    cloudinaryUrl: { type: String, default: "" },
    qaPairs: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: String, required: true },
        userAnswer: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
        explanation: { type: String, default: "" },
        sourceQuote: { type: String, default: "" },
        pageNumber: { type: Number, default: null },
        sourceChunkIndex: { type: Number, default: null },
      },
    ],
  },
  { timestamps: true }
);

const QuizAttempt =  mongoose.model("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;