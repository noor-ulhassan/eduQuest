import React from "react";
import { CheckCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import {
  Terminal as MagicTerminal,
  TypingAnimation,
  AnimatedSpan,
} from "@/components/ui/terminal";

export default function OutputPanel({ output, testResult, isRunning, currentProblem }) {
  return (
    <div>
      {isRunning && (
        <div className="flex items-center gap-3 py-3 px-1">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-red-500"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
              />
            ))}
          </div>
          <span className="text-zinc-500 text-[12px] font-mono tracking-wider">
            Executing…
          </span>
        </div>
      )}
      {output && !isRunning && (
        <div className="space-y-4 my-2">
          {output.text && (
            <MagicTerminal
              key={`out-${currentProblem?.id}-${output.text.length}`}
              startOnView={false}
              className="w-full max-w-full bg-[#111111] border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4),0_0_0_1px_rgba(44,240,157,0.08)]"
            >
              <AnimatedSpan className="text-zinc-400 mb-2 font-mono">Output:</AnimatedSpan>
              <TypingAnimation
                className="text-emerald-400 whitespace-pre-wrap font-mono mt-2 block"
                duration={10}
                startOnView={false}
              >
                {output.text}
              </TypingAnimation>
            </MagicTerminal>
          )}
          {output.error && (
            <MagicTerminal
              key={`err-${currentProblem?.id}-${output.error.length}`}
              startOnView={false}
              className="w-full max-w-full bg-red-950/10 border-red-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.4),0_0_0_1px_rgba(239,68,68,0.12)]"
            >
              <AnimatedSpan className="text-red-400/80 mb-2 font-mono">Error:</AnimatedSpan>
              <TypingAnimation
                className="text-red-400 whitespace-pre-wrap font-mono mt-2 block"
                duration={10}
                startOnView={false}
              >
                {output.error}
              </TypingAnimation>
            </MagicTerminal>
          )}
          {testResult && (
            testResult.success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="rounded-xl p-4 border flex items-center gap-3 text-sm font-bold"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(44,240,157,0.10), rgba(44,240,157,0.04))",
                  border: "1px solid rgba(44,240,157,0.28)",
                  color: "#2cf09d",
                  boxShadow: "0 0 20px rgba(44,240,157,0.12)",
                }}
              >
                <CheckCircle
                  className="w-4 h-4 shrink-0"
                  style={{ filter: "drop-shadow(0 0 5px rgba(44,240,157,0.6))" }}
                />
                {testResult.message}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl p-4 border flex items-center gap-3 text-sm font-medium"
                style={{
                  background: "rgba(239,68,68,0.05)",
                  border: "1px solid rgba(239,68,68,0.20)",
                  color: "#f87171",
                }}
              >
                <X className="w-4 h-4 shrink-0" />
                {testResult.message}
              </motion.div>
            )
          )}
        </div>
      )}
    </div>
  );
}
