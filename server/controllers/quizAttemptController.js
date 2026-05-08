import QuizAttempt from "../models/QuizAttempt.js";
import Document from "../models/Document.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const saveQuizAttempt = asyncHandler(async (req, res) => {
  const { documentId, score, totalQuestions, qaPairs } = req.body;

  if (!documentId || score === undefined || !totalQuestions || !qaPairs) {
    throw new ApiError(400, "Missing required fields");
  }

  const document = await Document.findById(documentId);
  if (!document) throw new ApiError(404, "Document not found");

  const percentage = Math.round((score / totalQuestions) * 100);

  const attempt = await QuizAttempt.create({
    userId: req.user._id,
    documentId,
    score,
    totalQuestions,
    percentage,
    qaPairs,
    cloudinaryUrl: document.filePath || "",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { data: attempt }, "Quiz attempt saved successfully"));
});

export const getAttemptsByDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;

  const attempts = await QuizAttempt.find({
    documentId,
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { count: attempts.length, data: attempts }),
  );
});
