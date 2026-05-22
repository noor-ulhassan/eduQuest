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
          <div className="w-12 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Terminal className="w-6 h-6 text-zinc-500" />
          </div>
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
        background: "linear-gradient(180deg, #121212 0%, #0f0f0f 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      {/* Left edge accent */}
      <span
        aria-hidden
        className="absolute left-0 top-4 bottom-4 w-[2px] rounded-r-full"
        style={{
          background: "linear-gradient(180deg, #ef4444 0%, transparent 100%)",
          boxShadow: "0 0 12px rgba(239,68,68,0.45)",
        }}
      />
      {/* Card header */}
      <div
        className="px-5 py-3 flex items-center gap-2.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.20) 0%, rgba(239,68,68,0.08) 100%)",
            border: "1px solid rgba(239,68,68,0.30)",
          }}
        >
          <img src="/task.svg" className="w-4 h-4" alt="" />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400">
          Your Task
        </span>
        <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-zinc-700">
          {currentProblem?.difficulty || "CHALLENGE"}
        </span>
      </div>
      {/* Card body */}
      <div className="px-5 py-4">
        <FormattedTaskText
          text={currentProblem?.description}
          isMobile={false}
          className="text-zinc-200 text-[14px] leading-relaxed whitespace-pre-wrap"
        />
      </div>
    </motion.div>
  );
}
