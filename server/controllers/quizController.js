import Quiz from "../models/Quiz.js";
import Document from "../models/Document.js";
import { generateQuizFromGemini } from "../utils/gemini.js";



export const generateQuiz = async (req, res, next) => {
  try {
    const {
      documentId,
      title="Untitled Quiz",
      numberOfQuestions = 5,
      difficulty = "medium",
    } = req.body;

    
    
    const document = await Document.findById(documentId);

    if (!document || document.status !== "ready") {
      return res.status(400).json({
        success: false,
        message: "Document not ready",
      });
    }

    // 1️⃣ Merge all chunks into one context
    const context = document.chunks
      .sort((a, b) => a.chunkIndex - b.chunkIndex)
      .map(chunk => chunk.content)
      .join("\n\n");

    // Optional: safety length guard (Gemini token limit)
    const MAX_CHARS = 15000;
    const safeContext = context.slice(0, MAX_CHARS);

    // 2️⃣ Call Gemini
    const quizData = await generateQuizFromGemini({
      context: safeContext,
      numberOfQuestions,
      difficulty,
    });

    // 3️⃣ Save quiz
    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId,
      title,
      questions: quizData.questions,
    });

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};
