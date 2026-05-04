import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  Zap, TrendingUp, Brain, Globe, Flame, Mountain,
  Shield, CheckCircle, Loader2, RefreshCw,
} from "lucide-react";
import { fetchUserQuests, claimQuestReward } from "@/features/quests/questsApi";
import { updateUserStats } from "@/features/auth/authSlice";
import { store } from "@/store/store";
import { emit } from "@/lib/gamificationBus";

const ICON_MAP = { Zap, TrendingUp, Brain, Globe, Flame, Mountain };

const QuestCard = ({ quest, onClaim, claiming }) => {
  const Icon = ICON_MAP[quest.icon] || Zap;
  const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));
  const canClaim = quest.completed && !quest.claimed;
  const isClaiming = claiming === quest.id;

  return (
    <div
      className={`relative flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-200
        ${quest.claimed
          ? "bg-white/[0.02] border-white/5 opacity-60"
          : quest.completed
          ? "bg-indigo-500/10 border-indigo-500/30"
          : "bg-white/[0.04] border-white/10 hover:border-white/20"
        }`}
    >
      {quest.claimed && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
          ${quest.completed && !quest.claimed ? "bg-indigo-500/20" : "bg-white/5"}`}
        >
          <Icon className={`w-4 h-4 ${quest.completed && !quest.claimed ? "text-indigo-400" : "text-zinc-400"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white leading-tight">{quest.title}</p>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full shrink-0">
              +{quest.xpReward} XP
            </span>
          </div>
          <p className="text-[12px] text-zinc-500 mt-0.5 leading-snug">{quest.description}</p>
          {quest.shieldReward && (
            <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
              <Shield className="w-3 h-3" /> +{quest.shieldReward} Streak Shield
            </p>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-zinc-500 font-medium">
            {quest.progress} / {quest.target}
          </span>
          <span className="text-[11px] font-bold text-zinc-400">{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500
              ${quest.claimed ? "bg-emerald-500" : quest.completed ? "bg-indigo-500" : "bg-zinc-600"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {canClaim && (
        <button
          onClick={() => onClaim(quest.id, quest.period)}
          disabled={isClaiming}
          className="w-full mt-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95
            text-white text-[13px] font-bold transition-all duration-150 flex items-center justify-center gap-2
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isClaiming ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Claiming…</>
          ) : (
            <>Claim +{quest.xpReward} XP</>
          )}
        </button>
      )}

      {quest.claimed && (
        <p className="text-center text-[12px] font-semibold text-emerald-500">Reward Claimed</p>
      )}
    </div>
  );
};

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-3">
    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
    <p className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</p>
  </div>
);

const DailyQuests = () => {
  const dispatch = useDispatch();
  const [quests, setQuests] = useState(null);
  const [shields, setShields] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchUserQuests();
      if (res.data.success) {
        setQuests({ daily: res.data.daily, weekly: res.data.weekly });
        setShields(res.data.streakShields || 0);
      }
    } catch {
      setError("Failed to load quests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleClaim = async (questId, period) => {
    setClaiming(questId);
    try {
      const prevUser = store.getState().auth.user;
      const res = await claimQuestReward(questId, period);
      if (res.data.success) {
        dispatch(updateUserStats(res.data.user));
        setShields(res.data.user.streakShields || 0);

        if (res.data.xpAwarded) emit({ type: "xp", amount: res.data.xpAwarded });
        if (res.data.user.level > (prevUser?.level || 1)) {
          emit({ type: "levelUp", level: res.data.user.level });
        }
        if (res.data.user.rank !== prevUser?.rank) {
          emit({ type: "rankUp", rank: res.data.user.rank });
        }
        const prevBadges = prevUser?.badges || [];
        (res.data.user.badges || [])
          .filter((b) => !prevBadges.find((pb) => pb.title === b.title))
          .forEach((b) => emit({ type: "badge", ...b }));

        await load();
      }
    } catch (err) {
      console.error("[DailyQuests] Claim error:", err);
    } finally {
      setClaiming(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 flex items-center justify-center h-40">
        <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 flex items-center justify-center gap-3 h-40">
        <p className="text-zinc-500 text-sm">{error}</p>
        <button onClick={load} className="text-indigo-400 hover:text-indigo-300 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (!quests) return null;

  const completedToday = quests.daily.quests.filter((q) => q.completed).length;
  const completedWeek = quests.weekly.quests.filter((q) => q.completed).length;

  return (
    <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 shadow-md shadow-black/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-white">Quests</h2>
          <p className="text-[12px] text-zinc-500 mt-0.5">
            {completedToday}/{quests.daily.quests.length} daily &middot;{" "}
            {completedWeek}/{quests.weekly.quests.length} weekly
          </p>
        </div>
        <div className="flex items-center gap-3">
          {shields > 0 && (
            <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[12px] font-bold text-cyan-400">{shields}</span>
            </div>
          )}
          <button
            onClick={load}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Quests */}
        <div>
          <SectionHeader
            title="Daily"
            subtitle="Resets at midnight UTC"
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

        {/* Weekly Quests */}
        <div>
          <SectionHeader
            title="Weekly"
            subtitle="Resets every Monday UTC"
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
