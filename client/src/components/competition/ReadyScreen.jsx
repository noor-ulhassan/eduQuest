import React from "react";
import { motion } from "framer-motion";
import { Loader2, Play, X, CheckCircle2 } from "lucide-react";

const ReadyScreen = ({ isHost, readyQuestionCount, isStarting, onLaunch, onCancel }) => (
  <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
    {/* Ambient */}
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-emerald-800/5 rounded-full blur-[100px]" />
    </div>

    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative z-10 w-full max-w-md"
    >
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ background: "#0c0c0c", border: "1px solid #1a1a1a" }}
      >
        {/* Top accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

        <div className="p-8 text-center space-y-6">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.15, 1] }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative w-20 h-20 mx-auto"
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                boxShadow: "0 0 40px rgba(34,197,94,0.12)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-green-400" />
            </div>
          </motion.div>

          {/* Text */}
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              Questions Ready!
            </h2>
            <p className="text-zinc-500 text-sm">
              <span className="text-green-400 font-semibold">{readyQuestionCount}</span> challenges generated successfully.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-zinc-900" />

          {isHost ? (
            <div className="space-y-3">
              <p className="text-[11px] text-zinc-600 uppercase tracking-[0.15em] font-bold">
                Launch when ready
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onCancel}
                  className="py-3 px-4 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #242424", color: "#71717a" }}
                >
                  <X size={15} />
                  Cancel
                </button>
                <button
                  onClick={onLaunch}
                  disabled={isStarting}
                  className="py-3 px-4 rounded-xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #16a34a, #15803d)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    boxShadow: "0 0 24px rgba(34,197,94,0.15), 0 1px 0 rgba(255,255,255,0.06) inset",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.06),transparent)" }}
                  />
                  {isStarting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Play size={16} fill="currentColor" />
                  )}
                  {isStarting ? "Launching..." : "Launch Now"}
                </button>
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl p-4 flex items-center justify-center gap-3"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #1e1e1e" }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-500"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="text-sm text-zinc-500">Waiting for host to launch...</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  </div>
);

export default ReadyScreen;
