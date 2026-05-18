import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { Lock, X, ChevronRight, Trophy } from "lucide-react";
import { motion } from "framer-motion";

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
    icon: "/achievements/legend.svg",
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
    icon: "/achievements/quest-explorer.svg",
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
    text: "text-zinc-600",
    glowColor: "rgba(113,113,122,0.0)",
    fillColor: "#3f3f46",
  },
  1: {
    border: "border-amber-700/40",
    bg: "bg-amber-900/15",
    text: "text-amber-500",
    glowColor: "rgba(180,83,9,0.38)",
    fillColor: "#b45309",
  },
  2: {
    border: "border-slate-400/40",
    bg: "bg-slate-500/15",
    text: "text-slate-300",
    glowColor: "rgba(148,163,184,0.32)",
    fillColor: "#94a3b8",
  },
  3: {
    border: "border-yellow-500/40",
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    glowColor: "rgba(234,179,8,0.38)",
    fillColor: "#eab308",
  },
  4: {
    border: "border-cyan-400/40",
    bg: "bg-cyan-500/15",
    text: "text-cyan-400",
    glowColor: "rgba(6,182,212,0.38)",
    fillColor: "#06b6d4",
  },
  5: {
    border: "border-purple-400/50",
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    glowColor: "rgba(168,85,247,0.42)",
    fillColor: "#a855f7",
  },
};

/* ─── Compact circle (card grid) ────────────────────────── */
const AchievementCircle = ({ achievement, user, onClick }) => {
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
    <motion.div
      className="flex flex-col items-center text-center cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.07 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      {/* Circle */}
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${
          isLocked ? "" : !achievement.icon ? colors.bg : ""
        }`}
        style={
          isLocked
            ? { background: "#0f0f0f", border: "1px dashed #2a2a2a" }
            : !achievement.icon
              ? { boxShadow: `0 0 22px ${colors.glowColor}` }
              : {}
        }
      >
        {isLocked ? (
          <Lock className="w-5 h-5 text-zinc-700" />
        ) : achievement.icon ? (
          <img
            src={achievement.icon}
            alt={achievement.name}
            className="w-12 h-12 object-contain"
          />
        ) : (
          <span className={`text-lg font-black ${colors.text}`}>
            {currentTier}
          </span>
        )}
      </div>

      {/* Name */}
      <p
        className={`text-[11px] font-bold truncate w-full px-1 mb-1 ${
          isLocked ? "text-zinc-600" : "text-metallic"
        }`}
      >
        {achievement.name}
      </p>

      {/* Mini progress bar */}
      <div
        className="w-full px-1 mb-1"
        style={{
          height: "3px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            borderRadius: "999px",
            background: isLocked ? "#27272a" : colors.fillColor,
            boxShadow:
              !isLocked && progressPct > 0
                ? `0 0 6px ${colors.glowColor}`
                : "none",
            transition: "width 0.5s ease",
          }}
        />
      </div>

      {/* Tier label */}
      <p
        className={`text-[9px] font-bold uppercase tracking-wider ${
          isLocked ? "text-zinc-700" : colors.text
        }`}
      >
        {isLocked
          ? "Locked"
          : isMaxed
            ? "MAX"
            : achievement.tiers[currentTier - 1]?.label}
      </p>
    </motion.div>
  );
};

/* ─── Detail Row (dialog) ────────────────────────────────── */
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
      {/* Circle */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
          isLocked ? "" : !achievement.icon ? colors.bg : ""
        }`}
        style={
          isLocked
            ? { background: "#0f0f0f", border: "1px dashed #2a2a2a" }
            : !achievement.icon
              ? { boxShadow: `0 0 18px ${colors.glowColor}` }
              : {}
        }
      >
        {isLocked ? (
          <Lock className="w-5 h-5 text-zinc-700" />
        ) : achievement.icon ? (
          <img
            src={achievement.icon}
            alt={achievement.name}
            className="w-12 h-12 object-contain"
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
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: isMaxed
                  ? "linear-gradient(90deg, #a855f7, #ec4899)"
                  : currentTier > 0
                    ? colors.fillColor
                    : "#3f3f46",
                boxShadow:
                  currentTier > 0 && progressPct > 0
                    ? `0 0 8px ${colors.glowColor}`
                    : "none",
              }}
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

        {/* Tier dots — colored per tier via inline style (fixes bg-metallic-orange bug) */}
        <div className="flex gap-1 mt-2">
          {achievement.tiers.map((tier) => (
            <div
              key={tier.level}
              className="w-2 h-2 rounded-full transition-colors"
              style={{
                background:
                  currentTier >= tier.level
                    ? TIER_COLORS[tier.level]?.fillColor || "#f97316"
                    : "rgba(255,255,255,0.06)",
                boxShadow:
                  currentTier >= tier.level &&
                  TIER_COLORS[tier.level]?.glowColor !== "rgba(113,113,122,0.0)"
                    ? `0 0 5px ${TIER_COLORS[tier.level]?.glowColor}`
                    : "none",
              }}
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
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative z-10 w-full max-w-lg max-h-[85vh] mx-4 rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden"
        style={{ background: "#1a1730", border: "1px solid #1a1a1a" }}
      >
        {/* Orange top accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid #1a1a1a" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(249,115,22,0.12)",
                border: "1px solid rgba(249,115,22,0.25)",
              }}
            >
              <Trophy className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-metallic">
                All Achievements
              </h3>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                {unlockedCount}/{ACHIEVEMENTS.length} Unlocked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
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

  const sorted = [...ACHIEVEMENTS].sort((a, b) => {
    const aVal = getMetricValue(user, a.metric);
    const bVal = getMetricValue(user, b.metric);
    const aUnlocked = aVal >= a.tiers[0].threshold ? 1 : 0;
    const bUnlocked = bVal >= b.tiers[0].threshold ? 1 : 0;
    if (aUnlocked !== bUnlocked) return bUnlocked - aUnlocked;
    const aTier = computeTierInfo(a, aVal).currentTier;
    const bTier = computeTierInfo(b, bVal).currentTier;
    return bTier - aTier;
  });

  const preview = sorted.slice(0, PREVIEW_COUNT);

  return (
    <>
      <div
        className="relative rounded-2xl overflow-hidden w-full"
        style={{ background: "#1a1730", border: "1px solid #1a1a1a" }}
      >
        {/* Orange top accent line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(249,115,22,0.1)",
                  border: "1px solid rgba(249,115,22,0.22)",
                }}
              >
                <Trophy className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <h4 className="text-sm font-bold text-metallic">Achievements</h4>
            </div>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums"
              style={{
                background: "rgba(249,115,22,0.08)",
                border: "1px solid rgba(249,115,22,0.2)",
              }}
            >
              <span className="text-metallic-orange">{unlockedCount}</span>
              <span className="text-zinc-600 font-normal">
                /{ACHIEVEMENTS.length}
              </span>
            </span>
          </div>

          {/* 2×2 grid */}
          <div className="grid grid-cols-2 gap-3">
            {preview.map((achievement) => (
              <AchievementCircle
                key={achievement.key}
                achievement={achievement}
                user={user}
                onClick={() => setDialogOpen(true)}
              />
            ))}
          </div>

          {/* Show All */}
          <button
            onClick={() => setDialogOpen(true)}
            className="w-full mt-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] hover:border-zinc-700"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid #1f1f1f",
            }}
          >
            <span className="text-metallic">Show All</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        </div>
      </div>

      <AchievementsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        user={user}
      />
    </>
  );
};

export default AchievementsCard;
