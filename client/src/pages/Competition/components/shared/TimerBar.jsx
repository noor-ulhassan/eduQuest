import React from "react";
import { motion } from "framer-motion";

const TimerBar = ({ timeRemaining, gameDuration }) => {
  const danger = timeRemaining <= 30;
  const pct = gameDuration > 0 ? (timeRemaining / gameDuration) * 100 : 0;

  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-30 bg-zinc-900/80 backdrop-blur-sm overflow-hidden">
      <motion.div
        className="relative h-full overflow-hidden"
        animate={{ width: `${pct}%` }}
        transition={{ ease: "linear", duration: 1 }}
        style={{
          background: danger
            ? "linear-gradient(90deg, #dc2626, #f97316)"
            : "linear-gradient(90deg, #22c55e, #34d399)",
          boxShadow: danger
            ? "0 0 16px rgba(239,68,68,0.55)"
            : "0 0 14px rgba(34,197,94,0.45)",
        }}
      >
        {/* Top inset highlight for depth */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "rgba(255,255,255,0.4)" }}
        />
        {/* Moving shimmer sweep */}
        <motion.span
          aria-hidden
          className="absolute inset-y-0 w-16"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
          }}
          animate={{ x: ["-64px", "120vw"] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {danger && (
        <motion.div
          className="absolute inset-0 bg-red-500/20"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </div>
  );
};

export default TimerBar;
