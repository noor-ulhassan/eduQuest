import React from "react";
import { motion } from "framer-motion";

const TimerBar = ({ timeRemaining, gameDuration }) => (
  <div className="fixed top-0 left-0 w-full h-1.5 z-30 bg-zinc-900/80 backdrop-blur-sm">
    <motion.div
      className={`h-full ${
        timeRemaining <= 30
          ? "bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
          : "bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
      }`}
      animate={{ width: `${(timeRemaining / gameDuration) * 100}%` }}
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
);

export default TimerBar;
