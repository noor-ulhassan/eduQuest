import React from "react";
import {
  Terminal,
  Loader2,
  Play,
  CheckCircle2,
  XCircle,
  Zap,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal as MagicTerminal,
  TypingAnimation,
  AnimatedSpan,
} from "@/components/ui/terminal";

export default function PreviewPanel({
  isLivePreview,
  iframeRef,
  isRunning,
  handleRunCode,
  output,
  testResult,
}) {
  return (
    <div
      className="flex-1 flex flex-col min-w-0 relative"
      style={{
        background: "#0a0a0a",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Panel header */}
      <div
        className="h-10 flex items-center justify-between px-4 shrink-0"
        style={{
          background: "#0a0a0a",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Terminal className="w-3 h-3 text-zinc-500" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            {isLivePreview ? "Live Preview" : "Output"}
          </span>
          {!isLivePreview && isRunning && (
            <span className="ml-1 flex items-center gap-1.5 text-[10px] text-zinc-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              Executing…
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLivePreview && (
            <motion.button
              onClick={handleRunCode}
              disabled={isRunning}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -0.5 }}
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all disabled:opacity-50"
              style={{
                background: "rgba(239,68,68,0.10)",
                color: "#f87171",
                border: "1px solid rgba(239,68,68,0.22)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {isRunning ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              Validate
            </motion.button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {isLivePreview ? (
          <div className="w-full h-full bg-white">
            <iframe
              ref={iframeRef}
              title="Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-modals allow-forms"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col overflow-y-auto p-4 gap-4 selection:bg-red-500/30 thin-scroll">
            {/* Magic-UI terminal: stdout */}
            {output && !isRunning && output.text && (
              <MagicTerminal className="w-full max-w-full bg-[#111111] border-white/10 shadow-xl">
                <AnimatedSpan className="text-zinc-400 mb-2 font-mono">
                  Output:
                </AnimatedSpan>
                <TypingAnimation
                  className="text-emerald-400 whitespace-pre-wrap font-mono mt-2 block"
                  duration={10}
                >
                  {output.text}
                </TypingAnimation>
              </MagicTerminal>
            )}

            {/* Magic-UI terminal: stderr */}
            {output && !isRunning && output.error && (
              <MagicTerminal className="w-full max-w-full bg-red-950/10 border-red-500/20 shadow-xl">
                <AnimatedSpan className="text-red-400/80 mb-2 font-mono">
                  Error:
                </AnimatedSpan>
                <TypingAnimation
                  className="text-red-400 whitespace-pre-wrap font-mono mt-2 block"
                  duration={10}
                >
                  {output.error}
                </TypingAnimation>
              </MagicTerminal>
            )}

            {/* Test result banner */}
            <AnimatePresence>
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 24,
                  }}
                  className="rounded-2xl overflow-hidden shrink-0 relative"
                  style={{
                    background: testResult.success
                      ? "linear-gradient(135deg, rgba(44,240,157,0.07), rgba(44,240,157,0.02))"
                      : "linear-gradient(135deg, rgba(239,68,68,0.07), rgba(239,68,68,0.02))",
                    border: testResult.success
                      ? "1px solid rgba(44,240,157,0.25)"
                      : "1px solid rgba(239,68,68,0.25)",
                    boxShadow: testResult.success
                      ? "0 0 24px rgba(44,240,157,0.08)"
                      : "0 0 20px rgba(239,68,68,0.08)",
                  }}
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    style={{
                      borderBottom: testResult.success
                        ? "1px solid rgba(44,240,157,0.12)"
                        : "1px solid rgba(239,68,68,0.12)",
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 18,
                        delay: 0.1,
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: testResult.success
                          ? "rgba(44,240,157,0.14)"
                          : "rgba(239,68,68,0.14)",
                      }}
                    >
                      {testResult.success ? (
                        <CheckCircle2
                          className="w-4 h-4"
                          style={{ color: "#2cf09d" }}
                        />
                      ) : (
                        <XCircle
                          className="w-4 h-4"
                          style={{ color: "#ef4444" }}
                        />
                      )}
                    </motion.div>
                    <span
                      className="text-[12px] font-black uppercase tracking-[0.14em]"
                      style={{
                        color: testResult.success ? "#2cf09d" : "#ef4444",
                      }}
                    >
                      {testResult.success ? "Tests Passed" : "Tests Failed"}
                    </span>
                    {testResult.success && (
                      <motion.div
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.28 }}
                        className="ml-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: "#2cf09d" }}
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        XP Awarded
                      </motion.div>
                    )}
                  </div>
                  <div className="px-4 py-3">
                    <p
                      className="text-[13px] leading-relaxed font-medium"
                      style={{
                        color: testResult.success ? "#a7f3d0" : "#fca5a5",
                      }}
                    >
                      {testResult.message}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            {!output && !testResult && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-3 pt-16"
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <Sparkles className="w-5 h-5 text-zinc-700" />
                </motion.div>
                <p className="text-[11px] text-zinc-700 text-center font-medium">
                  Run your code to see output here
                </p>
                <p className="text-[9px] text-zinc-800 font-mono uppercase tracking-widest">
                  Ctrl + Enter
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
