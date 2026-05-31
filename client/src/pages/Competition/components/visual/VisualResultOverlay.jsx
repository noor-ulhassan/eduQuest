import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Check, X, Zap, Lightbulb, Trophy } from "lucide-react";

export default function VisualResultOverlay({
  result,
  sequenceLabel = "Correct sequence",
}) {
  if (!result) return null;
  const ok = result.isCorrect;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
      className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border backdrop-blur-sm ${
        ok
          ? "bg-emerald-500/8 border-emerald-500/30 shadow-[0_0_36px_rgba(16,185,129,0.15)]"
          : "bg-rose-500/8 border-rose-500/30 shadow-[0_0_36px_rgba(244,63,94,0.15)]"
      }`}
    >
      {/* Accent stripe */}
      <div
        className={`absolute top-0 inset-x-0 h-[2px] ${
          ok
            ? "bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
            : "bg-gradient-to-r from-transparent via-rose-400 to-transparent"
        }`}
      />

      {/* Soft flash */}
      <motion.div
        initial={{ opacity: 0.25 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
        className={`absolute inset-0 pointer-events-none ${
          ok ? "bg-emerald-400" : "bg-rose-400"
        }`}
      />

      <div className="flex items-start gap-3 sm:gap-4 relative z-10">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.05 }}
          className={`p-2 rounded-xl shrink-0 shadow-lg ${
            ok
              ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30"
              : "bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-rose-500/30"
          }`}
        >
          {ok ? (
            <Trophy size={18} strokeWidth={2.5} />
          ) : (
            <X size={18} strokeWidth={3} />
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <p
              className={`font-black text-lg sm:text-xl uppercase tracking-tight leading-none ${
                ok
                  ? "text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.45)]"
                  : "text-rose-300 drop-shadow-[0_0_10px_rgba(244,63,94,0.45)]"
              }`}
            >
              {ok ? "Solved!" : "Incorrect"}
            </p>
            {result.pointsEarned > 0 && (
              <motion.span
                initial={{ scale: 0, y: 6 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 320, delay: 0.18 }}
                className="flex items-center gap-1 text-xs sm:text-sm font-black text-yellow-300 bg-yellow-500/15 px-2.5 py-0.5 rounded-full border border-yellow-500/30"
              >
                <Zap size={12} className="fill-yellow-400" />+
                {result.pointsEarned} XP
              </motion.span>
            )}
          </div>

          {result.explanation && (
            <p
              className={`text-[13px] sm:text-sm mt-2 leading-relaxed font-medium ${
                ok ? "text-emerald-200/90" : "text-rose-200/90"
              }`}
            >
              {result.explanation}
            </p>
          )}

          {!ok && Array.isArray(result.correctAnswer) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="mt-3 bg-black/40 p-3 sm:p-4 rounded-xl border border-white/10"
            >
              <p className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-zinc-400 uppercase tracking-wider mb-2.5">
                <Lightbulb size={12} className="text-yellow-400" />
                {sequenceLabel}
              </p>
              <div className="space-y-1.5">
                {result.correctAnswer.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.28 + i * 0.05 }}
                    className="flex items-center gap-2.5 bg-emerald-500/5 border border-emerald-500/15 px-2.5 py-1.5 rounded-lg"
                  >
                    <span className="w-5 h-5 rounded-md bg-emerald-500/25 text-emerald-300 flex items-center justify-center text-[10px] font-black shrink-0 tabular-nums">
                      {i + 1}
                    </span>
                    <code className="text-[11px] sm:text-xs font-mono text-emerald-200 truncate flex-1">
                      {typeof step === "object"
                        ? JSON.stringify(step)
                        : String(step)}
                    </code>
                    <Check
                      size={12}
                      className="text-emerald-400 shrink-0"
                      strokeWidth={3}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
