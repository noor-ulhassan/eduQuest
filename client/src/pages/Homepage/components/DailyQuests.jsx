import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import {
  Zap,
  TrendingUp,
  Brain,
  Globe,
  Flame,
  Mountain,
  Shield,
  CheckCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  Clock,
  Calendar,
} from "lucide-react";
import { claimQuestReward } from "@/features/quests/questsApi";
import { useQuests } from "@/features/quests/useQuests";
import { updateUserStats } from "@/features/auth/authSlice";
import { store } from "@/store/store";
import { emit } from "@/lib/gamificationBus";

const ICON_MAP = { Zap, TrendingUp, Brain, Globe, Flame, Mountain };

const QuestCard = ({ quest, onClaim, claiming }) => {
  const Icon = ICON_MAP[quest.icon] || Zap;
  const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));
  const canClaim = quest.completed && !quest.claimed;
  const isClaiming = claiming === quest.id;

  const isClaimed = quest.claimed;
  const isComplete = quest.completed && !quest.claimed;

  return (
    <div
      className={`group relative rounded-2xl border p-4 transition-all duration-200 ${
        isClaimed
          ? "border-emerald-500/15 bg-emerald-500/[0.04]"
          : isComplete
            ? "border-orange-500/30 bg-orange-500/[0.06]"
            : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
      }`}
    >
      {/* Claimed badge */}
      {isClaimed && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Done
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
            isClaimed
              ? "bg-emerald-500/10 text-emerald-400"
              : isComplete
                ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20"
                : "bg-white/5 text-zinc-500"
          }`}
        >
          <Icon className="w-[18px] h-[18px]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 pr-10">
            <p
              className={`text-[13px] font-bold leading-tight truncate ${
                isClaimed ? "text-zinc-500" : "text-metallic"
              }`}
            >
              {quest.title}
            </p>
            {!isClaimed && (
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 border leading-none ${
                  isComplete
                    ? "text-metallic-orange bg-orange-500/15 border-orange-500/25"
                    : "text-metallic-orange bg-amber-400/10 border-amber-400/15"
                }`}
              >
                +{quest.xpReward} XP
              </span>
            )}
          </div>

          <p
            className={`text-[11px] mt-1 leading-snug ${
              isClaimed ? "text-zinc-600" : "text-zinc-400"
            }`}
          >
            {quest.description}
          </p>

          {quest.shieldReward ? (
            <div className="flex items-center gap-1 mt-1.5">
              <Shield className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] font-bold text-cyan-400">
                +{quest.shieldReward} Streak Shield
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3 space-y-1.5">
        <div className="flex justify-between items-center">
          <span
            className={`text-[11px] font-medium ${isClaimed ? "text-zinc-600" : "text-zinc-500"}`}
          >
            <span
              className={`font-bold ${isClaimed ? "text-zinc-500" : "text-metallic"}`}
            >
              {quest.progress}
            </span>
            <span className="mx-0.5">/</span>
            {quest.target}
          </span>
          <span
            className={`text-[11px] font-black tabular-nums ${
              isClaimed
                ? "text-emerald-500"
                : isComplete
                  ? "text-metallic-orange"
                  : "text-zinc-500"
            }`}
          >
            {pct}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isClaimed
                ? "bg-emerald-500/60"
                : isComplete
                  ? "bg-gradient-to-r from-orange-500 to-amber-400"
                  : "bg-zinc-700"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Claim Button */}
      {canClaim && (
        <button
          onClick={() => onClaim(quest.id, quest.period)}
          disabled={isClaiming}
          className="w-full mt-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/15 transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isClaiming ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Claiming...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Claim Reward
            </>
          )}
        </button>
      )}
    </div>
  );
};

const SectionHeader = ({ title, subtitle, icon: SectionIcon }) => (
  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.05]">
    <div className="flex items-center gap-2">
      <SectionIcon className="w-3.5 h-3.5 text-zinc-600" />
      <h3 className="text-[11px] font-extrabold text-metallic uppercase tracking-widest">
        {title}
      </h3>
    </div>
    <span className="text-[10px] font-medium text-zinc-600">{subtitle}</span>
  </div>
);

const DailyQuests = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [claiming, setClaiming] = useState(null);

  const { data: questsData, isLoading: loading, isError, refetch: load } = useQuests();

  const quests = questsData?.data
    ? { daily: questsData.data.daily, weekly: questsData.data.weekly }
    : null;
  const shields = questsData?.data?.streakShields || 0;
  const error = isError ? "Failed to load quests" : null;

  const handleClaim = async (questId, period) => {
    setClaiming(questId);
    try {
      const prevUser = store.getState().auth.user;
      const res = await claimQuestReward(questId, period);
      if (res.data) {
        dispatch(updateUserStats(res.data.user));

        if (res.data.xpAwarded)
          emit({ type: "xp", amount: res.data.xpAwarded });
        if (res.data.user.level > (prevUser?.level || 1)) {
          emit({ type: "levelUp", level: res.data.user.level });
        }
        if (res.data.user.league !== prevUser?.league) {
          emit({ type: "rankUp", league: res.data.user.league });
        }
        const prevBadges = prevUser?.badges || [];
        (res.data.user.badges || [])
          .filter((b) => !prevBadges.find((pb) => pb.title === b.title))
          .forEach((b) => emit({ type: "badge", ...b }));

        queryClient.invalidateQueries({ queryKey: ["quests"] });
      }
    } catch (err) {
      console.error("[DailyQuests] Claim error:", err);
    } finally {
      setClaiming(null);
    }
  };

  /* Loading state */
  if (loading) {
    return (
      <div className="bg-[#1a1730] rounded-[2rem] p-6 border border-zinc-700 shadow-sm w-full">
        <div className="flex items-center justify-between mb-5">
          <div className="h-5 w-36 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-5 w-20 bg-white/5 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1].map((col) => (
            <div key={col} className="space-y-3">
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-white/[0.03] border border-white/[0.04] rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* Error state */
  if (error) {
    return (
      <div className="bg-[#1a1730] rounded-[2rem] p-8 border border-zinc-700 shadow-sm w-full flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <Target className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-metallic mb-1">
            Could not load quests
          </p>
          <p className="text-xs text-zinc-500">
            Check your connection and try again.
          </p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition-all duration-200 active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  if (!quests) return null;

  const completedToday = quests.daily.quests.filter((q) => q.completed).length;
  const completedWeek = quests.weekly.quests.filter((q) => q.completed).length;
  const totalDaily = quests.daily.quests.length;
  const totalWeekly = quests.weekly.quests.length;
  const overallPct = Math.round(
    ((completedToday + completedWeek) / Math.max(1, totalDaily + totalWeekly)) *
      100,
  );

  return (
    <div className="bg-[#1a1730] rounded-[2rem] p-6 border border-zinc-700 shadow-sm w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h4 className="font-extrabold text-metallic text-2xl flex items-center ">
            <img src="/chest.gif" alt="quest" width={100} height={100} />
            Active Quests
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              {completedToday}/{totalDaily} Daily
            </span>
            <span className="text-zinc-700">·</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              {completedWeek}/{totalWeekly} Weekly
            </span>
            {overallPct > 0 && (
              <>
                <span className="text-zinc-700">·</span>
                <span className="text-[10px] font-black text-metallic-orange tabular-nums">
                  {overallPct}%
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {shields > 0 && (
            <div
              className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full"
              title="Streak Shields"
            >
              <Shield className="w-3 h-3 text-cyan-400" />
              <span className="text-[11px] font-black text-cyan-400 tabular-nums">
                {shields}
              </span>
            </div>
          )}
          <button
            onClick={load}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 active:scale-90"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Quest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily */}
        <div>
          <SectionHeader
            title="Daily"
            subtitle="Resets at Midnight"
            icon={Clock}
          />
          <div className="flex flex-col gap-3">
            {quests.daily.quests.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                onClaim={handleClaim}
                claiming={claiming}
              />
            ))}
          </div>
        </div>

        {/* Weekly */}
        <div>
          <SectionHeader
            title="Weekly"
            subtitle="Resets Monday"
            icon={Calendar}
          />
          <div className="flex flex-col gap-3">
            {quests.weekly.quests.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                onClaim={handleClaim}
                claiming={claiming}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyQuests;
