import React from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HintsPanel({ hints, showHints, setShowHints, isMobile }) {
  if (!hints || hints.length === 0) return null;

  if (isMobile) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-[24px] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <img src="/hint2.svg" alt="Hint" className="w-20 h-20 object-contain" />
            </div>
            <div>
              <h4 className="text-[17px] font-bold text-white mb-0.5">Need a hint?</h4>
              <p className="text-[13px] text-zinc-400">Reveal a tip to help you solve it</p>
            </div>
          </div>
          <button
            onClick={() => setShowHints(!showHints)}
            className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${
              showHints ? "bg-red-500" : "bg-red-500/20 border border-white/10"
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform shadow-md ${
                showHints ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <AnimatePresence>
          {showHints && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4 space-y-2"
            >
              {hints.map((hint, i) => (
                <p key={i} className="text-sm text-red-200/90 pl-3 border-l-2 border-purple-500 py-1">
                  {hint}
                </p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #121212 0%, #0f0f0f 100%)",
        border: "1px solid rgba(234,179,8,0.16)",
      }}
    >
      <button
        onClick={() => setShowHints(!showHints)}
        className="w-full flex items-center justify-between px-4 py-3 text-left group hover:bg-amber-500/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(234,179,8,0.16), rgba(234,179,8,0.04))",
              border: "1px solid rgba(234,179,8,0.25)",
            }}
          >
            <img src="/hint2.svg" alt="Hint" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <span className="text-[11px] font-black text-amber-400 uppercase tracking-[0.18em] block">
              {showHints ? "Hide Hints" : `${hints.length} Hint${hints.length > 1 ? "s" : ""} Available`}
            </span>
            {!showHints && (
              <p className="text-[10px] text-zinc-600 mt-0.5">Revealing hints may reduce XP earned</p>
            )}
          </div>
        </div>
        <motion.div animate={{ rotate: showHints ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-300 transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {showHints && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 pt-1 space-y-2"
              style={{ borderTop: "1px solid rgba(234,179,8,0.10)" }}
            >
              {hints.map((hint, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-2.5 pt-2"
                >
                  <span
                    className="text-[9px] font-black mt-0.5 px-1.5 py-0.5 rounded shrink-0 leading-none"
                    style={{
                      background: "rgba(234,179,8,0.14)",
                      color: "#fbbf24",
                      border: "1px solid rgba(234,179,8,0.2)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[13px] text-zinc-300 leading-relaxed">{hint}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
