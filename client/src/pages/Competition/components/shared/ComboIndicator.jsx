import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

const ComboIndicator = ({ comboCount }) => {
  if (comboCount < 2) return null;
  return (
    <motion.div
      initial={{ scale: 0, y: -20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className="fixed top-3 left-1/2 -translate-x-1/2 z-30"
    >
      <div
        className="relative flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full"
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)",
          boxShadow:
            "0 4px 18px rgba(234,88,12,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        {/* Pulsing flame badge */}
        <motion.span
          className="flex items-center justify-center w-6 h-6 rounded-full bg-black/20"
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <Flame
            size={14}
            className="text-yellow-200"
            fill="currentColor"
            style={{ filter: "drop-shadow(0 0 4px rgba(254,240,138,0.8))" }}
          />
        </motion.span>
        <span className="text-white font-black text-xs tracking-wide tabular-nums">
          {comboCount}× COMBO
        </span>
      </div>
    </motion.div>
  );
};

export default ComboIndicator;
