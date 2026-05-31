import React from "react";
import { Loader2, Play, CheckCircle, X } from "lucide-react";
import { motion } from "framer-motion";

export default function TaskTestResults({ handleRunTask, isRunningTask, taskTestResults }) {
  return (
    <div className="space-y-3">
      <motion.button
        onClick={handleRunTask}
        disabled={isRunningTask}
        whileHover={{ scale: 1.03, y: -0.5 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
        style={{
          background: isRunningTask
            ? "rgba(239,68,68,0.30)"
            : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          color: "white",
          boxShadow: isRunningTask
            ? "none"
            : "0 2px 14px rgba(239,68,68,0.32), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        {isRunningTask
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Running Tests…</>
          : <><Play className="w-4 h-4 fill-white" /> Run Task Tests</>
        }
      </motion.button>

      {taskTestResults.length > 0 && (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 py-2 bg-[#111111] border-b border-white/10 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Test Results
          </div>
          <div className="divide-y divide-white/5">
            {taskTestResults.map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3 text-xs font-mono"
                style={{
                  background: r.passed ? "rgba(44,240,157,0.04)" : "rgba(239,68,68,0.04)",
                  borderLeft: r.passed
                    ? "2px solid rgba(44,240,157,0.25)"
                    : "2px solid rgba(239,68,68,0.25)",
                }}
              >
                {r.passed ? (
                  <CheckCircle className="w-3.5 h-3.5 text-[#2cf09d] shrink-0 mt-0.5" />
                ) : (
                  <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1 space-y-0.5">
                  {r.input && <p className="text-zinc-500">in: <span className="text-zinc-300">{r.input}</span></p>}
                  <p className={r.passed ? "text-emerald-400" : "text-red-400"}>got: {r.actualOutput}</p>
                  {!r.passed && <p className="text-zinc-500">expected: {r.expectedOutput}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
