import { useState } from "react";
import { Sparkles, FileText } from "lucide-react";
import QuestionCard from "./QuestionCard";
import ScoreScreen from "./ScoreScreen";
import { quizApi } from "../../../services/ragApiService";

function QuizView({ documentId }) {
  const [state, setState] = useState("idle");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [topic, setTopic] = useState("");
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setState("generating");
    setError(null);
    try {
      const { questions: q } = await quizApi.generate({
        topic: topic.trim() || undefined,
        documentId,
      });
      setQuestions(q);
      setCurrentIndex(0);
      setAnswers({});
      setScore(0);
      setState("active");
    } catch (err) {
      console.error("Failed to generate quiz:", err);
      setError(err.message || "Failed to generate quiz. Please try again.");
      setState("idle");
    }
  };

  const handleAnswer = (questionId, selectedIndex) => {
    const question = questions.find((q) => q.id === questionId);
    const isCorrect = question.correctIndex === selectedIndex;

    setAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setState("finished");
    }
  };

  const handleRetake = () => {
    setState("idle");
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setScore(0);
    setError(null);
  };

  // No document uploaded yet
  if (!documentId) {
    return (
      <div className="h-[calc(100vh-180px)] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="font-medium">No document loaded</p>
          <p className="text-sm mt-1">
            Upload a PDF first to generate quizzes.
          </p>
        </div>
      </div>
    );
  }

  if (state === "idle") {
    return (
      <div className="h-[calc(100vh-180px)] flex items-center justify-center">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Document Quiz
          </h2>
          <p className="text-gray-600 mb-6">
            Test your understanding with AI-generated questions based on the
            document content.
          </p>

          <div className="mb-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Focus on a specific topic (optional)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
          >
            <Sparkles size={18} />
            Generate Quiz
          </button>
        </div>
      </div>
    );
  }

  if (state === "generating") {
    return (
      <div className="h-[calc(100vh-180px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            Generating quiz questions from the document...
          </p>
          <p className="text-sm text-gray-400 mt-1">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (state === "finished") {
    return (
      <ScoreScreen
        score={score}
        total={questions.length}
        onRetake={handleRetake}
      />
    );
  }

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentQuestion.id];
  const hasAnswered = selectedAnswer !== undefined;

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="flex-1">
        <QuestionCard
          question={currentQuestion}
          selectedIndex={selectedAnswer}
          onAnswer={(index) => handleAnswer(currentQuestion.id, index)}
        />
      </div>

      {hasAnswered && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            {currentIndex < questions.length - 1
              ? "Next Question"
              : "See Results"}
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizView;
