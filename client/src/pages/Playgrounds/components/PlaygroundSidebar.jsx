import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Play, BookOpen, FileCode2, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PlaygroundSidebar({
  isMobile,
  isSidebarOpen,
  setIsSidebarOpen,
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
  selectProblem
}) {
  return (
    <>
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
        {(isSidebarOpen || isMobile) && (
          <motion.aside
            initial={isMobile ? { x: -280, opacity: 0 } : { width: 0, opacity: 0 }}
            animate={isMobile ? { x: 0, opacity: 1 } : { width: 250, opacity: 1 }}
            exit={isMobile ? { x: -280, opacity: 0 } : { width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={cn(
              "h-full flex flex-col overflow-hidden shrink-0 bg-[#111111] border-r border-white/10",
              isMobile ? "fixed inset-y-0 left-0 z-50 w-[280px] shadow-2xl" : "hidden md:flex"
            )}
          >
            {/* Course header */}
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
                <h2 className="font-semibold text-sm text-white truncate">
                  {data?.title}
                </h2>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                  {data?.subtitle || "BEGINNER LEVEL"}
                </span>
              </div>
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Progress */}
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest font-semibold mb-2">
                <span className="text-zinc-500">Course Progress</span>
                <span className="text-[#2cf09d] font-bold">{progressPercent}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2cf09d] rounded-full transition-all duration-500 "
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-600 mt-2 block">
                {completedCount} of {totalProblems} lessons completed
              </span>
            </div>

            <div className="h-px bg-white/10" />

            {/* Topic / chapter list */}
            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
              {data?.chapters.map((chapter) => {
                const isActiveChapter = chapter.problems.some(
                  (p) => p.id === currentProblem?.id
                );
                const chapterDone = chapter.problems.every((p) =>
                  completedProblems.has(p.id)
                );
                const isExpanded = expandedChapterId === chapter.id;

                return (
                  <div key={chapter.id} className="mb-2">
                    <button
                      onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left",
                        isActiveChapter ? "text-red-300" : "text-zinc-300 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span
                          className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px]",
                            isActiveChapter ? "bg-red-500/20 text-red-400" : "bg-white/5 text-zinc-500"
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
                        <span className="truncate">{chapter.title}</span>
                      </div>
                      <ChevronRight
                        className={cn(
                          "w-3.5 h-3.5 text-zinc-600 transition-transform duration-200",
                          isExpanded && "rotate-90 text-zinc-400"
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden mt-1 ml-4 border-l border-white/5"
                        >
                          {chapter.problems.map((prob) => {
                            const isActive = prob.id === currentProblem?.id;
                            const isDone = completedProblems.has(prob.id);
                            return (
                              <button
                                key={prob.id}
                                onClick={() => {
                                  selectProblem(prob, chapter.id);
                                  if (isMobile) setIsSidebarOpen(false);
                                }}
                                className={cn(
                                  "w-full flex items-center gap-3 px-4 py-2 text-[12px] transition-colors relative group",
                                  isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                                )}
                              >
                                {isActive && (
                                  <motion.div
                                    layoutId="active-problem"
                                    className="absolute inset-y-1.5 left-0 w-0.5 bg-red-500 rounded-full"
                                  />
                                )}
                                <div className="shrink-0">
                                  {isDone ? (
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <div
                                      className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        isActive ? "bg-red-500" : "bg-zinc-700 group-hover:bg-zinc-500"
                                      )}
                                    />
                                  )}
                                </div>
                                <span className="truncate">{prob.title}</span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
