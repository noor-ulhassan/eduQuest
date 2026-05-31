import React from "react";
import {
  ArrowLeft,
  Zap,
  CheckCircle,
  Menu,
  Terminal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function PlaygroundNavbar({
  isMobile,
  isSidebarCompact,
  setIsSidebarCompact,
  language,
  getLanguageIconUrl,
  user,
  sessionXP = 0,
  sessionSolved = 0,
  currentChapterIdx = 0,
  currentProblemIdx = 0,
  progressPercent = 0,
  onBackToHub,
}) {
  const navigate = useNavigate();

  if (isMobile) return null;

  const handleBack = () => {
    if (onBackToHub) onBackToHub();
    else navigate("/playground");
  };

  return (
    <header
      className="h-[64px] shrink-0 flex items-center justify-between px-6 z-10 relative backdrop-blur-xl"
      style={{
        background: "rgba(10, 10, 10, 0.65)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* hair-line accent under navbar */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.35) 35%, rgba(239,68,68,0.35) 65%, transparent 100%)",
          opacity: 0.4,
        }}
      />

      {/* pulsing amber hairline when session XP is active */}
      {sessionXP > 0 && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(44,240,157,0.5) 50%, transparent 100%)",
          }}
        />
      )}

      {/* ── LEFT ── */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={handleBack}
          className="group flex items-center gap-1.5 text-zinc-500 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:block">Playgrounds</span>
        </button>

        <div className="h-4 w-px bg-white/10" />



        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden transition-transform hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            {getLanguageIconUrl?.(language) ? (
              <img
                src={getLanguageIconUrl(language)}
                alt={language}
                className="w-5 h-5 object-contain"
              />
            ) : (
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </div>
          <span className="text-[14px] font-bold text-metallic capitalize hidden sm:block tracking-tight ml-1">
            {language} <span className="text-zinc-500 font-medium">Playground</span>
          </span>
        </div>

        <div className="h-4 w-px bg-white/10 hidden md:block" />

        {/* Lesson position */}
        <motion.span
          key={`${currentChapterIdx}.${currentProblemIdx}`}
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
          style={{
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.22)",
            color: "#f87171",
            boxShadow: "0 0 10px rgba(239,68,68,0.15)",
          }}
        >
          <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
          Lesson {currentChapterIdx + 1}.{currentProblemIdx + 1}
        </motion.span>
      </div>

      {/* ── RIGHT — session stats ── */}
      <div className="flex items-center gap-2">
        <AnimatePresence>
          {sessionXP > 0 && (
            <motion.div
              key={sessionXP}
              initial={{ scale: 1.22, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{
                background: "rgba(44,240,157,0.08)",
                border: "1px solid rgba(44,240,157,0.22)",
                color: "#2cf09d",
                boxShadow: "0 0 18px rgba(44,240,157,0.20)",
              }}
            >
              <Zap
                className="w-3 h-3 fill-current"
                style={{ filter: "drop-shadow(0 0 4px rgba(44,240,157,0.4))" }}
              />
              +{sessionXP}
              <span className="text-[9px] opacity-70 font-black">XP</span>
            </motion.div>
          )}
        </AnimatePresence>

        {sessionSolved > 0 && (
          <motion.div
            key={sessionSolved}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.20)",
              color: "#f87171",
            }}
          >
            <CheckCircle className="w-3 h-3" />
            {sessionSolved}
          </motion.div>
        )}

        {/* Progress strip */}
        <div className="hidden md:flex flex-col gap-0.5 mx-1">
          <div
            className="w-28 h-[3px] rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                background:
                  progressPercent === 100
                    ? "linear-gradient(90deg, #2cf09d, #16a34a)"
                    : "linear-gradient(90deg, #ef4444, #f97316)",
                boxShadow: "0 0 6px rgba(239,68,68,0.35)",
              }}
            >
              <motion.div
                className="absolute inset-y-0 right-0 w-4"
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.25))",
                }}
              />
            </motion.div>
          </div>
          <span className="text-[8px] font-bold text-zinc-600 tracking-[0.18em] uppercase">
            {progressPercent}% Path
          </span>
        </div>

        {/* Avatar */}
        <button
          onClick={() => navigate("/profile")}
          className="ml-1 w-7 h-7 rounded-full overflow-hidden shrink-0 transition-transform hover:scale-110"
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 0 0 2px rgba(239,68,68,0.30)",
          }}
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
              }}
            >
              <span className="text-white text-[10px] font-black">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
