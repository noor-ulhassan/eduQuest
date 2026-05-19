import React, { useEffect, useRef, useState } from "react";
// motion IS used via motion.div / motion.span in JSX — ESLint doesn't track namespace access
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Flame, Check, Skull, Zap } from "lucide-react";
import { playRankChangeSound } from "@/lib/sound";

// ─── Top-3 styling ───────────────────────────────────────────
const MEDAL = {
  0: {
    ring: "ring-2 ring-amber-400/80 shadow-[0_0_14px_rgba(245,158,11,0.45)]",
    badgeBg:
      "bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-black shadow-[0_2px_10px_rgba(245,158,11,0.4)]",
    rowAccent:
      "bg-gradient-to-r from-amber-500/[0.07] via-amber-500/[0.02] to-transparent",
    nameColor: "text-amber-200",
    scoreColor: "text-amber-300",
    icon: "🥇",
  },
  1: {
    ring: "ring-2 ring-zinc-300/70",
    badgeBg:
      "bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-400 text-black shadow-md",
    rowAccent: "bg-zinc-400/[0.04]",
    nameColor: "text-zinc-100",
    scoreColor: "text-zinc-200",
    icon: "🥈",
  },
  2: {
    ring: "ring-2 ring-orange-700/60",
    badgeBg:
      "bg-gradient-to-br from-orange-600 via-amber-700 to-orange-800 text-orange-100 shadow",
    rowAccent: "bg-orange-700/[0.04]",
    nameColor: "text-orange-200",
    scoreColor: "text-orange-300",
    icon: "🥉",
  },
};

// ─── Compact rank pill ───────────────────────────────────────
function RankPill({ rank }) {
  const medal = MEDAL[rank];
  if (medal) {
    return (
      <div
        className={`w-7 h-7 flex shrink-0 items-center justify-center rounded-lg text-[11px] font-black tabular-nums ${medal.badgeBg}`}
      >
        {rank + 1}
      </div>
    );
  }
  return (
    <div className="w-7 h-7 flex shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-black tabular-nums text-zinc-500">
      {rank + 1}
    </div>
  );
}

// ─── Animated score number (counts up) ───────────────────────
function ScoreNumber({ value, className }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    if (value === display) return;
    const from = fromRef.current;
    const to = value;
    const start = performance.now();
    const dur = Math.min(900, 220 + Math.abs(to - from) * 4);

    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const cur = Math.round(from + (to - from) * eased);
      setDisplay(cur);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className={`tabular-nums font-mono ${className || ""}`}>
      {display}
    </span>
  );
}

// ─── A single row ────────────────────────────────────────────
function LeaderboardRow({
  player: p,
  rank,
  isMe,
  delta,
  scoreDelta,
  totalQuestions,
}) {
  const medal = MEDAL[rank];
  const progress =
    totalQuestions > 0
      ? Math.min(1, (p.currentQuestion || 0) / totalQuestions)
      : 0;
  const onLastQuestion =
    totalQuestions > 0 &&
    !p.finished &&
    !p.eliminated &&
    p.currentQuestion === totalQuestions - 1;
  const showCombo = !p.eliminated && !p.finished && (p.comboCount || 0) >= 3;

  return (
    <motion.div
      layout
      layoutId={`lb-${p.id}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: p.eliminated ? 0.55 : 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{
        layout: { type: "spring", stiffness: 380, damping: 32 },
        duration: 0.18,
      }}
      className={`relative overflow-hidden rounded-xl border transition-colors ${
        p.eliminated
          ? "bg-red-500/[0.04] border-red-500/15"
          : isMe
            ? "bg-orange-500/[0.08] border-orange-500/25 shadow-[0_0_14px_rgba(249,115,22,0.1)]"
            : "bg-zinc-900/60 border-zinc-800/70 hover:border-zinc-700"
      }`}
    >
      {/* Medal-tier soft wash */}
      {medal && !p.eliminated && (
        <div
          className={`absolute inset-0 pointer-events-none ${medal.rowAccent}`}
        />
      )}

      {/* YOU left accent stripe */}
      {isMe && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-orange-400 via-orange-500 to-red-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
      )}

      {/* Score-gain flash */}
      <AnimatePresence>
        {scoreDelta > 0 && (
          <motion.div
            key={`flash-${p.id}-${scoreDelta}`}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 bg-emerald-400/15 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-center gap-2 px-2 py-2">
        {/* Rank pill + rank delta indicators */}
        <div className="relative shrink-0">
          <RankPill rank={rank} />
          <AnimatePresence>
            {delta > 0 && (
              <motion.span
                key={`up-${p.id}-${delta}`}
                initial={{ opacity: 1, y: 0, scale: 0.9 }}
                animate={{ opacity: 0, y: -16, scale: 1.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.3, ease: "easeOut" }}
                className="absolute -top-3 -right-1 text-[9px] font-black text-emerald-400 pointer-events-none select-none drop-shadow-[0_0_4px_rgba(16,185,129,0.6)]"
              >
                ↑{delta}
              </motion.span>
            )}
            {delta < 0 && (
              <motion.span
                key={`dn-${p.id}-${delta}`}
                initial={{ opacity: 1, y: 0, scale: 0.9 }}
                animate={{ opacity: 0, y: 16, scale: 1.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.3, ease: "easeOut" }}
                className="absolute -bottom-3 -right-1 text-[9px] font-black text-rose-400 pointer-events-none select-none drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]"
              >
                ↓{Math.abs(delta)}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar with crown for #1 */}
        <div className="relative shrink-0">
          <div
            className={`w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-zinc-800 ${
              medal ? medal.ring : isMe ? "ring-2 ring-orange-500/60" : ""
            }`}
          >
            {p.avatarUrl ? (
              <img
                src={p.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[11px] font-black text-zinc-400">
                {(p.name || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          {rank === 0 && !p.eliminated && (
            <motion.div
              initial={{ y: 2, opacity: 0 }}
              animate={{ y: -8, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <Crown
                size={11}
                className="text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.7)]"
              />
            </motion.div>
          )}
          {p.eliminated && (
            <div className="absolute inset-0 rounded-lg bg-red-950/70 backdrop-blur-[1px] flex items-center justify-center">
              <Skull size={12} className="text-red-400" />
            </div>
          )}
          {p.finished && !p.eliminated && (
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-zinc-950 flex items-center justify-center">
              <Check size={8} strokeWidth={4} className="text-white" />
            </div>
          )}
          {p.level > 1 && !p.eliminated && (
            <div className="absolute -bottom-1 -left-1 px-1 rounded bg-zinc-950 border border-zinc-700 text-[8px] font-black text-zinc-300 leading-[12px]">
              {p.level}
            </div>
          )}
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span
              className={`text-[12.5px] font-bold truncate ${
                isMe
                  ? "text-orange-300"
                  : medal
                    ? medal.nameColor
                    : "text-zinc-200"
              }`}
            >
              {p.name}
            </span>
            {isMe && (
              <span className="text-[8px] bg-orange-500/25 text-orange-300 px-1 rounded shrink-0 font-black uppercase tracking-wider">
                You
              </span>
            )}
            {showCombo && (
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-0.5 text-[9px] font-black text-orange-300 bg-orange-500/15 border border-orange-500/30 rounded-full px-1 py-[1px] shrink-0"
                title={`${p.comboCount}× streak`}
              >
                <Flame
                  size={8}
                  className="text-orange-400 fill-orange-400"
                />
                {p.comboCount}
              </motion.span>
            )}
            {onLastQuestion && (
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-0.5 text-[9px] font-black text-yellow-300 bg-yellow-500/15 border border-yellow-500/30 rounded-full px-1 py-[1px] shrink-0"
                title="On the final question"
              >
                <Zap size={8} className="fill-yellow-400" />
                Final
              </motion.span>
            )}
          </div>

          <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5 leading-none">
            <span className="font-medium">
              {p.eliminated
                ? "Eliminated"
                : p.finished
                  ? "Finished"
                  : `Q${(p.currentQuestion || 0) + 1}${totalQuestions ? ` of ${totalQuestions}` : ""}`}
            </span>
            {!p.eliminated && !p.finished && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-zinc-700" />
                <span className="font-medium text-zinc-600">
                  {p.correctAnswers || 0} correct
                </span>
              </>
            )}
          </div>
        </div>

        {/* Score column */}
        <div className="text-right shrink-0 pl-1 relative">
          <ScoreNumber
            value={p.score || 0}
            className={`text-[15px] font-black leading-none ${
              p.eliminated
                ? "text-red-400/70"
                : isMe
                  ? "text-orange-300 drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]"
                  : medal
                    ? medal.scoreColor
                    : "text-zinc-200"
            }`}
          />
          <div className="text-[8px] text-zinc-600 font-black uppercase tracking-wider mt-0.5">
            XP
          </div>
          {/* Pop "+N" chip when score increases */}
          <AnimatePresence>
            {scoreDelta > 0 && (
              <motion.span
                key={`gain-${p.id}-${scoreDelta}`}
                initial={{ opacity: 0, y: 4, scale: 0.7 }}
                animate={{ opacity: 1, y: -22, scale: 1 }}
                exit={{ opacity: 0, y: -32 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute right-0 top-0 text-[10px] font-black text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.7)] pointer-events-none select-none"
              >
                +{scoreDelta}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress bar (full-width along bottom) */}
      {totalQuestions > 0 && (
        <div className="relative h-[3px] bg-zinc-950/60 overflow-hidden">
          <motion.div
            className={`h-full ${
              p.eliminated
                ? "bg-red-600"
                : p.finished
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : isMe
                    ? "bg-gradient-to-r from-orange-500 to-amber-400"
                    : rank === 0
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                      : "bg-zinc-600"
            }`}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          {/* Active-player shimmer on progress bar */}
          {!p.finished && !p.eliminated && progress > 0 && progress < 1 && (
            <motion.div
              className="absolute top-0 left-0 h-full w-1/3"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
              }}
              animate={{ x: ["-100%", "300%"] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </div>
      )}
    </motion.div>
  );
}

/**
 * AnimatedLeaderboard
 *
 * Props:
 *  - leaderboard: { id, name, avatarUrl, score, currentQuestion, correctAnswers,
 *                   comboCount, finished, eliminated, level }[]
 *  - userId: current user's _id
 *  - totalQuestions: number
 */
const AnimatedLeaderboard = ({
  leaderboard = [],
  userId,
  totalQuestions = 0,
}) => {
  const [rankDeltas, setRankDeltas] = useState({});
  const [scoreDeltas, setScoreDeltas] = useState({});
  const prevRanksRef = useRef({});
  const prevScoresRef = useRef({});

  // Watch for rank + score changes
  useEffect(() => {
    const newRankDeltas = {};
    const newScoreDeltas = {};
    const newRanks = {};
    const newScores = {};

    leaderboard.forEach((p, i) => {
      newRanks[p.id] = i;
      newScores[p.id] = p.score || 0;
      const prevRank = prevRanksRef.current[p.id];
      const prevScore = prevScoresRef.current[p.id];
      if (prevRank !== undefined && prevRank !== i) {
        newRankDeltas[p.id] = prevRank - i;
      }
      if (prevScore !== undefined && (p.score || 0) > prevScore) {
        newScoreDeltas[p.id] = (p.score || 0) - prevScore;
      }
    });

    let cleanups = [];

    if (Object.keys(newRankDeltas).length > 0) {
      setRankDeltas(newRankDeltas);
      const myDelta = newRankDeltas[userId];
      if (myDelta !== undefined && myDelta !== 0) {
        playRankChangeSound();
      }
      const t = setTimeout(() => setRankDeltas({}), 1600);
      cleanups.push(() => clearTimeout(t));
    }
    if (Object.keys(newScoreDeltas).length > 0) {
      setScoreDeltas(newScoreDeltas);
      const t = setTimeout(() => setScoreDeltas({}), 1400);
      cleanups.push(() => clearTimeout(t));
    }

    prevRanksRef.current = newRanks;
    prevScoresRef.current = newScores;

    return cleanups.length ? () => cleanups.forEach((fn) => fn()) : undefined;
  }, [leaderboard, userId]);

  // Empty state
  if (leaderboard.length === 0) {
    return (
      <div className="px-3 py-6 flex flex-col items-center gap-2.5 text-center">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-zinc-700"
              animate={{
                opacity: [0.25, 1, 0.25],
                y: [0, -3, 0],
                backgroundColor: ["#3f3f46", "#f97316", "#3f3f46"],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.18,
              }}
            />
          ))}
        </div>
        <p className="text-[11px] text-zinc-500 font-medium">
          Players warming up…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <AnimatePresence initial={false}>
        {leaderboard.map((p, i) => (
          <LeaderboardRow
            key={p.id}
            player={p}
            rank={i}
            isMe={p.id === userId}
            delta={rankDeltas[p.id]}
            scoreDelta={scoreDeltas[p.id] || 0}
            totalQuestions={totalQuestions}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedLeaderboard;
