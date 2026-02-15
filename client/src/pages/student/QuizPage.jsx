import { useState } from "react";
import Navbar from "../../layout/Navbar.jsx";
import {
  Loader2Icon,
  PlayIcon,
  SparklesIcon,
  BrainIcon,
  CheckIcon,
  XIcon,
  ChevronRightIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

function QuizPage() {
  const [quiz, setQuiz] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previousQuestions, setPreviousQuestions] = useState(new Set());

  const generateQuiz = async (showToast = true) => {
    setIsLoading(true);
    setFeedback(null);
    setUserAnswer("");
    setQuiz(null);

    try {
      const uniqueId = Math.random().toString(36).substring(2, 10);
      const promptText = `
        You are a programming quiz generator.
        Generate a *new, unique* MCQ that has never been generated before.
        Unique ID: ${uniqueId}.
        Focus on: data structures, algorithms, OOP, complexity.
        Output ONLY valid JSON — no markdown, no extra text.
        Format:
        {
          "question": "Question?",
          "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
          "correctAnswer": "B) ..."
        }
      `;

      const response = await fetch(
        `${GEMINI_API_URL}?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: promptText }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 400,
              temperature: 0.95,
              topP: 0.95,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No text in response");

      let cleanText = text.trim();
      const jsonMatch = cleanText.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
      if (jsonMatch) cleanText = jsonMatch[1];

      const parsed = JSON.parse(cleanText);

      if (
        !parsed.question ||
        !Array.isArray(parsed.options) ||
        parsed.options.length !== 4 ||
        !parsed.correctAnswer
      ) {
        throw new Error("Invalid quiz format");
      }

      if (previousQuestions.has(parsed.question)) {
        return generateQuiz(false); // regenerate
      }
      setPreviousQuestions((prev) => new Set(prev).add(parsed.question));

      setQuiz(parsed);
    } catch (err) {
      console.error("Quiz generation failed:", err);
      if (showToast) toast.error("AI is busy — using backup quiz!");

      // Single safe fallback
      const fallbacks = [
        {
          question: "What is the time complexity of binary search?",
          options: ["A) O(1)", "B) O(log n)", "C) O(n)", "D) O(n²)"],
          correctAnswer: "B) O(log n)",
        },
        {
          question: "Which uses LIFO?",
          options: ["A) Queue", "B) Stack", "C) Tree", "D) Graph"],
          correctAnswer: "B) Stack",
        },
      ];
      setQuiz(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    } finally {
      setIsLoading(false);
    }
  };

  const evaluateAnswer = () => {
    if (!quiz || !userAnswer) return;
    const isCorrect = userAnswer === quiz.correctAnswer;
    setFeedback({
      isCorrect,
      message: isCorrect ? "Correct! " : "Try again!",
      correctAnswer: isCorrect ? null : quiz.correctAnswer,
    });
    toast[isCorrect ? "success" : "error"](
      isCorrect ? "Well done!" : "Keep learning!"
    );
  };

  const handleNextQuiz = () => generateQuiz(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 mt-24">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <BrainIcon className="size-5 text-primary" />
            <span className="font-medium text-primary">AI Quiz</span>
          </div>
          <h1 className="text-3xl font-bold">Test Your Skills</h1>
        </div>

        {!quiz && !isLoading && (
          <div className="flex justify-center">
            <button
              className="btn btn-primary btn-lg gap-2"
              onClick={() => generateQuiz(true)}
            >
              <SparklesIcon className="size-5" /> Start Quiz
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center py-20">
            <Loader2Icon className="size-10 animate-spin text-primary mb-4" />
            <p>Generating your quiz...</p>
          </div>
        )}

        {quiz && !isLoading && (
          <div className="card bg-base-100 border rounded-2xl shadow-xl">
            <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4">
              <h2 className="text-base font-semibold text-white">Challenge</h2>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">{quiz.question}</h3>
              <div className="space-y-3 mb-6">
                {quiz.options.map((opt, i) => (
                  <label
                    key={i}
                    className={`flex gap-3 p-3 rounded-lg border cursor-pointer ${
                      userAnswer === opt
                        ? "border-primary bg-primary/5"
                        : "border-base-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="q"
                      value={opt}
                      checked={userAnswer === opt}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="radio radio-primary"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  className={`btn ${
                    userAnswer ? "btn-success" : "btn-disabled"
                  }`}
                  onClick={evaluateAnswer}
                >
                  <PlayIcon className="size-4 mr-1" /> Submit
                </button>
              </div>

              {feedback && (
                <div className="mt-6">
                  <div
                    className={`p-4 rounded-lg ${
                      feedback.isCorrect
                        ? "bg-success/10 border-success"
                        : "bg-error/10 border-error"
                    } border`}
                  >
                    <div className="flex gap-2">
                      {feedback.isCorrect ? (
                        <CheckIcon className="size-5 text-success" />
                      ) : (
                        <XIcon className="size-5 text-error" />
                      )}
                      <span>{feedback.message}</span>
                    </div>
                    {!feedback.isCorrect && (
                      <p className="mt-1 text-sm">
                        Correct: {feedback.correctAnswer}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-center mt-4">
                    <button
                      className="btn btn-primary btn-sm gap-1"
                      onClick={handleNextQuiz}
                    >
                      <ChevronRightIcon className="size-4" /> Next Quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizPage;
