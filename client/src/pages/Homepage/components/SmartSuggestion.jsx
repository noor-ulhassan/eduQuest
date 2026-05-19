import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { getSuggestion, markSuggestionActed } from "@/features/suggestions/suggestionsApi";

const TYPE_CONFIG = {
  revisit_lesson:  { label: "Review",   color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20"  },
  practice_now:    { label: "Practice", color: "text-sky-400",    bg: "bg-sky-500/10",    border: "border-sky-500/20"    },
  advance_flagged: { label: "Advance",  color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  next_chapter:    { label: "Up Next",  color: "text-[#2cf07d]",  bg: "bg-emerald-500/10",border: "border-emerald-500/20"},
};

const SmartSuggestion = () => {
  const navigate = useNavigate();
  // undefined = loading, null = no suggestion, object = suggestion
  const [suggestion, setSuggestion] = useState(undefined);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    setSuggestion(undefined);
    try {
      const res = await getSuggestion();
      setSuggestion(res.data?.suggestion ?? null);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCTA = async () => {
    if (!suggestion || acting) return;
    setActing(true);
    try {
      await markSuggestionActed();
    } catch {
      // non-blocking — proceed regardless
    }
    // Fire-and-forget: pre-generate next suggestion while user navigates
    getSuggestion(true).catch(() => {});
    navigate(
      `/workspace?courseId=${suggestion.courseId}&chapter=${suggestion.chapterIndex ?? 0}`,
    );
  };

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (suggestion === undefined) {
    return (
      <div className="bg-[#1a1730] rounded-[2rem] p-6 border border-zinc-700 shadow-sm w-full animate-pulse">
        <div className="h-3.5 w-28 bg-white/5 rounded mb-4" />
        <div className="h-4 w-full bg-white/5 rounded mb-2" />
        <div className="h-4 w-3/4 bg-white/5 rounded mb-6" />
        <div className="h-10 w-full bg-white/5 rounded-xl" />
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-[#1a1730] rounded-[2rem] p-6 border border-zinc-700 shadow-sm w-full flex flex-col items-center justify-center gap-3 text-center min-h-[160px]">
        <p className="text-sm text-zinc-500">Could not load suggestion</p>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!suggestion) {
    return (
      <div className="bg-[#1a1730] rounded-[2rem] p-6 border border-zinc-700 shadow-sm w-full flex flex-col items-center justify-center gap-3 text-center min-h-[160px]">
        <CheckCircle2 className="w-8 h-8 text-[#2cf07d]" />
        <div>
          <p className="text-sm font-bold text-zinc-200">You're all caught up!</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Check back after your next session.
          </p>
        </div>
      </div>
    );
  }

  // ── Suggestion ──────────────────────────────────────────────────────────
  const typeInfo = TYPE_CONFIG[suggestion.type] ?? TYPE_CONFIG.next_chapter;

  return (
    <div className="bg-[#1a1730] rounded-[2rem] p-6 border border-zinc-700 shadow-sm w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-orange-400" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
            Smart Suggestion
          </span>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeInfo.color} ${typeInfo.bg} ${typeInfo.border}`}
        >
          {typeInfo.label}
        </span>
      </div>

      {/* Reason text */}
      <p className="text-[13px] text-zinc-300 leading-relaxed flex-1">
        {suggestion.reason}
      </p>

      {/* CTA button */}
      <button
        onClick={handleCTA}
        disabled={acting}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-[12px] font-black uppercase tracking-widest transition-all duration-150 active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-orange-500/15"
      >
        {acting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <>
            {suggestion.ctaLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </div>
  );
};

export default SmartSuggestion;
