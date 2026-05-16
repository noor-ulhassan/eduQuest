import React, { useEffect, useState, useCallback } from "react";
import { Gamepad2, Link, Unlink, Loader2, RefreshCw, ChevronDown, ChevronRight, Zap } from "lucide-react";
import { getCurriculum, updateProblem, clearPlaygroundCache } from "@/features/playground/playgroundApi";
import { toast } from "sonner";

const DIFFICULTY_COLORS = {
  Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  Hard: "text-red-400 bg-red-500/10 border-red-500/20",
  Expert: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

function ProblemCard({ problem, isLinked, onToggle, toggling }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
        isLinked
          ? "bg-indigo-950/40 border-indigo-500/40"
          : "bg-black/30 border-white/5 hover:border-white/10"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-white truncate">{problem.title}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[problem.difficulty] || "text-zinc-400 bg-zinc-800 border-zinc-700"}`}>
            {problem.difficulty}
          </span>
          <span className="text-[10px] text-[#2cf07d] flex items-center gap-0.5">
            <Zap className="w-3 h-3" />{problem.xp} XP
          </span>
        </div>
        {problem.description && (
          <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{problem.description}</p>
        )}
      </div>
      <button
        onClick={() => onToggle(problem)}
        disabled={toggling}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0 ${
          isLinked
            ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50 hover:bg-red-600/20 hover:text-red-300 hover:border-red-500/40"
            : "bg-white/5 text-zinc-400 border-white/10 hover:bg-indigo-600/20 hover:text-indigo-300 hover:border-indigo-500/40"
        }`}
      >
        {toggling ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isLinked ? (
          <><Unlink className="w-3 h-3" /> Unlink</>
        ) : (
          <><Link className="w-3 h-3" /> Link</>
        )}
      </button>
    </div>
  );
}

export default function ChapterPracticeLinker({ courseId, chapterIndex, linkedPlayground }) {
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({});

  const fetchData = useCallback(async () => {
    if (!linkedPlayground) return;
    setLoading(true);
    try {
      clearPlaygroundCache();
      const res = await getCurriculum(linkedPlayground);
      setCurriculum(res?.curriculum || null);
      // Auto-expand chapters that have linked problems
      const expanded = {};
      (res?.curriculum?.chapters || []).forEach((ch) => {
        const hasLinked = ch.problems.some(
          (p) => p.courseChapterLink?.courseId === courseId && p.courseChapterLink?.chapterIndex === chapterIndex
        );
        if (hasLinked) expanded[ch.id] = true;
      });
      setExpandedChapters(expanded);
    } catch {
      toast.error("Failed to load playground");
    } finally {
      setLoading(false);
    }
  }, [linkedPlayground, courseId, chapterIndex]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleLink = async (problem) => {
    const isLinked =
      problem.courseChapterLink?.courseId === courseId &&
      problem.courseChapterLink?.chapterIndex === chapterIndex;

    setTogglingId(problem.id);
    try {
      const payload = isLinked
        ? { courseChapterLink: { courseId: null, chapterIndex: null } }
        : { courseChapterLink: { courseId, chapterIndex } };

      await updateProblem(linkedPlayground, problem.id, payload);
      clearPlaygroundCache();
      await fetchData();
      toast.success(isLinked ? "Problem unlinked" : "Problem linked to this chapter");
    } catch {
      toast.error("Failed to update link");
    } finally {
      setTogglingId(null);
    }
  };

  const toggleChapter = (id) => setExpandedChapters((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!linkedPlayground) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-8">
        <Gamepad2 className="w-12 h-12 text-zinc-700 mb-4" />
        <p className="text-zinc-400 font-semibold mb-1">No playground linked</p>
        <p className="text-xs text-zinc-600 max-w-xs">
          Go to the <span className="text-indigo-400 font-medium">Settings</span> tab and link a language playground to this course first.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-8">
        <Gamepad2 className="w-10 h-10 text-zinc-700 mb-3" />
        <p className="text-zinc-400 font-semibold mb-1 capitalize">No {linkedPlayground} playground found</p>
        <p className="text-xs text-zinc-600">Create the playground first in Admin → Curriculum.</p>
      </div>
    );
  }

  const chapters = curriculum.chapters || [];
  const totalLinked = chapters.reduce(
    (sum, ch) =>
      sum +
      ch.problems.filter(
        (p) => p.courseChapterLink?.courseId === courseId && p.courseChapterLink?.chapterIndex === chapterIndex
      ).length,
    0
  );

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-indigo-400" />
            Practice Activities
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 capitalize">
            Linking from <span className="text-indigo-400 font-medium">{linkedPlayground}</span> playground
            {totalLinked > 0 && (
              <span className="ml-2 text-[#2cf07d]">· {totalLinked} linked to this chapter</span>
            )}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-xs text-zinc-600 bg-white/3 border border-white/5 rounded-lg px-3 py-2">
        Select problems from the <span className="text-indigo-400 capitalize">{linkedPlayground}</span> playground to appear as practice activities at the end of this chapter for students.
      </p>

      {chapters.length === 0 && (
        <div className="text-center py-10 text-zinc-600 text-sm">
          This playground has no chapters yet. Add some in Admin → Curriculum.
        </div>
      )}

      {/* Chapter groups */}
      <div className="space-y-3">
        {chapters.map((ch) => {
          const linkedInChapter = ch.problems.filter(
            (p) => p.courseChapterLink?.courseId === courseId && p.courseChapterLink?.chapterIndex === chapterIndex
          ).length;
          const isOpen = !!expandedChapters[ch.id];

          return (
            <div key={ch.id} className="border border-white/8 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleChapter(ch.id)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/3 hover:bg-white/5 transition-colors text-left"
              >
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
                )}
                <span className="text-sm font-semibold text-white flex-1">{ch.title}</span>
                <span className="text-xs text-zinc-500">{ch.problems.length} problems</span>
                {linkedInChapter > 0 && (
                  <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                    {linkedInChapter} linked
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="px-4 py-3 space-y-2 bg-black/20">
                  {ch.problems.length === 0 && (
                    <p className="text-xs text-zinc-600 py-2 text-center">No problems in this chapter.</p>
                  )}
                  {ch.problems.map((problem) => {
                    const isLinked =
                      problem.courseChapterLink?.courseId === courseId &&
                      problem.courseChapterLink?.chapterIndex === chapterIndex;
                    return (
                      <ProblemCard
                        key={problem.id}
                        problem={problem}
                        isLinked={isLinked}
                        onToggle={toggleLink}
                        toggling={togglingId === problem.id}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
