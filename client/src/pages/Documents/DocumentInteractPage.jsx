import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "@/features/auth/authApi";
import { grantXP } from "@/utils/gamificationHelper.js";
import confetti from "canvas-confetti";

import {
  Loader2,
  CheckCircle,
  History,
  FileText,
  Target,
  Search,
  X,
  ArrowLeft,
  Trophy,
  Award,
  Zap,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import HighlightPDFViewer from "./HighlightPDFViewer.jsx";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300 },
  },
};

// Static color maps — fully spelled out so Tailwind can tree-shake correctly
const OPTION_STYLES = [
  {
    base: "bg-red-500",
    selected: "bg-red-600 ring-4 ring-red-300 ring-offset-2",
    dimmed: "bg-red-500/50",
  },
  {
    base: "bg-blue-500",
    selected: "bg-blue-600 ring-4 ring-blue-300 ring-offset-2",
    dimmed: "bg-blue-500/50",
  },
  {
    base: "bg-yellow-500",
    selected: "bg-yellow-600 ring-4 ring-yellow-300 ring-offset-2",
    dimmed: "bg-yellow-500/50",
  },
  {
    base: "bg-emerald-500",
    selected: "bg-emerald-600 ring-4 ring-emerald-300 ring-offset-2",
    dimmed: "bg-emerald-500/50",
  },
];

const DocumentInteractPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- State ---
  const [doc, setDoc] = useState(null);
  const [pastAttempts, setPastAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quiz State
  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [savingResult, setSavingResult] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // --- REVIEW MODE STATE ---
  const [reviewingAttempt, setReviewingAttempt] = useState(null);
  const [activeQuote, setActiveQuote] = useState("");

  // 1. Fetch Doc Details & Past Attempts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, attemptsRes] = await Promise.all([
          api.get(`/documents/${id}`),
          api.get(`/quiz-attempts/document/${id}`),
        ]);

        setDoc(docRes.data.data);
        setPastAttempts(attemptsRes.data.data || []);
      } catch (error) {
        toast.error("Failed to load document data");
        navigate("/documents");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // 2. Generate Quiz
  const handleGenerateQuiz = async () => {
    setGenerating(true);
    try {
      const res = await api.post("/quiz/generate-quiz", {
        documentId: id,
        title: `Quiz: ${doc.title}`,
        numberOfQuestions: 5,
        difficulty: "medium",
      });

      const quizData = res.data.data;

      // Guard: if Gemini returned an empty or invalid questions array, bail
      if (
        !quizData?.questions ||
        !Array.isArray(quizData.questions) ||
        quizData.questions.length === 0
      ) {
        toast.error(
          "System returned an empty quiz. Please try again!",
        );
        return;
      }

      setQuiz(quizData);
      setAnswers({});
      setResult(null);
      setCurrentQuestionIndex(0);
      toast.success("Quiz generated successfully!");
    } catch (error) {
      console.error("Quiz generation error:", error);
      toast.error("Failed to generate quiz. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  // 3. Submit Quiz & Save to DB
  const handleSubmitQuiz = async () => {
    // Find any unanswered questions first
    const totalQ = quiz.questions.length;
    const unanswered = [];
    for (let i = 0; i < totalQ; i++) {
      if (answers[i] === undefined || answers[i] === null) {
        unanswered.push(i + 1);
      }
    }
    if (unanswered.length > 0) {
      toast.error(
        `You missed Question${unanswered.length > 1 ? "s" : ""} ${unanswered.join(", ")}! Go back and answer ${unanswered.length > 1 ? "them" : "it"}.`,
      );
      // Jump to the first unanswered question
      setCurrentQuestionIndex(unanswered[0] - 1);
      return;
    }

    setSavingResult(true);
    let score = 0;

    const qaPairs = quiz.questions.map((q, index) => {
      const isCorrect = answers[index] === q.correctAnswer;
      if (isCorrect) score++;

      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: answers[index] || "",
        isCorrect: isCorrect,
        sourceQuote: q.sourceQuote,
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    try {
      const attemptRes = await api.post("/quiz-attempts", {
        documentId: id,
        score,
        totalQuestions,
        qaPairs,
      });

      setResult({ score, total: totalQuestions, percentage });
      setPastAttempts([attemptRes.data.data, ...pastAttempts]);

      if (percentage >= 80) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: [
            "#26ccff",
            "#a25afd",
            "#ff5e7e",
            "#88ff5a",
            "#fcff42",
            "#ffa62d",
            "#ff36ff",
          ],
        });
        toast.success(`Incredible! You earned 100 XP 🏆`);
      } else if (percentage >= 50) {
        toast.success(`Good effort! You earned 50 XP ⚡`);
      } else {
        toast.success(`Keep studying! You earned 10 XP`);
      }
    } catch (error) {
      toast.error("Failed to save quiz results.");
    } finally {
      setSavingResult(false);
    }
  };

  const getRankBadge = (percentage) => {
    if (percentage >= 90)
      return {
        icon: <Trophy className="w-5 h-5 text-yellow-400" />,
        bg: "bg-yellow-100",
        border: "border-yellow-200",
        text: "text-yellow-700",
        label: "Gold Pass",
      };
    if (percentage >= 75)
      return {
        icon: <Award className="w-5 h-5 text-slate-400" />,
        bg: "bg-slate-100",
        border: "border-slate-200",
        text: "text-slate-700",
        label: "Silver Pass",
      };
    if (percentage >= 50)
      return {
        icon: <Award className="w-5 h-5 text-amber-700" />,
        bg: "bg-amber-100",
        border: "border-amber-200",
        text: "text-amber-800",
        label: "Bronze Pass",
      };
    return {
      icon: <Target className="w-5 h-5 text-red-400" />,
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-700",
      label: "Needs Review",
    };
  };

  // Helper: count answered questions
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = quiz?.questions?.[currentQuestionIndex];

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-20 space-y-4 bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium animate-pulse">
          Establishing secure link to the Knowledge Vault...
        </p>
      </div>
    );
  if (!doc) return null;

  return (
    <div className="bg-slate-50 min-h-screen pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!quiz && !reviewingAttempt && (
          <Button
            variant="ghost"
            onClick={() => navigate("/documents")}
            className="mb-4 pl-0 hover:bg-transparent text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Vault
          </Button>
        )}

        {/* Document Header */}
        {!reviewingAttempt && !quiz && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight line-clamp-1">
                  {doc.title}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
                  >
                    {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                  </Badge>
                  <span className="text-slate-400 text-sm">
                    Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open(doc.filePath, "_blank")}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 w-full sm:w-auto h-12 px-6 font-bold shadow-sm"
            >
              View Original PDF
            </Button>
          </motion.div>
        )}

        {/* --- STATE D: REVIEWING PAST ATTEMPT (SPLIT SCREEN) --- */}
        {reviewingAttempt ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[85vh]"
          >
            {/* LEFT COLUMN: PDF Viewer */}
            <div className="lg:col-span-1 flex flex-col h-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="flex flex-wrap justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center">
                  <FileText className="mr-2 w-5 h-5 text-indigo-600" /> Source
                  Context
                </h3>
                {activeQuote && (
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full animate-pulse border border-amber-200 flex items-center gap-1">
                    <Search className="w-3 h-3" /> Locating Highlight...
                  </span>
                )}
              </div>
              <div className="flex-grow bg-slate-100 overflow-hidden relative">
                <HighlightPDFViewer
                  fileUrl={doc.filePath}
                  highlightQuote={activeQuote}
                />
                {!activeQuote && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-slate-900/5 backdrop-blur-[1px]">
                    <div className="bg-white/90 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 shadow-sm flex items-center gap-2">
                      <Search className="w-4 h-4 text-indigo-500" /> Click a
                      &quot;Find Source&quot; button on the right to jump to the
                      text.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Quiz Review */}
            <div className="lg:col-span-1 flex flex-col h-full overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center bg-slate-900 text-white p-5 shrink-0">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-400" /> Reviewing
                    Attempt
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-400 text-sm font-medium">
                      Accuracy:{" "}
                    </span>
                    <span
                      className={`text-sm font-bold ${reviewingAttempt.percentage >= 80 ? "text-emerald-400" : "text-amber-400"}`}
                    >
                      {reviewingAttempt.percentage}%
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300"
                  onClick={() => {
                    setReviewingAttempt(null);
                    setActiveQuote("");
                  }}
                >
                  <X className="w-4 h-4 mr-2" /> Exit Review
                </Button>
              </div>

              <div className="overflow-y-auto p-5 space-y-6">
                {reviewingAttempt.qaPairs.map((qa, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border-2 transition-all hover:shadow-md ${qa.isCorrect ? "bg-emerald-50/30 border-emerald-100 text-emerald-900" : "bg-red-50/30 border-red-100 text-red-900"}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-start">
                        <span
                          className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-black text-sm ${qa.isCorrect ? "bg-emerald-200 text-emerald-700" : "bg-red-200 text-red-700"}`}
                        >
                          {idx + 1}
                        </span>
                        <p className="font-bold text-slate-800 pt-1 leading-snug">
                          {qa.question}
                        </p>
                      </div>
                      {qa.isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                      ) : (
                        <X className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                      )}
                    </div>

                    <div className="ml-11 space-y-2 text-sm bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-slate-500 w-16 shrink-0 underline decoration-slate-200 underline-offset-4">
                          You:
                        </span>
                        <span
                          className={
                            qa.isCorrect
                              ? "text-emerald-600 font-bold"
                              : "text-red-500 font-bold line-through decoration-red-300"
                          }
                        >
                          {qa.userAnswer || "Skipped"}
                        </span>
                      </div>
                      {!qa.isCorrect && (
                        <div className="flex items-start gap-2 pt-2 border-t border-slate-50 mt-2">
                          <span className="font-semibold text-slate-500 w-16 shrink-0">
                            Correct:
                          </span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            {qa.correctAnswer}{" "}
                            <CheckCircle className="w-3 h-3" />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* HIGHLIGHT TRIGGER BUTTON */}
                    {qa.sourceQuote && (
                      <div className="ml-11 mt-4">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 font-semibold border border-indigo-100 rounded-lg group"
                          onClick={() => {
                            setActiveQuote(qa.sourceQuote);
                          }}
                        >
                          <Search className="w-3.5 h-3.5 mr-2 text-indigo-400 group-hover:text-indigo-600" />
                          Find Source in PDF
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* --- NON-REVIEW STATES (A, B, C) --- */
          <>
            {/* --- STATE A: Default View --- */}
            {!quiz && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Generate New Quiz Banner */}
                <motion.div
                  variants={itemVariants}
                  className="lg:col-span-3 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-[2rem] p-10 sm:p-14 text-center shadow-xl"
                >
                  {/* Decorative faint icons */}
                  <div className="absolute top-10 left-10 opacity-10">
                    <Target className="w-32 h-32 text-white" />
                  </div>
                  <div className="absolute bottom-10 right-10 opacity-10">
                    <Zap className="w-32 h-32 text-white" />
                  </div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl inline-block mb-6 border border-white/20 shadow-inner">
                      <Target className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">
                      Test Your Knowledge
                    </h2>
                    <p className="text-indigo-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto font-medium">
                      Challenge yourself. Instantly generate a
                      targeted quiz utilizing context directly from this
                      document.
                    </p>
                    <Button
                      size="lg"
                      onClick={handleGenerateQuiz}
                      disabled={generating || doc.status !== "ready"}
                      className="bg-white hover:bg-slate-50 text-indigo-700 font-black px-10 py-7 rounded-2xl text-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(255,255,255,0.2)] hover:-translate-y-1 transition-all"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="animate-spin mr-3 hidden sm:inline-block h-6 w-6" />
                          Preparing Quiz...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-3 fill-indigo-500 h-6 w-6" />
                          Start Practice Quiz
                        </>
                      )}
                    </Button>
                    {doc.status !== "ready" && (
                      <div className="mt-6 flex items-center gap-2 bg-amber-500/20 text-yellow-300 px-4 py-2 rounded-full border border-amber-400/30 backdrop-blur-sm text-sm font-bold">
                        <Loader2 className="w-4 h-4 animate-spin" /> Document
                        index processing. Please wait...
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Past Attempts Grid */}
                <motion.div
                  variants={itemVariants}
                  className="lg:col-span-3 mt-6"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                      <Trophy className="w-8 h-8 text-indigo-500 fill-indigo-100" />
                      Trophy Room
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-slate-500 border-slate-300 font-bold bg-white"
                    >
                      {pastAttempts.length} Attempts
                    </Badge>
                  </div>

                  {pastAttempts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-slate-300" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800 mb-2">
                        No attempts yet
                      </h4>
                      <p className="text-slate-500 max-w-md mx-auto">
                        Take your first quiz above to establish your baseline
                        and earn your first trophy!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {pastAttempts.map((attempt) => {
                        const rank = getRankBadge(attempt.percentage);
                        return (
                          <Card
                            key={attempt._id}
                            className={`hover:-translate-y-1.5 transition-all duration-300 cursor-default bg-white border-2 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl ${rank.border}`}
                          >
                            <div className={`h-2 w-full ${rank.bg}`} />
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-6">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    {rank.icon}
                                    <span className="font-black text-3xl text-slate-900 tracking-tighter">
                                      {attempt.percentage}%
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full w-max ${rank.bg} ${rank.text}`}
                                  >
                                    {rank.label}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                                    Score
                                  </p>
                                  <p className="text-lg font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg">
                                    {attempt.score}
                                    <span className="text-slate-400 font-medium text-sm">
                                      /{attempt.totalQuestions}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-5">
                                <History className="w-3.5 h-3.5" />
                                {new Date(
                                  attempt.createdAt,
                                ).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(attempt.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </div>
                              <Button
                                variant="outline"
                                className={`w-full font-bold h-11 rounded-xl transition-all border-2 ${rank.border} ${rank.text} hover:bg-slate-50`}
                                onClick={() => setReviewingAttempt(attempt)}
                              >
                                Review Performance
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* --- STATE B: Active Quiz (Quizizz Style) --- */}
            {quiz && !result && currentQuestion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto space-y-6 pt-4"
              >
                {/* Gamified Header */}
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <Target className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Knowledge Check
                      </h2>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        Question {currentQuestionIndex + 1} of{" "}
                        {quiz.questions.length}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Progress dots */}
                    <div className="hidden sm:flex items-center gap-1 text-slate-300">
                      {quiz.questions.map((_, i) => (
                        <div
                          key={i}
                          className={`w-8 h-2.5 rounded-full transition-all duration-500 ${
                            i === currentQuestionIndex
                              ? "bg-indigo-500"
                              : answers[i] !== undefined
                                ? "bg-indigo-200"
                                : "bg-slate-100"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="w-px h-8 bg-slate-200 hidden sm:block mx-1" />
                    {/* Answered counter */}
                    <span className="text-xs font-bold text-slate-400 hidden sm:block">
                      {answeredCount}/{quiz.questions.length}
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to abandon the quiz? Progress will be lost.",
                          )
                        ) {
                          setQuiz(null);
                          setAnswers({});
                          setCurrentQuestionIndex(0);
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold"
                    >
                      <X className="w-4 h-4 sm:mr-2" />{" "}
                      <span className="hidden sm:inline">Exit</span>
                    </Button>
                  </div>
                </div>

                {/* Giant Centered Question */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 mb-6 min-h-[200px] flex items-center justify-center text-center">
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                        {currentQuestion.question}
                      </h3>
                    </div>

                    {/* 2x2 Vibrant Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {currentQuestion.options.map((opt, oIdx) => {
                        const isSelected =
                          answers[currentQuestionIndex] === opt;
                        const hasSelection =
                          answers[currentQuestionIndex] !== undefined;
                        const style =
                          OPTION_STYLES[oIdx % OPTION_STYLES.length];

                        let cardClass;
                        if (isSelected) {
                          cardClass = style.selected;
                        } else if (hasSelection) {
                          // Dim the unselected cards when something IS selected
                          cardClass = style.dimmed;
                        } else {
                          cardClass = style.base;
                        }

                        return (
                          <motion.div
                            key={oIdx}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() =>
                              setAnswers({
                                ...answers,
                                [currentQuestionIndex]: opt,
                              })
                            }
                            className={`cursor-pointer rounded-2xl p-6 sm:p-8 min-h-[140px] flex items-center justify-center text-center text-white transition-all duration-200 ${cardClass}`}
                            style={{
                              boxShadow: isSelected
                                ? "inset 0 -8px 0 rgba(0,0,0,0.15), 0 0 30px rgba(255,255,255,0.15)"
                                : "inset 0 -6px 0 rgba(0,0,0,0.15)",
                            }}
                          >
                            <span className="text-lg sm:text-xl font-bold tracking-tight px-4 leading-snug drop-shadow-md">
                              {opt}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Footer */}
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 mt-8 shadow-sm">
                  <Button
                    variant="outline"
                    disabled={currentQuestionIndex === 0}
                    onClick={() =>
                      setCurrentQuestionIndex((prev) => prev - 1)
                    }
                    className="font-bold border-slate-200 rounded-xl h-12 px-6"
                  >
                    Previous
                  </Button>

                  {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <Button
                      onClick={() => {
                        if (answers[currentQuestionIndex] === undefined) {
                          toast.error(
                            "Please select an answer to continue!",
                          );
                          return;
                        }
                        setCurrentQuestionIndex((prev) => prev + 1);
                      }}
                      className="font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 px-8 shadow-md"
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={savingResult}
                      className="font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 px-10 shadow-lg shadow-emerald-500/20 text-lg group"
                    >
                      {savingResult ? (
                        <Loader2 className="animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="mr-2 group-hover:scale-110 transition-transform" />
                      )}
                      {savingResult ? "Finalizing..." : "Submit All Answers"}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {/* --- STATE C: Post-Quiz Results --- */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="bg-white p-10 sm:p-16 rounded-[3rem] text-center shadow-2xl shadow-indigo-500/10 border border-slate-100 max-w-3xl mx-auto mt-10 relative overflow-hidden"
              >
                {/* Background decorative flair */}
                <div
                  className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${result.percentage >= 80 ? "bg-emerald-500" : result.percentage >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 bg-indigo-500" />

                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      delay: 0.2,
                    }}
                    className="mb-8 flex justify-center"
                  >
                    <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center p-4 border-4 border-white shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)]">
                      {result.percentage >= 80 ? (
                        <div className="relative">
                          <Trophy className="w-16 h-16 text-yellow-400 fill-yellow-100" />
                        </div>
                      ) : result.percentage >= 50 ? (
                        <Award className="w-16 h-16 text-slate-400 fill-slate-100" />
                      ) : (
                        <Target className="w-16 h-16 text-red-400 fill-red-50" />
                      )}
                    </div>
                  </motion.div>

                  <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Final Score
                  </h3>
                  <div className="flex items-end justify-center gap-2 mb-4">
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-6xl sm:text-8xl font-black text-slate-900 tracking-tighter"
                    >
                      {result.score}
                    </motion.h2>
                    <span className="text-3xl sm:text-5xl font-black text-slate-300 mb-2 sm:mb-4">
                      /{result.total}
                    </span>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="inline-flex items-center gap-2 bg-slate-100 px-6 py-3 rounded-2xl mb-12">
                      <Target
                        className={`w-5 h-5 ${result.percentage >= 80 ? "text-emerald-500" : "text-indigo-500"}`}
                      />
                      <span className="text-slate-600 font-bold text-lg">
                        Accuracy:{" "}
                      </span>
                      <span
                        className={`font-black text-xl ${result.percentage >= 80 ? "text-emerald-500" : "text-slate-800"}`}
                      >
                        {result.percentage}%
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        onClick={() => {
                          setQuiz(null);
                          setResult(null);
                          setAnswers({});
                          setCurrentQuestionIndex(0);
                        }}
                        variant="outline"
                        className="px-8 py-6 rounded-2xl text-lg font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        Return to Vault
                      </Button>
                      <Button
                        onClick={() => {
                          const newlyCreatedAttempt = pastAttempts[0];
                          if (newlyCreatedAttempt)
                            setReviewingAttempt(newlyCreatedAttempt);
                          setQuiz(null);
                          setResult(null);
                          setAnswers({});
                          setCurrentQuestionIndex(0);
                        }}
                        className="px-8 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-lg font-bold shadow-lg shadow-indigo-500/20"
                      >
                        <Search className="mr-2" /> Review Mistakes
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentInteractPage;
