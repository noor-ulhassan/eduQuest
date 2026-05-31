import React from "react";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LessonBadge({ chapterIdx, problemIdx, xp, isSolved }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 transition-all duration-300"
          style={{
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#f87171",
          }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Lesson {chapterIdx + 1}.{problemIdx + 1}
        </span>
        {isSolved && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1"
            style={{
              background: "rgba(44,240,157,0.10)",
              border: "1px solid rgba(44,240,157,0.25)",
              color: "#2cf09d",
            }}
          >
            <CheckCircle className="w-3 h-3" /> Solved
          </motion.span>
        )}
      </div>
      <motion.div
        key={`${chapterIdx}-${problemIdx}`}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-1.5 text-[16px] font-black"
        style={{ color: "#2cf09d" }}
      >
        <img
          src="/xp.svg"
          className="w-6 h-6"
          alt=""
          style={{ filter: "drop-shadow(0 0 10px rgba(44,240,157,0.55))" }}
        />
        +{xp} <span className="text-[10px] opacity-70 tracking-widest">XP REWARD</span>
      </motion.div>
    </div>
  );
}
