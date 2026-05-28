import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getGlobalLeaderboard,
  getPlaygroundLeaderboard,
  getCompetitionLeaderboard,
  getLearnerLeaderboard,
  getWeeklyLeaderboard,
} from "../../../features/leaderboard/leaderboardApi";
import {
  Trophy,
  Medal,
  Crown,
  Shield,
  Code2,
  BookOpen,
  Swords,
  CalendarDays,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Inline gradient text styles (metallic classes are playground-sidebar-scoped) ──
const METALLIC = {
  background: "linear-gradient(135deg, #d4d4d4 0%, #ffffff 28%, #a8a8a8 52%, #f5f5f5 76%, #c8c8c8 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};
const METALLIC_ORANGE = {
  background: "linear-gradient(135deg, #fb923c 0%, #fcd34d 28%, #c2410c 52%, #fbbf24 76%, #f97316 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

// ─── League config (mirrors server/utils/progression.js LEAGUES) ──────────────

const LEAGUE_LEVELS = [
  { name: "Bronze",      minLevel: 1   },
  { name: "Silver",      minLevel: 5   },
  { name: "Gold",        minLevel: 10  },
  { name: "Platinum",    minLevel: 25  },
  { name: "Diamond",     minLevel: 50  },
  { name: "Master",      minLevel: 75  },
  { name: "Grandmaster", minLevel: 100 },
];

const LEAGUE_STYLE = {
  Grandmaster: { color: "text-red-400",     bar: "bg-red-400",     icon: Crown  },
  Master:      { color: "text-purple-400",  bar: "bg-purple-400",  icon: Crown  },
  Diamond:     { color: "text-cyan-400",    bar: "bg-cyan-400",    icon: Shield },
  Platinum:    { color: "text-emerald-400", bar: "bg-emerald-400", icon: Shield },
  Gold:        { color: "text-yellow-400",  bar: "bg-yellow-400",  icon: Trophy },
  Silver:      { color: "text-zinc-300",    bar: "bg-zinc-300",    icon: Medal  },
  Bronze:      { color: "text-orange-400",  bar: "bg-orange-400",  icon: Medal  },
};

const getLeagueStyle = (league) => LEAGUE_STYLE[league] ?? LEAGUE_STYLE.Bronze;

const getLeagueProgress = (level, league) => {
  const idx = LEAGUE_LEVELS.findIndex((l) => l.name === league);
  if (idx === -1 || idx === LEAGUE_LEVELS.length - 1)
    return { nextLeague: null, levelsNeeded: 0, progress: 100 };
  const curr = LEAGUE_LEVELS[idx];
  const next = LEAGUE_LEVELS[idx + 1];
  const progress = ((level - curr.minLevel) / (next.minLevel - curr.minLevel)) * 100;
  return {
    nextLeague: next.name,
    levelsNeeded: Math.max(0, next.minLevel - level),
    progress: Math.min(100, Math.max(0, progress)),
  };
};

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
    description: "Top coders ranked by total problems solved across all languages.",
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
    description: "This week's competition XP — resets every Monday at midnight.",
    colLabel: "WEEKLY XP",
    fetchFn: getWeeklyLeaderboard,
    metricFn: (e) => `${e.weeklyXP ?? 0} XP`,
  },
];

// ─── Small reusable pieces ─────────────────────────────────────────────────────

const Avatar = ({ src, seed, size = "md", className = "" }) => {
  const sz =
    size === "xl" ? "w-24 h-24" :
    size === "lg" ? "w-16 h-16" :
    "w-10 h-10";
  return (
    <img
      src={src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
      alt="avatar"
      className={cn(sz, "rounded-full object-cover shrink-0", className)}
    />
  );
};

const RankBadge = ({ rank }) => {
  if (rank === 1)
    return (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-black text-black text-xs shadow-[0_0_10px_rgba(234,179,8,0.5)]">
        1
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-500 flex items-center justify-center font-black text-black text-xs">
        2
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-700 flex items-center justify-center font-black text-black text-xs">
        3
      </div>
    );
  return (
    <span className="text-zinc-600 font-bold text-sm w-7 text-center">#{rank}</span>
  );
};

const RowSkeleton = () => (
  <div
    className="h-[68px] rounded-xl animate-pulse"
    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
  />
);

// ─── Component ────────────────────────────────────────────────────────────────

const Leaderboard = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();

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
          // ApiResponse wraps data as { data: { data: [...] } } — unwrap both layers
          setTabData((prev) => ({ ...prev, [tabId]: response.data?.data ?? [] }));
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
    <div className="flex flex-col min-h-screen bg-[#030305] text-white font-inter overflow-hidden">

      {/* Ambient glow blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-600/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[400px] bg-purple-900/8 rounded-full blur-[160px]" />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header
        className="relative z-20 h-[60px] shrink-0 flex items-center justify-between px-6"
        style={{
          background: "rgba(3,3,5,0.85)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Left: logo + nav */}
        <div className="flex items-center gap-10 h-full">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-black text-white tracking-widest">EQ</span>
            </div>
            <span className="text-sm font-black tracking-wide hidden sm:block">
              <span style={METALLIC}>Edu</span>
              <span style={METALLIC_ORANGE}>Quest</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 h-full">
            {[
              { label: "Dashboard",   path: "/"           },
              { label: "Challenges",  path: "/playground" },
              { label: "Leaderboard", path: "/leaderboard"},
              { label: "Profile",     path: "/profile"    },
            ].map(({ label, path }) => {
              const isActive = label === "Leaderboard";
              return (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className={cn(
                    "h-full px-1 text-[13px] font-semibold transition-colors relative flex items-center",
                    isActive
                      ? "text-orange-400"
                      : "text-zinc-500 hover:text-zinc-200",
                  )}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: avatar */}
        <button
          onClick={() => navigate("/profile")}
          className="w-8 h-8 rounded-full overflow-hidden border border-zinc-800 hover:border-orange-500/40 transition-colors flex items-center justify-center bg-zinc-900"
        >
          {currentUser?.avatarUrl || currentUser?.imageUrl ? (
            <img
              src={currentUser.avatarUrl || currentUser.imageUrl}
              alt="me"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="w-full h-full bg-orange-900/40 text-orange-400 font-bold text-xs flex items-center justify-center">
              {currentUser?.name?.charAt(0) || "U"}
            </span>
          )}
        </button>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-y-auto thin-scroll pb-28">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 pt-10">

          {/* Page header */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-10">
            <div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-4"
                style={{
                  background: "rgba(234,88,12,0.08)",
                  border: "1px solid rgba(234,88,12,0.2)",
                }}
              >
                <Trophy size={9} />
                Hall of Fame
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-none mb-3" style={METALLIC}>
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
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap",
                      isActive
                        ? "text-orange-400 border border-orange-500/30"
                        : "text-zinc-500 border border-white/5 hover:text-zinc-200 hover:border-white/10",
                    )}
                    style={
                      isActive
                        ? { background: "rgba(234,88,12,0.1)" }
                        : { background: "rgba(255,255,255,0.02)" }
                    }
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
            <div className="flex flex-col md:flex-row items-end justify-center gap-3 mb-12">

              {/* 2nd place */}
              {top3[1] && (() => {
                const s = getLeagueStyle(top3[1].league ?? "Bronze");
                const LI = s.icon;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.25 }}
                    className="flex-1 max-w-[220px] rounded-2xl p-6 flex flex-col items-center gap-2 transition-transform"
                    style={{ background: "#080808", border: "1px solid #1a1a1a" }}
                  >
                    <div className="relative mb-1">
                      <Avatar src={top3[1].avatarUrl} seed={top3[1]._id} size="lg" className="ring-2 ring-zinc-700" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500 flex items-center justify-center text-[10px] font-black text-black border-2 border-[#080808]">
                        2
                      </div>
                    </div>
                    <span className="font-bold text-sm text-white text-center truncate max-w-full">
                      {top3[1].username || top3[1].name}
                    </span>
                    <div className={cn("flex items-center gap-1 text-[11px] font-semibold", s.color)}>
                      <LI className="w-3 h-3" />
                      {top3[1].league ?? "Bronze"}
                    </div>
                    <span className="font-black text-base mt-0.5" style={METALLIC_ORANGE}>
                      {activeTabDef.metricFn(top3[1])}
                    </span>
                  </motion.div>
                );
              })()}

              {/* 1st place */}
              {top3[0] && (() => {
                const s = getLeagueStyle(top3[0].league ?? "Bronze");
                const LI = s.icon;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04, duration: 0.25 }}
                    className="flex-1 max-w-[260px] rounded-2xl p-8 flex flex-col items-center gap-2 relative transition-transform"
                    style={{
                      background: "linear-gradient(160deg, #0f0a04 0%, #080604 100%)",
                      border: "1px solid rgba(234,88,12,0.25)",
                      boxShadow: "0 0 60px -10px rgba(249,115,22,0.2)",
                    }}
                  >
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent rounded-t-2xl" />
                    <div className="absolute -top-5">
                      <Crown className="w-10 h-10 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="relative mt-5 mb-1">
                      <Avatar
                        src={top3[0].avatarUrl}
                        seed={top3[0]._id}
                        size="xl"
                        className="ring-2 ring-orange-500/50 shadow-[0_0_24px_rgba(249,115,22,0.35)]"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-xs font-black text-black border-2 border-[#0f0a04] shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                        1
                      </div>
                    </div>
                    <span className="font-black text-lg text-white text-center truncate max-w-full mt-1">
                      {top3[0].username || top3[0].name}
                    </span>
                    <div className={cn("flex items-center gap-1.5 text-[11px] font-semibold", s.color)}>
                      <LI className="w-3.5 h-3.5" />
                      {top3[0].league ?? "Bronze"}
                    </div>
                    <span className="font-black text-xl mt-1" style={METALLIC_ORANGE}>
                      {activeTabDef.metricFn(top3[0])}
                    </span>
                  </motion.div>
                );
              })()}

              {/* 3rd place */}
              {top3[2] && (() => {
                const s = getLeagueStyle(top3[2].league ?? "Bronze");
                const LI = s.icon;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16, duration: 0.25 }}
                    className="flex-1 max-w-[220px] rounded-2xl p-6 flex flex-col items-center gap-2 transition-transform"
                    style={{ background: "#080808", border: "1px solid #1a1a1a" }}
                  >
                    <div className="relative mb-1">
                      <Avatar src={top3[2].avatarUrl} seed={top3[2]._id} size="lg" className="ring-2 ring-amber-800/50" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-amber-700 flex items-center justify-center text-[10px] font-black text-black border-2 border-[#080808]">
                        3
                      </div>
                    </div>
                    <span className="font-bold text-sm text-white text-center truncate max-w-full">
                      {top3[2].username || top3[2].name}
                    </span>
                    <div className={cn("flex items-center gap-1 text-[11px] font-semibold", s.color)}>
                      <LI className="w-3 h-3" />
                      {top3[2].league ?? "Bronze"}
                    </div>
                    <span className="font-black text-base mt-0.5" style={METALLIC_ORANGE}>
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
              (activeTab === "global" ? rest : leaderboard).map((entry, idx) => {
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
                    className="grid items-center gap-3 px-4 h-[68px] rounded-xl transition-all group"
                    style={{
                      gridTemplateColumns: "2rem 1fr 9rem 6.5rem 1.5rem",
                      background: isMe
                        ? "rgba(234,88,12,0.06)"
                        : "rgba(255,255,255,0.02)",
                      border: isMe
                        ? "1px solid rgba(234,88,12,0.22)"
                        : "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isMe)
                        e.currentTarget.style.border =
                          "1px solid rgba(255,255,255,0.07)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isMe)
                        e.currentTarget.style.border = "1px solid transparent";
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
                            isMe ? "text-orange-400" : "text-white",
                          )}
                        >
                          {entry.username || entry.name}
                        </p>
                        {isMe && (
                          <span className="text-[9px] font-black tracking-widest text-orange-500 uppercase">
                            You
                          </span>
                        )}
                      </div>
                    </div>

                    {/* League */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", ls.bar)} />
                      <span className={cn("text-xs font-semibold truncate", ls.color)}>
                        {entry.league ?? "Bronze"}
                      </span>
                      <span
                        className="text-[10px] text-zinc-600 font-bold px-1.5 py-0.5 rounded shrink-0"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      >
                        Lv{entry.level ?? 1}
                      </span>
                    </div>

                    {/* Metric */}
                    <div className="text-right font-black text-sm tabular-nums" style={METALLIC_ORANGE}>
                      {activeTabDef.metricFn(entry)}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky bottom bar ─────────────────────────────────────────────────── */}
      {currentUser && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 px-4 sm:px-8 flex items-center justify-between"
          style={{
            height: "68px",
            background: "rgba(3,3,5,0.96)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Left: user identity */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-orange-400 shrink-0"
              style={{
                background: "rgba(234,88,12,0.1)",
                border: "1px solid rgba(234,88,12,0.2)",
              }}
            >
              {currentUserRank || "—"}
            </div>
            <Avatar
              src={currentUser?.avatarUrl || currentUser?.imageUrl}
              seed={currentUser?._id}
              className="ring-2 ring-orange-500/40"
            />
            <div>
              <div className="text-[9px] font-black tracking-widest text-orange-500 uppercase">
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
                  <div className={cn("flex items-center gap-1.5 font-black text-sm", s.color)}>
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
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-700"
                    style={{ width: `${leagueProgressData.progress}%` }}
                  />
                </div>
                <div className="text-right text-[9px] text-zinc-700 mt-1 font-medium">
                  Level {currentUser.level ?? 1} →{" "}
                  {LEAGUE_LEVELS.find(
                    (l) => l.name === leagueProgressData.nextLeague,
                  )?.minLevel}{" "}
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
