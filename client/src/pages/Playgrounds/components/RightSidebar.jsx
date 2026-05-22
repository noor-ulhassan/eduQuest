import React from "react";
import { CheckCircle, Play, BookOpen, Trophy, Zap } from "lucide-react";
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
      className="playground-sidebar w-[256px] shrink-0 border-l border-white/10 flex flex-col overflow-hidden relative"
      style={{
        backgroundImage: "url('/alone.jfif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/78 z-0" />
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
              <p className="text-sm font-extrabold text-metallic truncate">{user?.name}</p>
              <p className="text-[11px] font-bold text-metallic-orange">
                Lv.{user?.level} · {user?.league || "Bronze"}
              </p>
            </div>
            <Trophy className="w-4 h-4 text-metallic-orange shrink-0" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/55 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <p className="text-[9px] text-metallic uppercase tracking-wider font-bold mb-1">Session XP</p>
              <p className="text-[15px] font-bold text-[#2cf07d] flex items-center gap-1">
                <Zap className="w-3 h-3" />+{sessionXP}
              </p>
            </div>
            <div className="bg-black/55 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <p className="text-[9px] text-metallic uppercase tracking-wider font-bold mb-1">Solved</p>
              <p className="text-[15px] font-bold text-metallic">{sessionSolved}</p>
            </div>
            <div className="bg-black/55 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <p className="text-[9px] text-metallic uppercase tracking-wider font-bold mb-1">Progress</p>
              <p className="text-[15px] font-bold text-metallic-orange">{progressPercent}%</p>
            </div>
            <div className="bg-black/55 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <p className="text-[9px] text-metallic uppercase tracking-wider font-bold mb-1">Done</p>
              <p className="text-[15px] font-bold text-metallic">{completedCount}/{totalProblems}</p>
            </div>
          </div>
        </div>

        {/* Course Path */}
        <div className="flex-1 overflow-y-auto thin-scroll">
          <div className="p-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-metallic mb-4">Course Path</p>
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
                                    ? "bg-red-500 border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"
                                    : "bg-[#111111] border-zinc-700",
                              )}
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
                              <span className="ml-auto shrink-0 text-[8px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                NOW
                              </span>
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
        <div className="p-3 border-t border-white/10 bg-black/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/xp.svg" className="w-5 h-5" alt="XP" />
              <span className="text-xs text-metallic font-medium">Next reward</span>
            </div>
            <span className="text-sm font-bold text-[#2cf07d]">
              {completedProblems.has(currentProblem?.id) ? "Earned!" : `+${currentProblem?.xp} XP`}
            </span>
          </div>
        </div>

      </div>
    </aside>
  );
}
