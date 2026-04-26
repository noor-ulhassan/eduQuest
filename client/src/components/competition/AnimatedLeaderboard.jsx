import React, { useState, useEffect, useRef } from "react";
// motion IS used via motion.div / motion.span in JSX — ESLint doesn't track namespace access
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import VoiceSpeakerIndicator from "./VoiceSpeakerIndicator";
import { playRankChangeSound } from "@/lib/sound";

const RankBadge = ({ rank }) => (
  <div
    className={`w-6 h-6 flex shrink-0 items-center justify-center rounded-md text-xs font-bold ${
      rank === 0
        ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
        : rank === 1
          ? "bg-zinc-300 text-black"
          : rank === 2
            ? "bg-orange-700 text-white"
            : "bg-zinc-800 text-zinc-500"
    }`}
  >
    {rank + 1}
  </div>
);

/**
 * AnimatedLeaderboard
 *
 * Props:
 *  - leaderboard: { id, name, score, currentQuestion, finished, avatarUrl }[]
 *  - userId: current user's _id
 *  - totalQuestions: number
 *  - activeSpeakers: Set<string>
 */
const AnimatedLeaderboard = ({
  leaderboard = [],
  userId,
  totalQuestions = 0,
  activeSpeakers,
}) => {
  const [rankDeltas, setRankDeltas] = useState({});
  const prevRanksRef = useRef({});

  useEffect(() => {
    const newDeltas = {};
    const newRanks = {};

    leaderboard.forEach((p, i) => {
      newRanks[p.id] = i;
      const prev = prevRanksRef.current[p.id];
      if (prev !== undefined && prev !== i) {
        newDeltas[p.id] = prev - i; // positive = moved up in rank
      }
    });

    if (Object.keys(newDeltas).length > 0) {
      setRankDeltas(newDeltas);
      playRankChangeSound();
      const t = setTimeout(() => setRankDeltas({}), 1600);
      return () => clearTimeout(t);
    }

    prevRanksRef.current = newRanks;
  }, [leaderboard]);

  // Sync prevRanks even when there are no deltas
  useEffect(() => {
    const newRanks = {};
    leaderboard.forEach((p, i) => { newRanks[p.id] = i; });
    prevRanksRef.current = newRanks;
  }, [leaderboard]);

  if (leaderboard.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-zinc-500">
        Waiting for players to start...
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <AnimatePresence initial={false}>
        {leaderboard.map((p, i) => {
          const isMe = p.id === userId;
          const delta = rankDeltas[p.id];
          const progress =
            totalQuestions > 0
              ? Math.min(1, (p.currentQuestion || 0) / totalQuestions)
              : 0;

          return (
            <motion.div
              key={p.id}
              layout
              layoutId={`lb-${p.id}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: p.eliminated ? 0.45 : 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{
                layout: { type: "spring", stiffness: 420, damping: 36 },
                duration: 0.18,
              }}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                p.eliminated
                  ? "bg-red-500/5 border border-red-500/10"
                  : isMe
                  ? "bg-orange-500/10 border border-orange-500/20"
                  : "hover:bg-zinc-800/50"
              }`}
            >
              {/* Rank badge + delta indicator */}
              <div className="relative shrink-0">
                <RankBadge rank={i} />

                <AnimatePresence>
                  {delta > 0 && (
                    <motion.span
                      key={`up-${p.id}-${delta}`}
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ opacity: 0, y: -16 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.4, ease: "easeOut" }}
                      className="absolute -top-4 right-0 text-[9px] font-black text-green-400 pointer-events-none select-none"
                    >
                      ↑{delta}
                    </motion.span>
                  )}
                  {delta < 0 && (
                    <motion.span
                      key={`dn-${p.id}-${delta}`}
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ opacity: 0, y: 16 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.4, ease: "easeOut" }}
                      className="absolute -bottom-4 right-0 text-[9px] font-black text-red-400 pointer-events-none select-none"
                    >
                      ↓{Math.abs(delta)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Name + stats + progress bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span
                    className={`text-sm font-medium truncate flex items-center gap-1 ${
                      isMe ? "text-orange-400" : "text-zinc-300"
                    }`}
                  >
                    {p.name}
                    {activeSpeakers?.has(p.id) && (
                      <VoiceSpeakerIndicator inline />
                    )}
                  </span>
                  {isMe && (
                    <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1 rounded shrink-0 font-bold">
                      YOU
                    </span>
                  )}
                </div>

                <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                  <span className="font-medium">{p.score} XP</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-zinc-700" />
                  <span>
                    {p.eliminated
                      ? "💀 Out"
                      : p.finished
                      ? "Done ✓"
                      : `Q${(p.currentQuestion || 0) + 1}`}
                  </span>
                </div>

                {/* Progress bar */}
                {totalQuestions > 0 && (
                  <div className="mt-1.5 h-[3px] bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        p.eliminated
                          ? "bg-red-600"
                          : p.finished
                          ? "bg-green-500"
                          : isMe
                            ? "bg-orange-500"
                            : "bg-zinc-500"
                      }`}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                )}
              </div>

              {/* Thinking indicator — visible for non-finished players */}
              {!p.finished && (
                <div className="flex items-center gap-[3px] shrink-0">
                  {[0, 1, 2].map((d) => (
                    <motion.div
                      key={d}
                      className="w-[3px] h-[3px] rounded-full bg-zinc-600"
                      animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
                      transition={{
                        duration: 1.1,
                        repeat: Infinity,
                        delay: d * 0.18,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedLeaderboard;
