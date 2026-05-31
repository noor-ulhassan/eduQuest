import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, HeartCrack, Check, X } from "lucide-react";

const FloatingFeedback = ({ result, comboCount, triggerKey }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!result) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(t);
  }, [triggerKey]);

  if (!result) return null;

  // The lobby sets feedback as { isCorrect, pointsEarned } — support legacy
  // { correct, xpGained } shapes too so this never silently mis-renders.
  const isCorrect = result.isCorrect ?? result.correct ?? false;
  const xp = result.pointsEarned ?? result.xpGained ?? 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={`xp-${triggerKey}`}
            initial={{ opacity: 0, y: 30, scale: 0.5 }}
            animate={{ opacity: 1, y: -40, scale: 1 }}
            exit={{ opacity: 0, y: -120, scale: 0.8 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute top-1/3"
          >
            {isCorrect ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2.5">
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 360, damping: 16 }}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-[0_0_24px_rgba(34,197,94,0.6)]"
                  >
                    <Check size={22} strokeWidth={3.5} className="text-white" />
                  </motion.span>
                  {xp > 0 && (
                    <span className="text-4xl md:text-5xl font-black text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)] tabular-nums">
                      +{xp} XP
                    </span>
                  )}
                </div>
                {/* Small-streak pill (3-4). 5+ milestones are owned by
                    BigMomentBanner — keep them out of here to avoid two
                    banners screaming the same thing at the same time. */}
                {comboCount >= 3 && comboCount < 5 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-1.5 rounded-full shadow-xl"
                  >
                    <Flame size={18} className="text-yellow-200" fill="currentColor" />
                    <span className="text-white font-bold text-sm">
                      {comboCount}× ON FIRE!
                    </span>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: [-8, 8, -6, 6, 0] }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-2.5"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-rose-600 shadow-[0_0_24px_rgba(239,68,68,0.6)]">
                    <X size={22} strokeWidth={3.5} className="text-white" />
                  </span>
                  <span className="text-4xl md:text-5xl font-black text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]">
                    WRONG
                  </span>
                </motion.div>
                {result.streakBroken >= 3 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    className="flex items-center gap-1.5 bg-zinc-800/90 border border-red-500/30 px-3 py-1 rounded-full shadow-lg"
                  >
                    <HeartCrack size={14} className="text-red-400" fill="currentColor" />
                    <span className="text-xs font-bold text-red-400">
                      Streak Broken — was {result.streakBroken}×
                    </span>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && (
          <motion.div
            key={`flash-${triggerKey}`}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 ${isCorrect ? "bg-green-500/10" : "bg-red-500/15"}`}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingFeedback;
