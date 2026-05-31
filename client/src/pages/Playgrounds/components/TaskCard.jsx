import React from "react";
import { Terminal } from "lucide-react";
import { motion } from "framer-motion";
import FormattedTaskText from "./FormattedTaskText";

export default function TaskCard({ currentProblem, isMobile }) {
  if (isMobile) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-[24px] p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className="inline-block bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
            Task
          </span>
          <Terminal className="w-8 h-8 text-zinc-400 drop-shadow-md" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-3">{currentProblem?.title}</h3>
          <FormattedTaskText
            text={currentProblem?.description}
            isMobile={true}
            className="text-zinc-300 text-[15px] leading-relaxed whitespace-pre-wrap font-medium"
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={currentProblem?.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl overflow-hidden mb-2 relative"
      style={{
        background: "linear-gradient(180deg, #131313 0%, #0e0e0e 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset",
      }}
    >
      {/* Left edge accent */}
      <span
        aria-hidden
        className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r-full"
        style={{
          background: "linear-gradient(180deg, #ef4444 0%, transparent 100%)",
          boxShadow: "0 0 12px rgba(239,68,68,0.45)",
          filter: "blur(1px)",
        }}
      />
      {/* Card header */}
      <div
        className="px-5 py-3 flex items-center gap-2.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <motion.img 
          src="/task.svg" 
          className="w-6 h-6 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" 
          alt="Task Icon" 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-red-400">
          Your Task
        </span>
        <span
          className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#71717a",
          }}
        >
          {currentProblem?.difficulty || "EASY"}
        </span>
      </div>
      {/* Card body */}
      <div className="px-6 py-4">
        <FormattedTaskText
          text={currentProblem?.description}
          isMobile={false}
          className="text-zinc-300 text-[14px] leading-relaxed whitespace-pre-wrap"
        />
      </div>
    </motion.div>
  );
}
