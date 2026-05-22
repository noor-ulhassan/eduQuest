import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Play,
  BookOpen,
  FileCode2,
  X,
  ChevronRight,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PlaygroundSidebar({
  isMobile,
  isSidebarOpen,
  setIsSidebarOpen,
  isSidebarCompact,
  setIsSidebarCompact,
  language,
  getLanguageIconUrl,
  data,
  progressPercent,
  completedCount,
  totalProblems,
  currentProblem,
  completedProblems,
  expandedChapterId,
  setExpandedChapterId,
  selectProblem,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {(!isMobile || isSidebarOpen) && (
          <motion.aside
            initial={isMobile ? { x: -280, opacity: 0 } : false}
            animate={
              isMobile
                ? { x: 0, opacity: 1 }
                : isSidebarCompact
                  ? { width: 64, opacity: 1 }
                  : { width: 250, opacity: 1 }
            }
            exit={isMobile ? { x: -280, opacity: 0 } : undefined}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onMouseEnter={() => !isMobile && setIsSidebarCompact(false)}
            onMouseLeave={() => !isMobile && setIsSidebarCompact(true)}
            className={cn(
              "h-full flex flex-col overflow-hidden shrink-0 bg-[#111111] border-r border-white/10",
              isMobile ? "fixed inset-y-0 left-0 z-50 w-[280px] shadow-2xl" : "hidden md:flex",
            )}
          >
            {/* ── Compact icon-only view ── */}
            {!isMobile && isSidebarCompact ? (
              <div className="flex flex-col items-center h-full pt-3 pb-4 gap-1.5 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mb-1">
                  {getLanguageIconUrl(language) ? (
                    <img
                      src={getLanguageIconUrl(language)}
                      alt={language}
                      className="w-5 h-5 object-contain drop-shadow-md"
                    />
                  ) : (
                    <FileCode2 className="w-4 h-4 text-red-400" />
                  )}
                </div>

                <div className="w-8 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2cf09d] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="h-px bg-white/10 w-8 my-0.5" />

                <div className="flex-1 flex flex-col gap-1 overflow-y-auto w-full items-center no-scrollbar">
                  {data.chapters.map((chapter) => {
                    const isActiveChapter = chapter.problems.some(
                      (p) => p.id === currentProblem?.id,
                    );
                    const chapterDone = chapter.problems.every((p) =>
                      completedProblems.has(p.id),
                    );
                    return (
                      <div key={chapter.id} className="relative group w-full flex justify-center">
                        <button
                          onClick={() => {
                            setIsSidebarCompact(false);
                            setExpandedChapterId(chapter.id);
                          }}
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                            isActiveChapter
                              ? "text-red-400"
                              : chapterDone
                                ? "text-[#2cf09d]"
                                : "text-zinc-500 hover:text-zinc-300",
                          )}
                          style={
                            isActiveChapter
                              ? {
                                  background: "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.08))",
                                  border: "1px solid rgba(239,68,68,0.35)",
                                  boxShadow: "0 0 14px rgba(239,68,68,0.22)",
                                }
                              : chapterDone
                                ? {
                                    background: "rgba(44,240,157,0.08)",
                                    border: "1px solid rgba(44,240,157,0.18)",
                                  }
                                : {
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                  }
                          }
                        >
                          {chapterDone ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : isActiveChapter ? (
                            <Play className="w-3.5 h-3.5 fill-red-400" />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {/* Tooltip */}
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          <div className="bg-[#1a1a1a] text-xs text-white px-2.5 py-1.5 rounded-lg whitespace-nowrap border border-white/10 shadow-lg">
                            {chapter.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {/* ── Full sidebar ── */}
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 drop-shadow-sm">
                    {getLanguageIconUrl(language) ? (
                      <img
                        src={getLanguageIconUrl(language)}
                        alt={language}
                        className="w-6 h-6 object-contain drop-shadow-md"
                      />
                    ) : (
                      <FileCode2 className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-sm text-white truncate">{data.title}</h2>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                      {data.subtitle || "BEGINNER LEVEL"}
                    </span>
                  </div>
                  {isMobile && (
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="text-zinc-500 hover:text-zinc-300 p-1 shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Progress */}
                <div className="px-4 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                      Course Progress
                    </span>
                    <span className="text-[11px] font-black" style={{ color: "#2cf09d" }}>
                      {progressPercent}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden relative"
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
                            : "linear-gradient(90deg, #2cf09d 0%, #34d399 100%)",
                        boxShadow: "0 0 8px rgba(44,240,157,0.45)",
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-600 mt-2 block">
                    {completedCount}/{totalProblems} lessons
                  </span>
                </div>

                <div className="h-px bg-white/10" />

                {/* Chapter list */}
                <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 thin-scroll">
                  {data.chapters.map((chapter) => {
                    const isActiveChapter = chapter.problems.some(
                      (p) => p.id === currentProblem?.id,
                    );
                    const chapterDone = chapter.problems.every((p) =>
                      completedProblems.has(p.id),
                    );
                    const isLocked = false;
                    const isExpanded = expandedChapterId === chapter.id;

                    return (
                      <div key={chapter.id} className="mb-2">
                        <button
                          onClick={() => {
                            if (isLocked) return;
                            setExpandedChapterId(isExpanded ? null : chapter.id);
                          }}
                          disabled={isLocked}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left",
                            isActiveChapter && "text-red-300",
                            chapterDone && !isActiveChapter && "text-zinc-400 hover:bg-white/5",
                            isLocked && "text-zinc-600 cursor-not-allowed opacity-60",
                            !isActiveChapter && !chapterDone && !isLocked && "text-zinc-300 hover:bg-white/5",
                          )}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <span
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px]",
                                isActiveChapter ? "bg-red-500/20 text-red-400" : "bg-white/5 text-zinc-500",
                              )}
                            >
                              {chapterDone ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              ) : isActiveChapter ? (
                                <Play className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                              ) : (
                                <BookOpen className="w-3.5 h-3.5" />
                              )}
                            </span>
                            <span className="flex-1 truncate font-bold text-[14px]">{chapter.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={cn(
                                "text-[9px] font-bold tabular-nums px-1.5 py-0.5 rounded-md",
                                chapterDone
                                  ? "text-[#2cf09d] bg-[#2cf09d]/10"
                                  : isActiveChapter
                                    ? "text-red-300 bg-red-500/10"
                                    : "text-zinc-600 bg-white/[0.04]",
                              )}
                            >
                              {chapter.problems.filter((p) => completedProblems.has(p.id)).length}
                              /{chapter.problems.length}
                            </span>
                            {chapterDone && <CheckCircle className="w-3.5 h-3.5 text-[#2cf09d]" />}
                            {isLocked && <Lock className="w-3.5 h-3.5 text-zinc-600" />}
                            {!isLocked && (
                              <ChevronRight
                                className={cn(
                                  "w-4 h-4 text-zinc-500 transition-transform",
                                  isExpanded && "rotate-90",
                                )}
                              />
                            )}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && !isLocked && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-11 pr-2 py-1 flex flex-col gap-1">
                                {chapter.problems.map((prob) => {
                                  const isProbActive = currentProblem?.id === prob.id;
                                  const isProbDone = completedProblems.has(prob.id);
                                  const isProbLocked = false;
                                  return (
                                    <button
                                      key={prob.id}
                                      onClick={() => {
                                        if (!isProbLocked) {
                                          selectProblem(prob, chapter.id);
                                          if (isMobile) setIsSidebarOpen(false);
                                        }
                                      }}
                                      disabled={isProbLocked}
                                      className={cn(
                                        "relative flex items-center justify-between w-full text-left py-2 pl-4 pr-3 rounded-lg text-sm transition-all",
                                        isProbActive
                                          ? "text-red-200 font-semibold"
                                          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]",
                                        isProbLocked && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-zinc-400",
                                        isProbDone && !isProbActive && "text-[#2cf09d]",
                                      )}
                                      style={
                                        isProbActive
                                          ? {
                                              background: "linear-gradient(90deg, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.04) 100%)",
                                              boxShadow: "inset 2px 0 0 #ef4444, 0 0 16px rgba(239,68,68,0.12)",
                                            }
                                          : undefined
                                      }
                                    >
                                      <span className="truncate">{prob.title}</span>
                                      {isProbDone && (
                                        <CheckCircle className="w-3.5 h-3.5 text-[#2cf07d] shrink-0 ml-2" />
                                      )}
                                      {isProbLocked && (
                                        <Lock className="w-3 h-3 text-zinc-600 shrink-0 ml-2" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
