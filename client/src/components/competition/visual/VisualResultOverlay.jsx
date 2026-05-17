import React from "react";
import { motion } from "framer-motion";
import { Check, X, Zap, Lightbulb } from "lucide-react";

export default function VisualResultOverlay({ result, sequenceLabel = "Correct sequence" }) {
  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`p-5 rounded-xl border ${
        result.isCorrect
          ? "bg-green-500/10 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]"
          : "bg-red-500/10 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-2 rounded-full shrink-0 mt-0.5 ${
            result.isCorrect
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {result.isCorrect ? (
            <Check size={18} strokeWidth={3} />
          ) : (
            <X size={18} strokeWidth={3} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <p
              className={`font-black text-xl italic uppercase tracking-tight ${
                result.isCorrect ? "text-green-400" : "text-red-400"
              }`}
            >
              {result.isCorrect ? "Correct!" : "Incorrect"}
            </p>
            {result.pointsEarned > 0 && (
              <span className="flex items-center gap-1 text-sm font-black text-yellow-400 bg-yellow-500/20 px-3 py-0.5 rounded-full border border-yellow-500/30 italic">
                <Zap size={13} className="fill-yellow-400" />+{result.pointsEarned} XP
              </span>
            )}
          </div>

          {result.explanation && (
            <p
              className={`text-sm mt-2 leading-relaxed ${
                result.isCorrect ? "text-green-300" : "text-red-300"
              }`}
            >
              {result.explanation}
            </p>
          )}

          {!result.isCorrect && Array.isArray(result.correctAnswer) && (
            <div className="mt-3 bg-black/40 p-4 rounded-xl border border-white/10">
              <p className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                <Lightbulb size={12} className="text-yellow-400" /> {sequenceLabel}
              </p>
              <div className="space-y-1.5">
                {result.correctAnswer.map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {i + 1}
                    </span>
                    <code className="text-xs font-mono text-emerald-300">
                      {String(step)}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
