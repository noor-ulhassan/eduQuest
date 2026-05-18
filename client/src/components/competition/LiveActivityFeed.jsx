import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const TONE_STYLES = {
  green: {
    bar: "bg-green-500",
    text: "text-green-300",
    glow: "shadow-[0_0_18px_rgba(34,197,94,0.18)]",
    border: "border-green-500/30",
    bg: "bg-green-500/10",
  },
  orange: {
    bar: "bg-orange-500",
    text: "text-orange-300",
    glow: "shadow-[0_0_18px_rgba(249,115,22,0.22)]",
    border: "border-orange-500/30",
    bg: "bg-orange-500/10",
  },
  yellow: {
    bar: "bg-yellow-400",
    text: "text-yellow-300",
    glow: "shadow-[0_0_18px_rgba(234,179,8,0.2)]",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
  },
  red: {
    bar: "bg-red-500",
    text: "text-red-300",
    glow: "shadow-[0_0_18px_rgba(239,68,68,0.18)]",
    border: "border-red-500/30",
    bg: "bg-red-500/10",
  },
  blue: {
    bar: "bg-blue-500",
    text: "text-blue-300",
    glow: "shadow-[0_0_18px_rgba(59,130,246,0.18)]",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
  },
  purple: {
    bar: "bg-purple-500",
    text: "text-purple-300",
    glow: "shadow-[0_0_18px_rgba(168,85,247,0.2)]",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
  },
  zinc: {
    bar: "bg-zinc-500",
    text: "text-zinc-300",
    glow: "",
    border: "border-zinc-700/60",
    bg: "bg-zinc-900/70",
  },
};

const LiveActivityFeed = ({ events = [], position = "top-right" }) => {
  const posClass =
    position === "top-right"
      ? "top-16 right-4 sm:right-6"
      : position === "top-left"
        ? "top-16 left-4 sm:left-6"
        : "bottom-6 right-4 sm:right-6";

  return (
    <div
      className={`fixed ${posClass} z-40 pointer-events-none flex flex-col gap-1.5 w-[260px] sm:w-[300px] max-w-[80vw]`}
    >
      <AnimatePresence initial={false}>
        {events.map((evt) => {
          const tone = TONE_STYLES[evt.tone] || TONE_STYLES.zinc;
          return (
            <motion.div
              key={evt.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 32,
                opacity: { duration: 0.15 },
              }}
              className={`relative overflow-hidden rounded-xl border ${tone.border} ${tone.bg} ${tone.glow} backdrop-blur-md`}
            >
              {/* Left accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${tone.bar}`} />

              {/* "Me" highlight */}
              {evt.isMe && (
                <div className="absolute right-1.5 top-1.5 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-orange-500/30 text-orange-200 border border-orange-500/40">
                  You
                </div>
              )}

              <div className="pl-3 pr-3 py-2 flex items-center gap-2">
                <span className="text-base leading-none shrink-0" aria-hidden>
                  {evt.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[12px] font-bold leading-snug ${tone.text} truncate`}
                  >
                    {evt.text}
                  </p>
                  {evt.xp ? (
                    <p className="text-[10px] font-mono font-bold text-yellow-300/90 mt-0.5">
                      +{evt.xp} XP
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default LiveActivityFeed;
