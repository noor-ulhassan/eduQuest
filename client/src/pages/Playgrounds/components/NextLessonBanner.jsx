import React from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function NextLessonBanner({ onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="relative flex items-center justify-between gap-3 pt-4 pb-2 flex-wrap"
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(44,240,157,0.30), transparent)",
        }}
      />

      <span
        className="text-[12px] font-semibold flex items-center gap-2"
        style={{ color: "#2cf09d" }}
      >
        <motion.span
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
        >
          ✦
        </motion.span>
        Great work! Ready for the next challenge?
      </span>
      <motion.button
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 280, damping: 18 }}
        onClick={onNext}
        className="flex items-center gap-2 text-sm font-black px-4 py-2 rounded-xl transition-all uppercase tracking-wider"
        style={{
          background:
            "linear-gradient(135deg, rgba(44,240,157,0.16), rgba(44,240,157,0.06))",
          border: "1px solid rgba(44,240,157,0.40)",
          color: "#2cf09d",
          boxShadow:
            "0 4px 20px rgba(44,240,157,0.20), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        Next Lesson <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
