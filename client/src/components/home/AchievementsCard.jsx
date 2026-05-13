import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { Lock, X, ChevronRight, Trophy } from "lucide-react";

const ACHIEVEMENTS = [
  {
    key: "xp_olympian",
    name: "XP Olympian",
    icon: "/mostxp.svg",
    description: "Earn XP to prove your dedication",
    metric: "xp",
    tiers: [
      { level: 1, threshold: 100, label: "Bronze" },
      { level: 2, threshold: 250, label: "Silver" },
      { level: 3, threshold: 500, label: "Gold" },
      { level: 4, threshold: 1000, label: "Platinum" },
      { level: 5, threshold: 2500, label: "Diamond" },
    ],
  },
  {
    key: "legend",
    name: "Legend",
    description: "Reach higher levels to become a legend",
    metric: "level",
    tiers: [
      { level: 1, threshold: 1, label: "Awakened" },
      { level: 2, threshold: 5, label: "Rising" },
      { level: 3, threshold: 10, label: "Veteran" },
      { level: 4, threshold: 25, label: "Elite" },
      { level: 5, threshold: 50, label: "Legendary" },
    ],
  },
  {
    key: "quest_explorer",
    name: "Quest Explorer",
    description: "Complete quests to unlock rewards",
    metric: "questsCompleted",
    tiers: [
      { level: 1, threshold: 1, label: "Beginner" },
      { level: 2, threshold: 2, label: "Curious" },
      { level: 3, threshold: 5, label: "Adventurer" },
      { level: 4, threshold: 10, label: "Explorer" },
      { level: 5, threshold: 25, label: "Master" },
    ],
  },
  {
    key: "streak_warrior",
    name: "Streak Warrior",
    description: "Maintain your daily solving streak",
    metric: "dayStreak",
    tiers: [
      { level: 1, threshold: 3, label: "Warm Up" },
      { level: 2, threshold: 7, label: "On Fire" },
      { level: 3, threshold: 14, label: "Blazing" },
      { level: 4, threshold: 30, label: "Inferno" },
      { level: 5, threshold: 100, label: "Eternal" },
    ],
  },
  {
    key: "problem_crusher",
    name: "Problem Crusher",
    description: "Solve problems across all playgrounds",
    metric: "totalSolved",
    tiers: [
      { level: 1, threshold: 1, label: "First Step" },
      { level: 2, threshold: 10, label: "Solver" },
      { level: 3, threshold: 50, label: "Grinder" },
      { level: 4, threshold: 100, label: "Centurion" },
      { level: 5, threshold: 500, label: "Elite" },
    ],
  },
  {
    key: "competitor",
    name: "Competitor",
    description: "Win competition matches",
    metric: "totalWins",
    tiers: [
      { level: 1, threshold: 1, label: "Rookie" },
      { level: 2, threshold: 5, label: "Fighter" },
      { level: 3, threshold: 10, label: "Gladiator" },
      { level: 4, threshold: 25, label: "Champion" },
      { level: 5, threshold: 50, label: "Warlord" },
    ],
  },
  {
    key: "polyglot",
    name: "Polyglot",
    description: "Master multiple programming languages",
    metric: "polyglot",
    tiers: [
      { level: 1, threshold: 1, label: "Mono" },
      { level: 2, threshold: 2, label: "Bilingual" },
      { level: 3, threshold: 3, label: "Trilingual" },
      { level: 4, threshold: 4, label: "Polyglot" },
      { level: 5, threshold: 6, label: "Wizard" },
    ],
  },
  {
    key: "scholar",
    name: "Scholar",
    description: "Complete courses to expand your knowledge",
    metric: "learner",
    tiers: [
      { level: 1, threshold: 1, label: "Apprentice" },
      { level: 2, threshold: 3, label: "Student" },
      { level: 3, threshold: 5, label: "Scholar" },
      { level: 4, threshold: 10, label: "Professor" },
      { level: 5, threshold: 20, label: "Academic" },
    ],
  },
  {
    key: "chapter_master",
    name: "Chapter Master",
    description: "Complete course chapters",
    metric: "chapters_completed",
    tiers: [
      { level: 1, threshold: 5, label: "Reader" },
      { level: 2, threshold: 15, label: "Bookworm" },
      { level: 3, threshold: 25, label: "Dedicated" },
      { level: 4, threshold: 50, label: "Devoted" },
      { level: 5, threshold: 100, label: "Master" },
    ],
  },
  {
    key: "social_star",
    name: "Social Star",
    description: "Build your network of friends",
    metric: "friends",
    tiers: [
      { level: 1, threshold: 1, label: "Connected" },
      { level: 2, threshold: 3, label: "Sociable" },
      { level: 3, threshold: 5, label: "Popular" },
      { level: 4, threshold: 10, label: "Influencer" },
      { level: 5, threshold: 25, label: "Celebrity" },
    ],
  },
];

/* ─── Helpers ────────────────────────────────────────────── */

const getMetricValue = (user, metric) => {
  if (!user) return 0;
  switch (metric) {
    case "xp":
      return user.xp || 0;
    case "level":
      return user.level || 1;
    case "dayStreak":
      return user.dayStreak || 0;
    case "friends":
      return (user.friends || []).length;
    case "questsCompleted": {
      const progress = user.achievementProgress || {};
      return (progress.solve_master || 0) > 0
        ? Math.floor((progress.solve_master || 0) / 2)
        : (user.badges || []).length;
    }
    case "totalSolved":
      return (user.achievementProgress || {}).solve_master || 0;
    case "totalWins":
      return (user.achievementProgress || {}).competitor || 0;
    case "polyglot":
      return (user.achievementProgress || {}).polyglot || 0;
    case "learner":
      return (user.achievementProgress || {}).learner || 0;
    case "chapters_completed":
      return (user.achievementProgress || {}).chapters_completed || 0;
    default:
      return 0;
  }
};

const computeTierInfo = (achievement, currentValue) => {
  let currentTier = 0;
  let nextTier = achievement.tiers[0];

  for (let i = 0; i < achievement.tiers.length; i++) {
    if (currentValue >= achievement.tiers[i].threshold) {
      currentTier = achievement.tiers[i].level;
      nextTier = achievement.tiers[i + 1] || null;
    } else {
      nextTier = achievement.tiers[i];
      break;
    }
  }

  const isMaxed =
    currentTier === achievement.tiers[achievement.tiers.length - 1].level;

  return { currentTier, nextTier, isMaxed };
};

const TIER_COLORS = {
  0: {
    border: "border-white/[0.08]",
    bg: "bg-white/[0.02]",
    ring: "",
    text: "text-zinc-600",
    fill: "bg-zinc-700",
  },
  1: {
    border: "border-amber-700/40",
    bg: "bg-amber-900/15",
    ring: "ring-2 ring-amber-700/30",
    text: "text-amber-500",
    fill: "bg-amber-600",
  },
  2: {
    border: "border-slate-400/40",
    bg: "bg-slate-500/15",
    ring: "ring-2 ring-slate-400/30",
    text: "text-slate-300",
    fill: "bg-slate-400",
  },
  3: {
    border: "border-yellow-500/40",
    bg: "bg-yellow-500/15",
    ring: "ring-2 ring-yellow-500/30",
    text: "text-yellow-400",
    fill: "bg-yellow-500",
  },
  4: {
    border: "border-cyan-400/40",
    bg: "bg-cyan-500/15",
    ring: "ring-2 ring-cyan-400/30",
    text: "text-cyan-400",
    fill: "bg-cyan-500",
  },
  5: {
    border: "border-purple-400/50",
    bg: "bg-purple-500/20",
    ring: "ring-2 ring-purple-400/40",
    text: "text-purple-400",
    fill: "bg-gradient-to-r from-purple-500 to-pink-500",
  },
};

/* ─── Preview Circle (for compact card) ──────────────────── */
const AchievementCircle = ({ achievement, user, onClick }) => {
  const value = getMetricValue(user, achievement.metric);
  const { currentTier, isMaxed } = computeTierInfo(achievement, value);
  const colors = TIER_COLORS[currentTier] || TIER_COLORS[0];
  const isLocked = currentTier === 0;

  return (
    <div
      className="flex flex-col items-center text-center group cursor-pointer"
      onClick={onClick}
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105 ${
          isLocked
            ? "bg-white/[0.03] border border-dashed border-white/10"
            : `${colors.bg} ${colors.ring}`
        }`}
      >
        {isLocked ? (
          <Lock className="w-5 h-5 text-zinc-600" />
        ) : achievement.icon ? (
          <img
            src={achievement.icon}
            alt={achievement.name}
            className="w-10 h-10 object-contain"
          />
        ) : (
          <span className={`text-lg font-black ${colors.text}`}>
            {currentTier}
          </span>
        )}
      </div>
      <p
        className={`text-xs font-bold truncate w-full px-1 ${
          isLocked ? "text-zinc-500" : "text-zinc-200"
        }`}
      >
        {achievement.name}
      </p>
      {isLocked ? null : (
        <span
          className={`mt-0.5 text-[9px] font-bold uppercase tracking-wider ${colors.text}`}
        >
          {isMaxed ? "MAX" : achievement.tiers[currentTier - 1].label}
        </span>
      )}
    </div>
  );
};

/* ─── Detail Row (for dialog) ────────────────────────────── */
const AchievementDetailRow = ({ achievement, user }) => {
  const value = getMetricValue(user, achievement.metric);
  const { currentTier, nextTier, isMaxed } = computeTierInfo(
    achievement,
    value,
  );
  const colors = TIER_COLORS[currentTier] || TIER_COLORS[0];
  const isLocked = currentTier === 0;

  let progressPct = 0;
  if (isMaxed) {
    progressPct = 100;
  } else if (nextTier) {
    const prevThreshold =
      currentTier > 0 ? achievement.tiers[currentTier - 1].threshold : 0;
    progressPct = Math.min(
      100,
      Math.round(
        ((value - prevThreshold) / (nextTier.threshold - prevThreshold)) * 100,
      ),
    );
  }

  return (
    <div
      className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-200 ${colors.border} ${colors.bg}`}
    >
      {/* Round icon */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
          isLocked
            ? "bg-white/[0.03] border border-dashed border-white/10"
            : `${colors.bg} ${colors.ring}`
        }`}
      >
        {isLocked ? (
          <Lock className="w-5 h-5 text-zinc-700" />
        ) : achievement.icon ? (
          <img
            src={achievement.icon}
            alt={achievement.name}
            className="w-6 h-6 object-contain"
          />
        ) : (
          <span className={`text-base font-black ${colors.text}`}>
            {currentTier}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p
            className={`text-[13px] font-bold truncate ${
              isLocked ? "text-zinc-500" : "text-metallic"
            }`}
          >
            {achievement.name}
          </p>
          {currentTier > 0 && (
            <span
              className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${colors.text} ${colors.bg} border ${colors.border}`}
            >
              {isMaxed ? "MAX" : achievement.tiers[currentTier - 1].label}
            </span>
          )}
        </div>
        <p className="text-[11px] text-zinc-500 leading-snug mb-2">
          {achievement.description}
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isMaxed
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : currentTier > 0
                    ? "bg-gradient-to-r from-orange-500 to-amber-400"
                    : "bg-zinc-700"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-zinc-500 tabular-nums shrink-0">
            {isMaxed ? (
              <span className="text-purple-400 font-black">MAX</span>
            ) : nextTier ? (
              `${value}/${nextTier.threshold}`
            ) : (
              `${value}`
            )}
          </span>
        </div>

        {/* Tier dots */}
        <div className="flex gap-1 mt-2">
          {achievement.tiers.map((tier) => (
            <div
              key={tier.level}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentTier >= tier.level
                  ? "bg-metallic-orange"
                  : "bg-white/[0.06]"
              }`}
              title={`Tier ${tier.level}: ${tier.label} (${tier.threshold})`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Full Dialog ────────────────────────────────────────── */
const AchievementsDialog = ({ open, onClose, user }) => {
  // Close on Escape
  const handleKey = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, handleKey]);

  if (!open) return null;

  const unlockedCount = ACHIEVEMENTS.filter((a) => {
    const v = getMetricValue(user, a.metric);
    return v >= a.tiers[0].threshold;
  }).length;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg max-h-[85vh] mx-4 bg-[#1a1730] rounded-3xl border border-zinc-700 shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-500/15 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-metallic">
                All Achievements
              </h3>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                {unlockedCount}/{ACHIEVEMENTS.length} Unlocked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {ACHIEVEMENTS.map((achievement) => (
            <AchievementDetailRow
              key={achievement.key}
              achievement={achievement}
              user={user}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
};

/* ─── Main Compact Card ──────────────────────────────────── */
const PREVIEW_COUNT = 4;

const AchievementsCard = () => {
  const user = useSelector((state) => state.auth.user);
  const [dialogOpen, setDialogOpen] = useState(false);

  const unlockedCount = ACHIEVEMENTS.filter((a) => {
    const v = getMetricValue(user, a.metric);
    return v >= a.tiers[0].threshold;
  }).length;

  // Show top 4 — prioritize unlocked, then first locked
  const sorted = [...ACHIEVEMENTS].sort((a, b) => {
    const aVal = getMetricValue(user, a.metric);
    const bVal = getMetricValue(user, b.metric);
    const aUnlocked = aVal >= a.tiers[0].threshold ? 1 : 0;
    const bUnlocked = bVal >= b.tiers[0].threshold ? 1 : 0;
    if (aUnlocked !== bUnlocked) return bUnlocked - aUnlocked;
    // Among unlocked, sort by highest tier
    const aTier = computeTierInfo(a, aVal).currentTier;
    const bTier = computeTierInfo(b, bVal).currentTier;
    return bTier - aTier;
  });

  const preview = sorted.slice(0, PREVIEW_COUNT);

  return (
    <>
      <div className="bg-white dark:bg-[#1a1730] rounded-[2rem] p-6 border border-zinc-300 dark:border-zinc-700 shadow-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h4 className="font-bold text-zinc-900 dark:text-white text-base">
            Achievements
          </h4>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            {unlockedCount}/{ACHIEVEMENTS.length}
          </span>
        </div>

        {/* 2x2 Grid of round achievement circles */}
        <div className="grid grid-cols-2 gap-4">
          {preview.map((achievement) => (
            <AchievementCircle
              key={achievement.key}
              achievement={achievement}
              user={user}
              onClick={() => setDialogOpen(true)}
            />
          ))}
        </div>

        {/* Show All button */}
        <button
          onClick={() => setDialogOpen(true)}
          className="w-full mt-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/10 text-zinc-400 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98]"
        >
          Show All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Full achievements dialog */}
      <AchievementsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        user={user}
      />
    </>
  );
};

export default AchievementsCard;
com;
