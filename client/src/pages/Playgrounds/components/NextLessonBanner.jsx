import React from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function NextLessonBanner({ onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="flex items-center justify-between gap-3 pt-3 flex-wrap"
    >
      <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2cf09d] animate-pulse" />
        Great work! Ready for the next challenge?
      </span>
      <motion.button
        whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="flex items-center gap-2 text-sm font-black px-4 py-2 rounded-xl transition-all uppercase tracking-wider"
        style={{ background: "linear-gradient(135deg, rgba(44,240,157,0.18), rgba(44,240,157,0.08))", border: "1px solid rgba(44,240,157,0.35)", color: "#2cf09d", boxShadow: "0 4px 18px rgba(44,240,157,0.18)" }}
      >
        Next Lesson <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
