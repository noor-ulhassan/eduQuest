import { useState, useEffect } from "react";
import {
  Sparkles,
  FileText,
  ArrowLeft,
  Trophy,
  ChevronRight,
  Clock,
} from "lucide-react";
import QuestionCard from "./QuestionCard";
import ScoreScreen from "./ScoreScreen";
import ContextModal from "./ContextModal";
import AttemptReviewView from "./AttemptReviewView";
import { quizApi } from "../../../services/ragApiService";

function gradeFor(pct) {
  if (pct === 100) return { label: "Perfect", color: "text-yellow-400" };
  if (pct >= 80) return { label: "Excellent", color: "text-emerald-400" };
  if (pct >= 70) return { label: "Good", color: "text-blue-400" };
  if (pct >= 50) return { label: "Keep Going", color: "text-orange-400" };
  return { label: "Try Again", color: "text-red-400" };
}

function AttemptCard({ attempt, onClick }) {
  const grade = gradeFor(attempt.percentage);
  const date = new Date(attempt.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#111111] border border-white/10 rounded-xl p-4 hover:border-white/20 hover:bg-[#161616] transition-all flex items-center gap-4 group"
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600/20 to-orange-500/20 border border-red-500/20 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-black text-red-400">
          {attempt.percentage}%
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">
          {attempt.score}/{attempt.totalQuestions} correct
        </p>
        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
          <Clock size={10} /> {date}
        </p>
      </div>
      <span className={`text-xs font-bold ${grade.color} flex-shrink-0`}>
        {grade.label}
      </span>
      <ChevronRight
        size={14}
        className="text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0"
      />
    </button>
  );
}

function QuizView({ documentId, pdfUrl }) {
  const [state, setState] = useState("idle");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [topic, setTopic] = useState("");
  const [error, setError] = useState(null);
  const [contextData, setContextData] = useState(null);

  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const fetchAttempts = () => {
    if (!documentId) return;
    setAttemptsLoading(true);
    quizApi
      .getAttempts(documentId)
      .then(({ data }) => setAttempts(data || []))
      .catch(() => {})
      .finally(() => setAttemptsLoading(false));
  };

  useEffect(fetchAttempts, [documentId]);

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
      setError(err.message || "Failed to generate quiz. Please try again.");
      setState("idle");
    }
  };

  const handleAnswer = (questionId, selectedIndex) => {
    const question = questions.find((q) => q.id === questionId);
    if (question.correctIndex === selectedIndex) setScore((p) => p + 1);
    setAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));
  };

  const doSaveAttempt = () => {
    const qaPairs = questions.map((q) => {
      const userAnswerIndex = answers[q.id];
      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.options[q.correctIndex],
        userAnswer:
          userAnswerIndex !== undefined ? q.options[userAnswerIndex] : "",
        isCorrect: userAnswerIndex === q.correctIndex,
        explanation: q.explanation || "",
        sourceQuote: q.exactQuote || "",
        pageNumber: q.pageNumber || null,
      };
    });

    quizApi
      .saveAttempt({
        documentId,
        score,
        totalQuestions: questions.length,
        qaPairs,
      })
      .then(() => fetchAttempts()) // refresh list
      .catch((err) => console.error("Failed to save quiz attempt:", err));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((p) => p + 1);
    } else {
      doSaveAttempt();
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
    setContextData(null);
  };

  const handleReview = () => setState("review");

  // ── Attempt split-view (takes over full layout) ──────────────────────────
  if (selectedAttempt) {
    return (
      <AttemptReviewView
        attempt={selectedAttempt}
        pdfUrl={pdfUrl || selectedAttempt.cloudinaryUrl}
        onClose={() => setSelectedAttempt(null)}
      />
    );
  }

  // ── No document ──────────────────────────────────────────────────────────
  if (!documentId) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-zinc-600">
        <FileText size={44} className="mb-4 text-zinc-700" />
        <p className="font-medium text-zinc-500">No document loaded</p>
        <p className="text-sm mt-1">Upload a PDF first to generate quizzes.</p>
      </div>
    );
  }

  // ── Idle ─────────────────────────────────────────────────────────────────
  if (state === "idle") {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Quiz generator card */}
        <div className="flex justify-center px-4 pt-6 pb-4">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-8 text-center">
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
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
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

        {/* Previous attempts */}
        <div className="px-4 pb-6 w-full max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-zinc-500" />
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Previous Attempts
            </h3>
          </div>

          {attemptsLoading && (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-[68px] rounded-xl bg-[#111111] border border-white/10 animate-pulse"
                />
              ))}
            </div>
          )}

          {!attemptsLoading && attempts.length === 0 && (
            <div className="text-center py-6 text-zinc-600 text-sm">
              No previous attempts. Take a quiz to see your history.
            </div>
          )}

          {!attemptsLoading && attempts.length > 0 && (
            <div className="space-y-2">
              {attempts.map((attempt) => (
                <AttemptCard
                  key={attempt._id}
                  attempt={attempt}
                  onClick={() => setSelectedAttempt(attempt)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Generating ───────────────────────────────────────────────────────────
  if (state === "generating") {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-5">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-t-red-500 border-r-orange-500 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-zinc-300 font-medium">
            Generating quiz questions…
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            Analyzing your document. This may take a moment.
          </p>
        </div>
      </div>
    );
  }

  // ── Finished ─────────────────────────────────────────────────────────────
  if (state === "finished") {
    return (
      <ScoreScreen
        score={score}
        total={questions.length}
        onRetake={handleRetake}
        onReview={handleReview}
      />
    );
  }

  // ── Current-session review (modal-based) ─────────────────────────────────
  if (state === "review") {
    return (
      <div className="flex flex-col h-full gap-4 overflow-hidden">
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setState("finished")}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <h3 className="text-sm font-bold text-white">Review Answers</h3>
          </div>
          <button
            onClick={handleRetake}
            className="text-xs text-zinc-500 hover:text-white transition-colors"
          >
            New Quiz
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-1">
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              selectedIndex={answers[q.id]}
              isReview
              onShowContext={
                q.exactQuote && q.pageNumber && pdfUrl
                  ? () =>
                      setContextData({
                        pageNumber: q.pageNumber,
                        exactQuote: q.exactQuote,
                      })
                  : undefined
              }
            />
          ))}
        </div>

        {contextData && (
          <ContextModal
            pdfUrl={pdfUrl}
            pageNumber={contextData.pageNumber}
            exactQuote={contextData.exactQuote}
            onClose={() => setContextData(null)}
          />
        )}
      </div>
    );
  }

  // ── Active quiz ───────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentQuestion.id];
  const hasAnswered = selectedAnswer !== undefined;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
          <span>Progress</span>
          <span className="font-medium text-zinc-400">
            {currentIndex + 1}{" "}
            <span className="text-zinc-700">/ {questions.length}</span>
          </span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <QuestionCard
          question={currentQuestion}
          selectedIndex={selectedAnswer}
          onAnswer={(index) => handleAnswer(currentQuestion.id, index)}
        />
      </div>

      {hasAnswered && (
        <div className="flex justify-end flex-shrink-0">
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-red-500/20 text-sm"
          >
            {currentIndex < questions.length - 1
              ? "Next Question →"
              : "See Results →"}
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizView;
