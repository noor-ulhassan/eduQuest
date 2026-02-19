import QuizAttempt from "../models/QuizAttempt.js";
import Document from "../models/Document.js";

// @desc    Save a new quiz attempt
// @route   POST /api/quiz-attempts
// @access  Private
export const saveQuizAttempt = async (req, res, next) => {
  try {
    const { documentId, score, totalQuestions, qaPairs } = req.body;

    // 1. Basic Validation
    if (!documentId || score === undefined || !totalQuestions || !qaPairs) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // 2. Verify Document Exists
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    // 3. Calculate percentage on the backend (safer than trusting the frontend)
    const percentage = Math.round((score / totalQuestions) * 100);

    // 4. Save to Database
    const attempt = await QuizAttempt.create({
      userId: req.user._id,
      documentId,
      score,
      totalQuestions,
      percentage,
      qaPairs,
    });

    res.status(201).json({
      success: true,
      data: attempt,
      message: "Quiz attempt saved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quiz attempts for a specific document
// @route   GET /api/quiz-attempts/document/:documentId
// @access  Private
export const getAttemptsByDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    // Fetch attempts, ensuring they belong to the logged-in user
    const attempts = await QuizAttempt.find({
      documentId,
      userId: req.user._id,
    }).sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts,
    });
  } catch (error) {
    next(error);
  }
};