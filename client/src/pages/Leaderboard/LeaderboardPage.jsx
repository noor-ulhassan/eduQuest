import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  getGlobalLeaderboard,
  getPlaygroundLeaderboard,
  getCompetitionLeaderboard,
  getLearnerLeaderboard,
  getWeeklyLeaderboard,
} from "../../features/leaderboard/leaderboardApi";
import {
  Trophy,
  Code2,
  BookOpen,
  Swords,
  CalendarDays,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LEAGUE_LEVELS,
  getLeagueStyle,
  getLeagueProgress,
} from "@/lib/leagues";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

// ─── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  {
    id: "global",
    label: "Global XP",
    icon: Zap,
    description: "All-time ranking by total XP earned across every feature.",
    colLabel: "XP",
    fetchFn: getGlobalLeaderboard,
    metricFn: (e) => `${(e.xp ?? 0).toLocaleString()} XP`,
  },
  {
    id: "playground",
    label: "Playground",
    icon: Code2,
    description:
      "Top coders ranked by total problems solved across all languages.",
    colLabel: "SOLVES",
    fetchFn: getPlaygroundLeaderboard,
    metricFn: (e) => `${e.totalSolved ?? 0} Solves`,
  },
  {
    id: "competition",
    label: "Competition",
    icon: Swords,
    description: "Top competitors ranked by all-time match wins.",
    colLabel: "WINS",
    fetchFn: getCompetitionLeaderboard,
    metricFn: (e) => `${e.totalWins ?? 0}W / ${e.totalMatches ?? 0}G`,
  },
  {
    id: "learner",
    label: "Learner",
    icon: BookOpen,
    description: "Top learners ranked by total workspace chapters completed.",
    colLabel: "CHAPTERS",
    fetchFn: getLearnerLeaderboard,
    metricFn: (e) => `${e.totalChapters ?? 0} Ch`,
  },
  {
    id: "weekly",
    label: "Weekly",
    icon: CalendarDays,
    description:
      "This week's competition XP — resets every Monday at midnight.",
    colLabel: "WEEKLY XP",
    fetchFn: getWeeklyLeaderboard,
    metricFn: (e) => `${e.weeklyXP ?? 0} XP`,
  },
];

// ─── Small reusable pieces ─────────────────────────────────────────────────────

const Avatar = ({ src, seed, size = "md", className = "" }) => {
  const sz =
    size === "xl" ? "w-24 h-24" : size === "lg" ? "w-16 h-16" : "w-10 h-10";
  return (
    <img
      src={src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
      alt="avatar"
      className={cn(sz, "rounded-full object-cover shrink-0", className)}
    />
  );
};

const CROWN_CONFIG = {
  1: {
    src: "/achievements/gold-crown.png",
    alt: "gold crown",
    size: "w-25 h-20",
    shadow: "rgba(234,179,8,0.35)",
  },
  2: {
    src: "/achievements/silver-crown.png",
    alt: "silver crown",
    size: "w-16 h-16",
    shadow: "rgba(148,163,184,0.3)",
  },
  3: {
    src: "/achievements/bronze-crown.png",
    alt: "bronze crown",
    size: "w-12 h-12",
    shadow: "rgba(180,83,9,0.3)",
  },
};

const PodiumCrown = ({ rank }) => {
  const c = CROWN_CONFIG[rank];
  return (
    <img
      src={c.src}
      alt={c.alt}
      className={`${c.size} object-contain`}
      style={{ filter: `drop-shadow(0 2px 8px ${c.shadow})` }}
    />
  );
};

const RankBadge = ({ rank }) => {
  if (rank === 1)
    return (
      <div className="w-7 h-7 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center font-black text-yellow-400 text-xs">
        1
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-7 h-7 rounded-full bg-zinc-500/10 border border-zinc-500/30 flex items-center justify-center font-black text-zinc-300 text-xs">
        2
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-7 h-7 rounded-full bg-amber-700/10 border border-amber-700/30 flex items-center justify-center font-black text-amber-600 text-xs">
        3
      </div>
    );
  return (
    <span className="text-zinc-600 font-bold text-sm w-7 text-center">
      #{rank}
    </span>
  );
};

const RowSkeleton = () => (
  <div className="h-[68px] rounded-xl animate-pulse bg-white/[0.02] border border-white/[0.04]" />
);

// ─── Component ────────────────────────────────────────────────────────────────

const Leaderboard = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("global");
  const [tabData, setTabData] = useState({});
  const [loading, setLoading] = useState(false);

  const activeTabDef = TABS.find((t) => t.id === activeTab);
  const leaderboard = tabData[activeTab] ?? [];

  const fetchTab = useCallback(
    async (tabId) => {
      if (tabData[tabId]) return;
      setLoading(true);
      try {
        const tabDef = TABS.find((t) => t.id === tabId);
        const response = await tabDef.fetchFn();
        if (response.success) {
          setTabData((prev) => ({
            ...prev,
            [tabId]: response.data?.data ?? [],
          }));
        }
      } catch (err) {
        console.error(`Failed to fetch ${tabId} leaderboard`, err);
      } finally {
        setLoading(false);
      }
    },
    [tabData],
  );

  useEffect(() => {
    fetchTab("global");
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    fetchTab(tabId);
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const currentUserRank = currentUser
    ? leaderboard.findIndex(
        (u) => u._id?.toString() === currentUser._id?.toString(),
      ) + 1
    : 0;

  const leagueProgressData = currentUser
    ? getLeagueProgress(currentUser.level ?? 1, currentUser.league ?? "Bronze")
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-space-grotesk">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#0a0a0a]">
        <DottedGlowBackground
          color="rgba(255,255,255,0.15)"
          glowColor="rgba(249,115,22,0.5)"
        />
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 pb-28">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 pt-6">
          {/* Page header */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-600/10 border border-red-500/20 mb-3">
                <Trophy size={9} />
                Hall of Fame
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-none mb-3 text-metallic">
                Rankings
              </h1>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                {activeTabDef.description}
              </p>
            </div>

            {/* Tab strip */}
            <div className="flex flex-wrap gap-1.5 shrink-0 lg:pt-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap border",
                      isActive
                        ? "text-red-400 bg-red-600/10 border-red-500/30"
                        : "text-zinc-500 bg-white/[0.02] border-white/[0.06] hover:text-zinc-200 hover:border-white/10",
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Podium — global tab only ────────────────────────────────────── */}
          {activeTab === "global" && !loading && top3.length > 0 && (
            <div className="flex flex-col md:flex-row items-end justify-center gap-3 mb-8">
              {/* 2nd place */}
              {top3[1] &&
                (() => {
                  const s = getLeagueStyle(top3[1].league ?? "Bronze");
                  const LI = s.icon;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.25 }}
                      className="flex-1 max-w-[220px] bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-2 shadow-lg shadow-black/50"
                    >
                      <div className="flex flex-col items-center gap-1 mb-1">
                        <PodiumCrown rank={2} />
                        <div className="relative mt-1">
                          <Avatar
                            src={top3[1].avatarUrl}
                            seed={top3[1]._id}
                            size="lg"
                            className="ring-2 ring-zinc-600/50"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-700 border border-zinc-500/50 flex items-center justify-center text-[10px] font-black text-white border-2 border-[#111111]">
                            2
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-metallic text-center truncate max-w-full">
                        {top3[1].username || top3[1].name}
                      </span>
                      <div
                        className={cn(
                          "flex items-center gap-1 text-[11px] font-semibold",
                          s.color,
                        )}
                      >
                        <LI className="w-3 h-3" />
                        {top3[1].league ?? "Bronze"}
                      </div>
                      <span className="font-black text-base mt-0.5 text-metallic-orange">
                        {activeTabDef.metricFn(top3[1])}
                      </span>
                    </motion.div>
                  );
                })()}

              {/* 1st place */}
              {top3[0] &&
                (() => {
                  const s = getLeagueStyle(top3[0].league ?? "Bronze");
                  const LI = s.icon;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04, duration: 0.25 }}
                      className="flex-1 max-w-[260px] bg-[#111111] border border-yellow-500/20 rounded-2xl p-8 flex flex-col items-center gap-2 relative shadow-lg shadow-black/50"
                    >
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent rounded-t-2xl" />
                      <div className="flex flex-col items-center gap-1">
                        <PodiumCrown rank={1} />
                        <div className="relative mt-1 mb-1">
                          <Avatar
                            src={top3[0].avatarUrl}
                            seed={top3[0]._id}
                            size="xl"
                            className="ring-2 ring-yellow-500/40"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-black text-black border-2 border-[#111111]">
                            1
                          </div>
                        </div>
                      </div>
                      <span className="font-black text-lg text-metallic text-center truncate max-w-full mt-1">
                        {top3[0].username || top3[0].name}
                      </span>
                      <div
                        className={cn(
                          "flex items-center gap-1.5 text-[11px] font-semibold",
                          s.color,
                        )}
                      >
                        <LI className="w-3.5 h-3.5" />
                        {top3[0].league ?? "Bronze"}
                      </div>
                      <span className="font-black text-xl mt-1 text-metallic-orange">
                        {activeTabDef.metricFn(top3[0])}
                      </span>
                    </motion.div>
                  );
                })()}

              {/* 3rd place */}
              {top3[2] &&
                (() => {
                  const s = getLeagueStyle(top3[2].league ?? "Bronze");
                  const LI = s.icon;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.16, duration: 0.25 }}
                      className="flex-1 max-w-[220px] bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-2 shadow-lg shadow-black/50"
                    >
                      <div className="flex flex-col items-center gap-1 mb-1">
                        <PodiumCrown rank={3} />
                        <div className="relative mt-1">
                          <Avatar
                            src={top3[2].avatarUrl}
                            seed={top3[2]._id}
                            size="lg"
                            className="ring-2 ring-amber-700/40"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 border border-amber-600/50 flex items-center justify-center text-[10px] font-black text-white border-2 border-[#111111]">
                            3
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-metallic text-center truncate max-w-full">
                        {top3[2].username || top3[2].name}
                      </span>
                      <div
                        className={cn(
                          "flex items-center gap-1 text-[11px] font-semibold",
                          s.color,
                        )}
                      >
                        <LI className="w-3 h-3" />
                        {top3[2].league ?? "Bronze"}
                      </div>
                      <span className="font-black text-base mt-0.5 text-metallic-orange">
                        {activeTabDef.metricFn(top3[2])}
                      </span>
                    </motion.div>
                  );
                })()}
            </div>
          )}

          {/* ── Column headers ────────────────────────────────────────────────── */}
          <div
            className="grid items-center gap-3 px-4 mb-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600"
            style={{ gridTemplateColumns: "2rem 1fr 9rem 6.5rem 1.5rem" }}
          >
            <div>Rank</div>
            <div>Player</div>
            <div>League</div>
            <div className="text-right">{activeTabDef.colLabel}</div>
            <div />
          </div>

          {/* ── List ─────────────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            {loading ? (
              [...Array(7)].map((_, i) => <RowSkeleton key={i} />)
            ) : leaderboard.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 flex flex-col items-center gap-4"
              >
                <Trophy className="w-10 h-10 text-zinc-800" />
                <p className="text-zinc-600 font-semibold text-sm">
                  No rankings yet — be the first to earn a spot!
                </p>
              </motion.div>
            ) : (
              (activeTab === "global" ? rest : leaderboard).map(
                (entry, idx) => {
                  const rank = activeTab === "global" ? idx + 4 : idx + 1;
                  const ls = getLeagueStyle(entry.league ?? "Bronze");
                  const LI = ls.icon;
                  const isMe =
                    currentUser &&
                    entry._id?.toString() === currentUser._id?.toString();

                  return (
                    <motion.div
                      key={entry._id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.025, duration: 0.2 }}
                      className={cn(
                        "grid items-center gap-3 px-4 h-[68px] rounded-xl transition-all group border",
                        isMe
                          ? "bg-red-600/[0.05] border-red-500/20"
                          : "bg-white/[0.02] border-transparent hover:border-white/[0.07]",
                      )}
                      style={{
                        gridTemplateColumns: "2rem 1fr 9rem 6.5rem 1.5rem",
                      }}
                    >
                      {/* Rank */}
                      <RankBadge rank={rank} />

                      {/* Player */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={entry.avatarUrl} seed={entry._id} />
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "font-bold text-sm truncate",
                              isMe ? "text-red-400" : "text-white",
                            )}
                          >
                            {entry.username || entry.name}
                          </p>
                          {isMe && (
                            <span className="text-[9px] font-black tracking-widest text-red-500/70 uppercase">
                              You
                            </span>
                          )}
                        </div>
                      </div>

                      {/* League */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            ls.bar,
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-semibold truncate",
                            ls.color,
                          )}
                        >
                          {entry.league ?? "Bronze"}
                        </span>
                        <span className="text-[10px] text-zinc-600 font-bold px-1.5 py-0.5 rounded bg-white/[0.04] shrink-0">
                          Lv{entry.level ?? 1}
                        </span>
                      </div>

                      {/* Metric */}
                      <div className="text-right font-black text-sm tabular-nums text-metallic-orange">
                        {activeTabDef.metricFn(entry)}
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  );
                },
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky bottom bar ─────────────────────────────────────────────────── */}
      {currentUser && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 px-4 sm:px-8 flex items-center justify-between bg-[#0a0a0a]/95 border-t border-white/[0.06] backdrop-blur-xl"
          style={{ height: "68px" }}
        >
          {/* Left: user identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center font-black text-sm text-red-400 shrink-0">
              {currentUserRank || "—"}
            </div>
            <Avatar
              src={currentUser?.avatarUrl || currentUser?.imageUrl}
              seed={currentUser?._id}
              className="ring-2 ring-red-500/30"
            />
            <div>
              <div className="text-[9px] font-black tracking-widest text-red-500/70 uppercase">
                Global Rank #{currentUserRank || "—"}
              </div>
              <div className="font-bold text-[13px] text-white">
                {currentUser.username || currentUser.name}
              </div>
            </div>
          </div>

          {/* Right: league + progress */}
          <div className="hidden sm:flex items-center gap-8">
            {/* League badge */}
            {(() => {
              const s = getLeagueStyle(currentUser.league ?? "Bronze");
              const LI = s.icon;
              return (
                <div>
                  <div className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-0.5">
                    Your League
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1.5 font-black text-sm",
                      s.color,
                    )}
                  >
                    <LI className="w-4 h-4" />
                    {currentUser.league ?? "Bronze"}
                  </div>
                </div>
              );
            })()}

            {/* Progress toward next league */}
            {leagueProgressData?.nextLeague && (
              <div className="w-48 hidden md:block">
                <div className="flex justify-between text-[10px] font-bold text-zinc-600 mb-1.5">
                  <span>{currentUser.league ?? "Bronze"}</span>
                  <span>
                    {leagueProgressData.nextLeague} in{" "}
                    {leagueProgressData.levelsNeeded} lvl
                    {leagueProgressData.levelsNeeded !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-white/[0.06]">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-700"
                    style={{ width: `${leagueProgressData.progress}%` }}
                  />
                </div>
                <div className="text-right text-[9px] text-zinc-700 mt-1 font-medium">
                  Level {currentUser.level ?? 1} →{" "}
                  {
                    LEAGUE_LEVELS.find(
                      (l) => l.name === leagueProgressData.nextLeague,
                    )?.minLevel
                  }{" "}
                  for {leagueProgressData.nextLeague}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
