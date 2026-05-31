import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, ArrowRight, Zap, X } from "lucide-react";

export default function SessionCompletionOverlay({
  language,
  totalXP,
  solved,
  onClose,
  onNavigate,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(circle at center, rgba(0,0,0,0.85), rgba(0,0,0,0.95))",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="w-full max-w-md text-center rounded-3xl p-8 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #111111 0%, #0d0d0d 60%, #0a0a0a 100%)",
          border: "1px solid rgba(44,240,157,0.28)",
          boxShadow:
            "0 0 64px rgba(44,240,157,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Decorative glow rings */}
        <span
          aria-hidden
          className="absolute -top-32 -left-32 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(44,240,157,0.18) 0%, transparent 60%)",
          }}
        />
        <span
          aria-hidden
          className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(239,68,68,0.10) 0%, transparent 60%)",
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="relative">
          {/* Trophy halo */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 18,
              delay: 0.2,
            }}
            className="w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center relative"
            style={{
              background:
                "radial-gradient(circle, rgba(44,240,157,0.16) 0%, rgba(44,240,157,0.05) 60%, transparent 100%)",
              border: "2px solid rgba(44,240,157,0.4)",
              boxShadow: "0 0 48px rgba(44,240,157,0.35)",
            }}
          >
            {/* Breathing outer ring */}
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full pointer-events-none"
              animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ border: "2px solid rgba(44,240,157,0.4)" }}
            />

            {/* Particle burst */}
            {[...Array(8)].map((_, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                style={{
                  background: i % 2 === 0 ? "#2cf09d" : "#ef4444",
                  top: "50%",
                  left: "50%",
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((i / 8) * Math.PI * 2) * 60,
                  y: Math.sin((i / 8) * Math.PI * 2) * 60,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.03, ease: "easeOut" }}
              />
            ))}

            <motion.div
              animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
              transition={{ duration: 1.1, delay: 0.5 }}
            >
              <Trophy
                className="w-12 h-12"
                style={{
                  color: "#2cf09d",
                  filter:
                    "drop-shadow(0 0 12px rgba(44,240,157,0.6))",
                }}
              />
            </motion.div>
          </motion.div>

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-[10px] font-black uppercase tracking-[0.3em] mb-2"
            style={{ color: "#2cf09d" }}
          >
            Course Complete
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-black text-metallic mb-3 capitalize tracking-tight"
          >
            {language || "Language"} Mastered
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-xs mx-auto"
          >
            You completed every lesson in this curriculum. Your mastery
            badge has been awarded.
          </motion.p>

          {/* Stat strip */}
          {(typeof totalXP === "number" || typeof solved === "number") && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-3 mb-7"
            >
              {typeof totalXP === "number" && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black"
                  style={{
                    background: "rgba(44,240,157,0.08)",
                    border: "1px solid rgba(44,240,157,0.22)",
                    color: "#2cf09d",
                  }}
                >
                  <Zap className="w-3 h-3 fill-current" />
                  +{totalXP} XP
                </div>
              )}
              {typeof solved === "number" && solved > 0 && (
                <div
                  className="text-[11px] font-black px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fafafa",
                  }}
                >
                  {solved} solved
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex gap-3"
          >
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-zinc-400 transition-colors hover:text-white"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Stay here
            </button>
            <motion.button
              onClick={onNavigate}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all"
              style={{
                background:
                  "linear-gradient(135deg, #2cf09d 0%, #16a34a 100%)",
                color: "#04140c",
                boxShadow: "0 6px 18px rgba(44,240,157,0.32)",
              }}
            >
              All Languages
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
