import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";

const FloatingFeedback = ({ result, comboCount, triggerKey }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!result) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(t);
  }, [triggerKey]);

  if (!result) return null;

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
            {result.correct ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl md:text-5xl font-black text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                  +{result.xpGained || 50} XP
                </span>
                {comboCount >= 3 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-1.5 rounded-full shadow-xl"
                  >
                    <Flame size={18} className="text-yellow-200" fill="currentColor" />
                    <span className="text-white font-bold text-sm">
                      {comboCount}x ON FIRE!
                    </span>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <motion.span
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [-5, 5, -3, 3, 0] }}
                  transition={{ duration: 0.4 }}
                  className="text-4xl md:text-5xl font-black text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                >
                  WRONG
                </motion.span>
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
            className={`absolute inset-0 ${result.correct ? "bg-green-500/10" : "bg-red-500/15"}`}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingFeedback;
