import { useState } from "react";
import { Sparkles, FileText } from "lucide-react";
import QuestionCard from "./QuestionCard";
import ScoreScreen from "./ScoreScreen";
import { quizApi } from "../../../services/ragApiService";

function QuizView({ documentId }) {
  const [state, setState]             = useState("idle");
  const [questions, setQuestions]     = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]         = useState({});
  const [score, setScore]             = useState(0);
  const [topic, setTopic]             = useState("");
  const [error, setError]             = useState(null);

  const handleGenerate = async () => {
    setState("generating");
    setError(null);
    try {
      const { questions: q } = await quizApi.generate({ topic: topic.trim() || undefined, documentId });
      setQuestions(q);
      setCurrentIndex(0);
      setAnswers({});
      setScore(0);
      setState("active");
    } catch (err) {
      setError(err.message || "Failed to generate quiz. Please try again.");
      setState("idle");
    }
  };

  const handleAnswer = (questionId, selectedIndex) => {
    const question = questions.find((q) => q.id === questionId);
    if (question.correctIndex === selectedIndex) setScore((p) => p + 1);
    setAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((p) => p + 1);
    else setState("finished");
  };

  const handleRetake = () => {
    setState("idle");
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setScore(0);
    setError(null);
  };

  if (!documentId) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-zinc-600">
        <FileText size={44} className="mb-4 text-zinc-700" />
        <p className="font-medium text-zinc-500">No document loaded</p>
        <p className="text-sm mt-1">Upload a PDF first to generate quizzes.</p>
      </div>
    );
  }

  if (state === "idle") {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-8 text-center">
          {/* Icon */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 to-orange-500/20 rounded-2xl blur-lg" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-red-600/20 to-orange-500/20 rounded-2xl border border-red-500/20 flex items-center justify-center">
              <Sparkles size={28} className="text-red-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Document Quiz</h2>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            AI generates 5 multiple-choice questions from your document.
            Optionally focus on a specific topic.
          </p>

          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Focus topic (optional)…"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-500/50 mb-4 transition-colors"
          />

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles size={16} /> Generate Quiz
          </button>
        </div>
      </div>
    );
  }

  if (state === "generating") {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-5">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-t-red-500 border-r-orange-500 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-zinc-300 font-medium">Generating quiz questions…</p>
          <p className="text-xs text-zinc-600 mt-1">Analyzing your document. This may take a moment.</p>
        </div>
      </div>
    );
  }

  if (state === "finished") {
    return <ScoreScreen score={score} total={questions.length} onRetake={handleRetake} />;
  }

  const currentQuestion = questions[currentIndex];
  const selectedAnswer  = answers[currentQuestion.id];
  const hasAnswered     = selectedAnswer !== undefined;
  const progress        = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Progress */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
          <span>Progress</span>
          <span className="font-medium text-zinc-400">
            {currentIndex + 1} <span className="text-zinc-700">/ {questions.length}</span>
          </span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card — scrollable if long */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <QuestionCard
          question={currentQuestion}
          selectedIndex={selectedAnswer}
          onAnswer={(index) => handleAnswer(currentQuestion.id, index)}
        />
      </div>

      {/* Next button */}
      {hasAnswered && (
        <div className="flex justify-end flex-shrink-0">
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-red-500/20 text-sm"
          >
            {currentIndex < questions.length - 1 ? 'Next Question →' : 'See Results →'}
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizView;
