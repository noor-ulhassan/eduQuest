import React from "react";
import { motion } from "framer-motion";

/**
 * VoiceSpeakerIndicator — Animated indicator shown when a user is speaking.
 *
 * Usage:
 *   - Wrap around or overlay on an avatar
 *   - In leaderboard: show next to player name
 *
 * @param {"sm"|"md"|"lg"} size - Size variant
 * @param {boolean} inline - If true, renders inline with text (e.g., in leaderboard)
 */
const VoiceSpeakerIndicator = ({ size = "md", inline = false }) => {
  if (inline) {
    // Small inline bars for leaderboard rows
    return (
      <div className="flex items-center gap-[2px] ml-1.5" title="Speaking">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-[3px] rounded-full bg-green-400"
            animate={{
              height: [4, 10, 4],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  // Overlay ring indicator (placed absolute on avatar)
  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <motion.div
      className={`absolute inset-0 ${sizeClasses[size]} rounded-full pointer-events-none`}
      animate={{
        boxShadow: [
          "0 0 0 0px rgba(34, 197, 94, 0)",
          "0 0 0 4px rgba(34, 197, 94, 0.4)",
          "0 0 0 0px rgba(34, 197, 94, 0)",
        ],
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

export default VoiceSpeakerIndicator;
