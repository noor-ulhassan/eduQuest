import React from "react";
import {
  ArrowLeft,
  Zap,
  CheckCircle2,
  Menu,
  Terminal,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function PlaygroundNavbar({
  isMobile,
  isSidebarOpen,
  setIsSidebarOpen,
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
      className="h-[52px] shrink-0 flex items-center justify-between px-5 z-10 relative"
      style={{
        background:
          "linear-gradient(180deg, #0a0a0a 0%, #0a0a0a 70%, rgba(10,10,10,0.96) 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
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

        {/* Sidebar toggle */}
        {setIsSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 -ml-1 hover:bg-white/[0.06] rounded-lg transition-colors text-zinc-500 hover:text-white"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {getLanguageIconUrl?.(language) ? (
              <img
                src={getLanguageIconUrl(language)}
                alt={language}
                className="w-4 h-4 object-contain"
              />
            ) : (
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </div>
          <span className="text-[13px] font-bold text-white capitalize hidden sm:block tracking-tight">
            {language} <span className="text-zinc-600 font-medium">Playground</span>
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
              initial={{ scale: 1.18, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{
                background: "rgba(44,240,157,0.08)",
                border: "1px solid rgba(44,240,157,0.22)",
                color: "#2cf09d",
                boxShadow: "0 0 12px rgba(44,240,157,0.08)",
              }}
            >
              <Zap className="w-3 h-3 fill-current" />
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
            <CheckCircle2 className="w-3 h-3" />
            {sessionSolved}
          </motion.div>
        )}

        {/* Progress strip */}
        <div className="hidden md:flex flex-col gap-0.5 mx-1">
          <div
            className="w-24 h-1 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                background:
                  progressPercent === 100
                    ? "linear-gradient(90deg, #2cf09d, #16a34a)"
                    : "linear-gradient(90deg, #ef4444, #f97316)",
                boxShadow: "0 0 6px rgba(239,68,68,0.35)",
              }}
            />
          </div>
          <span className="text-[8px] font-bold text-zinc-600 tracking-[0.18em] uppercase">
            {progressPercent}% Path
          </span>
        </div>

        {/* Avatar */}
        <button
          onClick={() => navigate("/profile")}
          className="ml-1 w-7 h-7 rounded-full overflow-hidden shrink-0 transition-transform hover:scale-105"
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 0 0 2px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.04)",
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
