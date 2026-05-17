import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Code,
  Eye,
  Timer,
  Trophy,
  BookOpen,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FloatingFeedback from "./FloatingFeedback";
import AnimatedLeaderboard from "./AnimatedLeaderboard";
import ProgrammingEditor from "./ProgrammingEditor";

const ClassicPlayView = ({
  feedbackResult,
  comboCount,
  feedbackKey,
  timeRemaining,
  gameDuration,
  questionIndex,
  currentQuestion,
  handleLeave,
  spectatorCount,
  isPowerQuestion,
  language,
  handleSubmitAnswer,
  isSubmitting,
  answerResult,
  leaderboard,
  gameEvents,
  userId,
  totalQuestions,
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
      <div className="fixed top-0 left-0 w-full h-1.5 z-30 bg-zinc-800">
        <motion.div
          className={`h-full ${timeRemaining <= 30 ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-green-500 to-emerald-400"}`}
          animate={{
            width: `${(timeRemaining / gameDuration) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {comboCount >= 2 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2 rounded-full shadow-2xl"
        >
          <span className="text-lg">🔥</span>
          <span className="text-white font-bold text-sm">
            {comboCount}x Combo!
          </span>
        </motion.div>
      )}

      <div className="max-w-[1400px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
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
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Code size={20} className="text-orange-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">
                Challenge {questionIndex + 1}
              </h2>
              <div className="text-xs text-zinc-500 font-mono">
                {currentQuestion?.title || "Loading Problem..."}
              </div>
            </div>
          </div>
          <motion.div
            animate={
              timeRemaining > 0 && timeRemaining <= 15
                ? { scale: [1, 1.07, 1] }
                : { scale: 1 }
            }
            transition={{
              duration: 0.35,
              repeat: timeRemaining > 0 && timeRemaining <= 15 ? Infinity : 0,
              repeatDelay: 0.65,
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 border transition-all ${
              timeRemaining <= 60
                ? "bg-red-500/10 border-red-500/40 animate-pulse"
                : "bg-zinc-900 border-zinc-800"
            }`}
          >
            <Timer
              size={16}
              className={
                timeRemaining <= 60 ? "text-red-400" : "text-zinc-400"
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

        {isPowerQuestion && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <Zap size={14} className="text-yellow-400" fill="currentColor" />
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-wide">
              Power Question — 2× Points!
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-140px)]">
          {/* Problem Description (Left Col) */}
          <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={14} /> Problem Statement
              </h3>
            </div>
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
              <h3 className="font-bold text-lg mb-4 text-metallic">
                {currentQuestion?.title}
              </h3>
              <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed space-y-4">
                {currentQuestion?.description}
              </div>
            </div>
          </Card>

          {/* Code Editor (Middle Cols) */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
            <ProgrammingEditor
              question={currentQuestion}
              language={language}
              onSubmit={handleSubmitAnswer}
              isSubmitting={isSubmitting}
              answerResult={answerResult}
            />
          </div>

          {/* Leaderboard (Right Col) */}
          <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Trophy size={14} className="text-yellow-400" /> Live
                Standings
              </h3>
            </div>
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
            <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
              <AnimatedLeaderboard
                leaderboard={leaderboard}
                userId={userId}
                totalQuestions={totalQuestions}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClassicPlayView;
