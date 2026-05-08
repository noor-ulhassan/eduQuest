import Quiz from "../models/Quiz.js";
import Document from "../models/Document.js";
import { generateQuizFromGemini } from "../utils/geminiQuiz.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const generateQuiz = asyncHandler(async (req, res) => {
  const {
    documentId,
    title = "Untitled Quiz",
    numberOfQuestions = 5,
    difficulty = "medium",
  } = req.body;

  const document = await Document.findById(documentId);

  if (!document || document.status !== "ready") {
    throw new ApiError(400, "Document not ready");
  }

  const context = document.chunks
    .sort((a, b) => a.chunkIndex - b.chunkIndex)
    .map(chunk => chunk.content)
    .join("\n\n");

  const MAX_CHARS = 15000;
  const safeContext = context.slice(0, MAX_CHARS);

  const quizData = await generateQuizFromGemini({
    context: safeContext,
    numberOfQuestions,
    difficulty,
  });

  const quiz = await Quiz.create({
    userId: req.user._id,
    documentId,
    title,
    questions: quizData.questions,
  });

  return res.status(201).json(new ApiResponse(201, { data: quiz }));
});
