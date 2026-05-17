import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  Timer,
  Trophy,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FloatingFeedback from "./FloatingFeedback";
import AnimatedLeaderboard from "./AnimatedLeaderboard";
import InteractiveQuestion from "./InteractiveQuestion";

const GamePlayView = ({
  feedbackResult,
  comboCount,
  feedbackKey,
  timeRemaining,
  gameDuration,
  questionIndex,
  currentGameMode,
  playerTeam,
  userId,
  totalQuestions,
  blitzQuestionTime,
  spectatorCount,
  handleLeave,
  isPowerQuestion,
  currentQuestion,
  answerResult,
  isSubmitting,
  selectedAnswer,
  handleSubmitAnswer,
  handlePracticeNext,
  userFinished,
  leaderboard,
  gameEvents,
}) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {/* Floating Feedback */}
      <FloatingFeedback
        result={feedbackResult}
        comboCount={comboCount}
        triggerKey={feedbackKey}
      />

      {/* Animated Timer Bar */}
      <div className="fixed top-0 left-0 w-full h-2 z-30 bg-zinc-900/80 backdrop-blur-sm">
        <motion.div
          className={`h-full ${timeRemaining <= 30 ? "bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]"}`}
          animate={{
            width: `${(timeRemaining / gameDuration) * 100}%`,
          }}
          transition={{ ease: "linear", duration: 1 }}
        />
        {timeRemaining <= 30 && (
          <motion.div
            className="absolute inset-0 bg-red-500/20"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>

      {/* Combo Indicator */}
      {comboCount >= 2 && (
        <motion.div
          initial={{ scale: 0, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2 rounded-full shadow-2xl"
        >
          <span className="text-lg">🔥</span>
          <span className="text-white font-bold text-sm">
            {comboCount}x Combo!
          </span>
        </motion.div>
      )}

      <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-6 mt-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              variant="pixel"
              size="icon"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to leave the ongoing competition?",
                  )
                )
                  handleLeave();
              }}
              className="text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full h-10 w-10 mr-1"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <BookOpen size={20} className="text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg">
                  Challenge {questionIndex + 1}
                </h2>
                {currentGameMode === "practice" && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase">
                    Practice
                  </span>
                )}
                {currentGameMode === "duel" && (
                  <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase">
                    ⚔️ Duel
                  </span>
                )}
                {currentGameMode === "team" && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                    style={{
                      backgroundColor:
                        playerTeam?.[userId] === 0
                          ? "rgba(59,130,246,0.2)"
                          : "rgba(239,68,68,0.2)",
                      color:
                        playerTeam?.[userId] === 0 ? "#93c5fd" : "#fca5a5",
                    }}
                  >
                    {playerTeam?.[userId] === 0
                      ? "🔵 Team Blue"
                      : "🔴 Team Red"}
                  </span>
                )}
              </div>
              <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                Question {questionIndex + 1} of {totalQuestions}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentGameMode === "blitz" && (
              <motion.div
                animate={
                  blitzQuestionTime <= 3
                    ? { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }
                    : blitzQuestionTime <= 5
                      ? { scale: [1, 1.1, 1] }
                      : blitzQuestionTime <= 10
                        ? { scale: [1, 1.04, 1] }
                        : { scale: 1 }
                }
                transition={{
                  duration:
                    blitzQuestionTime <= 3
                      ? 0.2
                      : blitzQuestionTime <= 5
                        ? 0.3
                        : 0.6,
                  repeat: blitzQuestionTime <= 10 ? Infinity : 0,
                }}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 border font-mono font-black text-2xl ${
                  blitzQuestionTime <= 3
                    ? "bg-red-600/30 border-red-500/80 text-red-300 shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                    : blitzQuestionTime <= 5
                      ? "bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                      : blitzQuestionTime <= 10
                        ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                        : "bg-zinc-900 border-zinc-700 text-white"
                }`}
              >
                <Zap
                  size={16}
                  className={
                    blitzQuestionTime <= 5
                      ? "text-red-400"
                      : blitzQuestionTime <= 10
                        ? "text-yellow-400"
                        : "text-zinc-400"
                  }
                />
                {blitzQuestionTime}s
              </motion.div>
            )}
            <motion.div
              animate={
                timeRemaining > 0 && timeRemaining <= 15
                  ? { scale: [1, 1.07, 1] }
                  : { scale: 1 }
              }
              transition={{
                duration: 0.35,
                repeat:
                  timeRemaining > 0 && timeRemaining <= 15 ? Infinity : 0,
                repeatDelay: 0.65,
              }}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 border transition-all ${
                timeRemaining <= 60
                  ? "bg-red-500/10 border-red-500/40 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <Timer
                size={18}
                className={
                  timeRemaining <= 60 ? "text-red-400" : "text-orange-400"
                }
              />
              <span
                className={`font-mono font-bold text-lg ${
                  timeRemaining <= 60 ? "text-red-400" : "text-white"
                }`}
              >
                {Math.floor(timeRemaining / 60)}:
                {String(timeRemaining % 60).padStart(2, "0")}
              </span>
            </motion.div>
            {spectatorCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1.5">
                <Eye size={12} />
                {spectatorCount} watching
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Panel */}
          <Card
            className={`lg:col-span-2 flex flex-col ${isPowerQuestion ? "bg-zinc-900 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)]" : "bg-zinc-900 border-zinc-800"}`}
          >
            {isPowerQuestion && (
              <div className="px-6 py-2.5 border-b border-yellow-500/20 bg-yellow-500/5 flex items-center gap-2">
                <Zap
                  size={14}
                  className="text-yellow-400"
                  fill="currentColor"
                />
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wide">
                  Power Question — 2× Points!
                </span>
              </div>
            )}
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col">
              {currentQuestion ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={questionIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                    className="flex-1 flex flex-col"
                  >
                    <InteractiveQuestion
                      question={currentQuestion}
                      onSubmit={handleSubmitAnswer}
                      result={answerResult}
                      isSubmitting={isSubmitting}
                      selectedAnswer={selectedAnswer}
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-zinc-500 gap-4">
                  <Loader2
                    className="animate-spin text-orange-500"
                    size={32}
                  />
                  <p>Loading validation data...</p>
                </div>
              )}
            </div>
            {currentGameMode === "practice" &&
              answerResult &&
              !userFinished && (
                <div className="px-6 pb-5 border-t border-zinc-800 pt-4">
                  <Button
                    onClick={handlePracticeNext}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl"
                  >
                    Next Question →
                  </Button>
                </div>
              )}
          </Card>

          {/* Sidebar (Leaderboard / Duel) */}
          <div className="space-y-6">
            {currentGameMode === "duel" ? (
              <Card className="bg-zinc-900 border-zinc-800 p-4 space-y-4 h-fit sticky top-6">
                <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <span>⚔️</span> Duel
                </h3>
                {(() => {
                  const me = leaderboard.find((p) => p.id === userId);
                  const opp = leaderboard.find((p) => p.id !== userId);
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                        <span className="text-sm font-bold text-orange-400 truncate">
                          {me?.name || "You"}
                        </span>
                        <span className="text-xl font-black text-orange-400">
                          {me?.score ?? 0}
                        </span>
                      </div>
                      <div className="text-center text-xs text-zinc-600 font-bold uppercase tracking-widest">
                        vs
                      </div>
                      <div className="flex items-center justify-between gap-2 bg-zinc-800/60 border border-zinc-700 rounded-xl p-3">
                        <span className="text-sm font-bold text-zinc-300 truncate">
                          {opp?.name || "Opponent"}
                        </span>
                        <span className="text-xl font-black text-zinc-300">
                          {opp?.score ?? 0}
                        </span>
                      </div>
                      {opp && (
                        <div className="text-[10px] text-zinc-500 text-center">
                          {opp.finished
                            ? "Opponent finished ✓"
                            : `Opponent on Q${(opp.currentQuestion || 0) + 1}`}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </Card>
            ) : (
              <Card className="bg-zinc-900 border-zinc-800 p-0 overflow-hidden h-fit sticky top-6 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                  <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Trophy size={14} className="text-yellow-400" /> Live
                    Standings
                  </h3>
                </div>
                {/* G-01: Live event feed */}
                {gameEvents.length > 0 && (
                  <div className="px-2 pt-2 pb-1 border-b border-zinc-800 space-y-1">
                    <AnimatePresence>
                      {gameEvents.map((ev) => (
                        <motion.div
                          key={ev.time}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className={`text-[10px] px-2 py-1 rounded flex items-center gap-1.5 ${
                            ev.type === "eliminated"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-green-500/10 text-green-400"
                          }`}
                        >
                          {ev.type === "eliminated" ? "💀" : "🏁"} {ev.name}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
                <div className="p-2">
                  <AnimatedLeaderboard
                    leaderboard={leaderboard}
                    userId={userId}
                    totalQuestions={totalQuestions}
                  />
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlayView;
