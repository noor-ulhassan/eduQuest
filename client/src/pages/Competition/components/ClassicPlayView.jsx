import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Code, Eye, Timer, Trophy, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FloatingFeedback from "./FloatingFeedback";
import AnimatedLeaderboard from "./AnimatedLeaderboard";
import ProgrammingEditor from "./ProgrammingEditor";
import LiveActivityFeed from "./LiveActivityFeed";
import BigMomentBanner from "./BigMomentBanner";
import TimerBar from "./shared/TimerBar";
import ComboIndicator from "./shared/ComboIndicator";
import GameEventsFeed from "./shared/GameEventsFeed";

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
  activityEvents = [],
}) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-5">
      <FloatingFeedback result={feedbackResult} comboCount={comboCount} triggerKey={feedbackKey} />
      <BigMomentBanner events={activityEvents} />
      <LiveActivityFeed events={activityEvents} position="top-right" />
      <TimerBar timeRemaining={timeRemaining} gameDuration={gameDuration} />
      <ComboIndicator comboCount={comboCount} />

      <div className="max-w-[1400px] mx-auto space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (window.confirm("Are you sure you want to leave the ongoing competition?"))
                  handleLeave();
              }}
              className="text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full h-9 w-9"
            >
              <ArrowLeft size={18} />
            </Button>
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Code size={16} className="text-orange-400" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-base leading-tight">
                Challenge {questionIndex + 1}
              </h2>
              <div className="text-[11px] text-zinc-500 font-mono truncate max-w-[260px]">
                {currentQuestion?.title || "Loading Problem..."}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.div
              animate={timeRemaining > 0 && timeRemaining <= 15 ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 0.35, repeat: timeRemaining > 0 && timeRemaining <= 15 ? Infinity : 0, repeatDelay: 0.65 }}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 border transition-all ${
                timeRemaining <= 60
                  ? "bg-red-500/10 border-red-500/40 shadow-[0_0_16px_rgba(239,68,68,0.3)]"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <Timer size={14} className={timeRemaining <= 60 ? "text-red-400" : "text-zinc-400"} />
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

        {isPowerQuestion && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-yellow-500/30"
            style={{
              background: "linear-gradient(90deg, rgba(234,179,8,0.16), rgba(249,115,22,0.05))",
              boxShadow: "0 0 18px rgba(234,179,8,0.12)",
            }}
          >
            <motion.span
              aria-hidden
              className="absolute inset-y-0 w-24 pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(253,224,71,0.35), transparent)" }}
              animate={{ x: ["-6rem", "130%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="relative flex items-center justify-center w-6 h-6 rounded-md bg-yellow-400/20 border border-yellow-400/40"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap
                size={13}
                className="text-yellow-300"
                fill="currentColor"
                style={{ filter: "drop-shadow(0 0 4px rgba(250,204,21,0.8))" }}
              />
            </motion.span>
            <span className="relative text-[11px] font-black text-yellow-300 uppercase tracking-[0.18em]">
              Power Question
            </span>
            <span className="relative ml-auto text-[10px] font-black text-yellow-950 bg-yellow-400 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_12px_rgba(250,204,21,0.5)]">
              2× Points
            </span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-130px)]">
          {/* Problem Statement */}
          <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col h-full">
            <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={13} /> Problem Statement
              </h3>
            </div>
            <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
              <h3 className="font-bold text-base mb-3 text-metallic">{currentQuestion?.title}</h3>
              <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed space-y-3">
                {currentQuestion?.description}
              </div>
            </div>
          </Card>

          {/* Code Editor */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
            <ProgrammingEditor
              question={currentQuestion}
              language={language}
              onSubmit={handleSubmitAnswer}
              isSubmitting={isSubmitting}
              answerResult={answerResult}
            />
          </div>

          {/* Leaderboard */}
          <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col h-full">
            <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Trophy size={13} className="text-yellow-400" /> Live Standings
              </h3>
            </div>
            <GameEventsFeed gameEvents={gameEvents} />
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
