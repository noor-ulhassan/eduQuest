import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Eye, Timer, Trophy, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FloatingFeedback from "./FloatingFeedback";
import AnimatedLeaderboard from "./AnimatedLeaderboard";
import InteractiveQuestion from "./InteractiveQuestion";
import LiveActivityFeed from "./LiveActivityFeed";
import BigMomentBanner from "./BigMomentBanner";
import TimerBar from "./shared/TimerBar";
import ComboIndicator from "./shared/ComboIndicator";
import GameEventsFeed from "./shared/GameEventsFeed";

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
  activityEvents = [],
}) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-5">
      <FloatingFeedback result={feedbackResult} comboCount={comboCount} triggerKey={feedbackKey} />
      <BigMomentBanner events={activityEvents} />
      <LiveActivityFeed events={activityEvents} position="top-right" />
      <TimerBar timeRemaining={timeRemaining} gameDuration={gameDuration} />
      <ComboIndicator comboCount={comboCount} />

      <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-5 mt-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Button
              variant="pixel"
              size="icon"
              onClick={() => {
                if (window.confirm("Are you sure you want to leave the ongoing competition?"))
                  handleLeave();
              }}
              className="text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full h-9 w-9"
            >
              <ArrowLeft size={18} />
            </Button>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <BookOpen size={16} className="text-orange-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base leading-tight">
                  Challenge {questionIndex + 1}
                </h2>
                {currentGameMode === "practice" && (
                  <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Practice
                  </span>
                )}
                {currentGameMode === "duel" && (
                  <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    ⚔️ Duel
                  </span>
                )}
                {currentGameMode === "team" && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: playerTeam?.[userId] === 0 ? "rgba(59,130,246,0.2)" : "rgba(239,68,68,0.2)",
                      color: playerTeam?.[userId] === 0 ? "#93c5fd" : "#fca5a5",
                    }}
                  >
                    {playerTeam?.[userId] === 0 ? "🔵 Team Blue" : "🔴 Team Red"}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">
                Question {questionIndex + 1} of {totalQuestions}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentGameMode === "blitz" && (
              <motion.div
                animate={
                  blitzQuestionTime <= 3
                    ? { scale: [1, 1.12, 1], opacity: [1, 0.7, 1] }
                    : blitzQuestionTime <= 5
                    ? { scale: [1, 1.08, 1] }
                    : blitzQuestionTime <= 10
                    ? { scale: [1, 1.03, 1] }
                    : { scale: 1 }
                }
                transition={{
                  duration: blitzQuestionTime <= 3 ? 0.2 : blitzQuestionTime <= 5 ? 0.3 : 0.6,
                  repeat: blitzQuestionTime <= 10 ? Infinity : 0,
                }}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 border font-mono font-black text-lg ${
                  blitzQuestionTime <= 3
                    ? "bg-red-600/30 border-red-500/80 text-red-300 shadow-[0_0_24px_rgba(239,68,68,0.55)]"
                    : blitzQuestionTime <= 5
                    ? "bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_18px_rgba(239,68,68,0.35)]"
                    : blitzQuestionTime <= 10
                    ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                    : "bg-zinc-900 border-zinc-700 text-white"
                }`}
              >
                <Zap
                  size={14}
                  className={
                    blitzQuestionTime <= 5 ? "text-red-400" : blitzQuestionTime <= 10 ? "text-yellow-400" : "text-zinc-400"
                  }
                />
                {blitzQuestionTime}s
              </motion.div>
            )}

            <motion.div
              animate={timeRemaining > 0 && timeRemaining <= 15 ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 0.35, repeat: timeRemaining > 0 && timeRemaining <= 15 ? Infinity : 0, repeatDelay: 0.65 }}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 border transition-all ${
                timeRemaining <= 60
                  ? "bg-red-500/10 border-red-500/40 shadow-[0_0_16px_rgba(239,68,68,0.3)]"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <Timer size={14} className={timeRemaining <= 60 ? "text-red-400" : "text-orange-400"} />
              <span className={`font-mono font-bold text-base ${timeRemaining <= 60 ? "text-red-400" : "text-white"}`}>
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
              </span>
            </motion.div>

            {spectatorCount > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-2.5 py-1">
                <Eye size={11} />
                {spectatorCount} watching
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
          {/* Question Panel */}
          <Card
            className={`lg:col-span-2 flex flex-col ${
              isPowerQuestion
                ? "bg-zinc-900 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)]"
                : "bg-zinc-900 border-zinc-800"
            }`}
          >
            {isPowerQuestion && (
              <div className="px-5 py-2 border-b border-yellow-500/20 bg-yellow-500/5 flex items-center gap-2">
                <Zap size={13} className="text-yellow-400" fill="currentColor" />
                <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">
                  Power Question — 2× Points!
                </span>
              </div>
            )}
            <div className="p-5 md:p-6 space-y-5 flex-1 flex flex-col">
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
                <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-zinc-500 gap-3">
                  <Loader2 className="animate-spin text-orange-500" size={28} />
                  <p className="text-sm">Loading validation data…</p>
                </div>
              )}
            </div>
            {currentGameMode === "practice" && answerResult && !userFinished && (
              <div className="px-5 pb-4 border-t border-zinc-800 pt-3.5">
                <Button
                  onClick={handlePracticeNext}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-2.5 rounded-xl"
                >
                  Next Question →
                </Button>
              </div>
            )}
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            {currentGameMode === "duel" ? (
              <Card className="bg-zinc-900 border-zinc-800 p-4 space-y-3 h-fit sticky top-5">
                <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <span>⚔️</span> Duel
                </h3>
                {(() => {
                  const me = leaderboard.find((p) => p.id === userId);
                  const opp = leaderboard.find((p) => p.id !== userId);
                  return (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl p-2.5">
                        <span className="text-xs font-bold text-orange-400 truncate">{me?.name || "You"}</span>
                        <span className="text-lg font-black text-orange-400">{me?.score ?? 0}</span>
                      </div>
                      <div className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest">vs</div>
                      <div className="flex items-center justify-between gap-2 bg-zinc-800/60 border border-zinc-700 rounded-xl p-2.5">
                        <span className="text-xs font-bold text-zinc-300 truncate">{opp?.name || "Opponent"}</span>
                        <span className="text-lg font-black text-zinc-300">{opp?.score ?? 0}</span>
                      </div>
                      {opp && (
                        <div className="text-[10px] text-zinc-500 text-center">
                          {opp.finished ? "Opponent finished ✓" : `Opponent on Q${(opp.currentQuestion || 0) + 1}`}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </Card>
            ) : (
              <Card className="bg-zinc-900 border-zinc-800 p-0 overflow-hidden h-fit sticky top-5 max-h-[calc(100vh-90px)] overflow-y-auto custom-scrollbar">
                <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                  <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Trophy size={13} className="text-yellow-400" /> Live Standings
                  </h3>
                </div>
                <GameEventsFeed gameEvents={gameEvents} />
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
