import React from "react";
import { CheckCircle, Play, BookOpen, Trophy, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function RightSidebar({
  user,
  data,
  currentProblem,
  completedProblems,
  sessionXP,
  sessionSolved,
  progressPercent,
  completedCount,
  totalProblems,
  selectProblem,
}) {
  return (
    <aside
      className="playground-sidebar w-[256px] shrink-0 flex flex-col overflow-hidden relative"
      style={{
        background: "linear-gradient(180deg, #111111 0%, #0d0d0d 100%)",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="relative z-10 flex flex-col h-full overflow-hidden">

        {/* User Stats */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 ring-1 ring-amber-400/30 shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-red-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{user?.name?.charAt(0) || "U"}</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-extrabold text-metallic truncate">{user?.name}</p>
              <p className="text-[11px] font-bold text-metallic-orange">
                Lv.{user?.level} · {user?.league || "Bronze"}
              </p>
            </div>
            <Trophy
              className="w-4 h-4 text-metallic-orange shrink-0"
              style={{ filter: "drop-shadow(0 0 6px rgba(251,191,36,0.5))" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              className="rounded-xl p-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 0 18px rgba(44,240,157,0.08) inset",
              }}
            >
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Session XP</p>
              <motion.p
                key={sessionXP}
                initial={{ scale: 1.2, color: "#ffffff" }}
                animate={{ scale: 1, color: "#2cf07d" }}
                className="text-[15px] font-bold flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />+{sessionXP}
              </motion.p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Solved</p>
              <p className="text-[15px] font-bold text-metallic">{sessionSolved}</p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Progress</p>
              <p className="text-[15px] font-bold text-metallic-orange">{progressPercent}%</p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Done</p>
              <p className="text-[15px] font-bold text-metallic">{completedCount}/{totalProblems}</p>
            </div>
          </div>
        </div>

        {/* Course Path */}
        <div className="flex-1 overflow-y-auto thin-scroll">
          <div className="p-4">
            <div className="mb-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Course Path</p>
              <div
                className="h-px w-8"
                style={{ background: "linear-gradient(90deg, rgba(239,68,68,0.5), transparent)" }}
              />
            </div>
            {data.chapters.map((chapter) => {
              const isCurrentChapter = chapter.problems.some((p) => p.id === currentProblem?.id);
              const chapterDone = chapter.problems.every((p) => completedProblems.has(p.id));
              return (
                <div key={chapter.id} className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center shrink-0",
                        chapterDone
                          ? "bg-emerald-500/20 text-emerald-400"
                          : isCurrentChapter
                            ? "bg-red-500/20 text-red-400"
                            : "bg-white/5 text-zinc-600",
                      )}
                      style={
                        isCurrentChapter
                          ? { boxShadow: "0 0 10px rgba(239,68,68,0.20)" }
                          : chapterDone
                            ? { boxShadow: "0 0 10px rgba(44,240,157,0.15)" }
                            : undefined
                      }
                    >
                      {chapterDone ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : isCurrentChapter ? (
                        <Play className="w-3 h-3 fill-red-400" />
                      ) : (
                        <BookOpen className="w-3 h-3" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[11px] font-semibold truncate",
                        chapterDone ? "text-emerald-400" : isCurrentChapter ? "text-metallic" : "text-zinc-500",
                      )}
                    >
                      {chapter.title}
                    </span>
                  </div>

                  <div className="mt-1 space-y-0">
                    {chapter.problems.map((prob, pIdx) => {
                      const isDone = completedProblems.has(prob.id);
                      const isCurrent = currentProblem?.id === prob.id;
                      const isLast = pIdx === chapter.problems.length - 1;
                      return (
                        <div key={prob.id} className="flex items-stretch gap-2">
                          <div className="flex flex-col items-center shrink-0 w-3">
                            <div
                              className={cn(
                                "w-2.5 h-2.5 rounded-full border-2 shrink-0 mt-2 transition-all",
                                isDone
                                  ? "bg-[#2cf07d] border-[#2cf07d]"
                                  : isCurrent
                                    ? "bg-red-500 border-red-500"
                                    : "bg-[#111111] border-zinc-700",
                              )}
                              style={
                                isCurrent
                                  ? {
                                      boxShadow:
                                        "0 0 8px rgba(239,68,68,0.6), 0 0 2px rgba(239,68,68,0.8)",
                                    }
                                  : isDone
                                    ? { boxShadow: "0 0 6px rgba(44,240,157,0.5)" }
                                    : undefined
                              }
                            />
                            {!isLast && <div className="w-px flex-1 bg-white/10 mt-0.5 mb-0.5" />}
                          </div>
                          <button
                            onClick={() => selectProblem(prob, chapter.id)}
                            className="flex-1 flex items-center gap-1.5 py-1.5 text-left group min-w-0"
                          >
                            <span
                              className={cn(
                                "text-[11px] leading-tight truncate transition-colors",
                                isDone
                                  ? "text-[#2cf07d]"
                                  : isCurrent
                                    ? "text-metallic font-semibold"
                                    : "text-zinc-500 group-hover:text-zinc-300",
                              )}
                            >
                              {prob.title}
                            </span>
                            {isCurrent && (
                              <motion.span
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="ml-auto shrink-0 text-[8px] font-black text-red-400 bg-red-500/12 px-1.5 py-0.5 rounded-sm border border-red-500/25 tracking-widest"
                              >
                                NOW
                              </motion.span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next XP reward */}
        <div
          className="p-3"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7))",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/xp.svg"
                className="w-5 h-5"
                alt="XP"
                style={{ filter: "drop-shadow(0 0 8px rgba(44,240,157,0.4))" }}
              />
              <span className="text-xs text-zinc-400 font-medium">Next reward</span>
            </div>
            {completedProblems.has(currentProblem?.id) ? (
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="text-sm font-bold text-[#2cf07d]"
              >
                Earned!
              </motion.span>
            ) : (
              <span className="text-sm font-bold text-[#2cf07d]">+{currentProblem?.xp} XP</span>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
}
