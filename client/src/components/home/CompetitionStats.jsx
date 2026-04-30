import React, { useEffect, useRef, useState } from "react";
import { motion, animate } from "motion/react";
import { PieChart, LineChart, BarChart } from "@mui/x-charts";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Trophy, Swords, Target, Flame, Star, Shield } from "lucide-react";
import { ShineBorder } from "@/components/ui/shine-border";
import api from "../../features/auth/authApi";

const BAR_COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"];

const getGamerRank = (wins) => {
  if (wins >= 50)
    return {
      name: "Grand Champion",
      gradient: "from-purple-400 to-pink-600",
      text: "text-purple-400",
      border: "border-purple-500/50",
      shine: ["#a855f7", "#ec4899"],
    };
  if (wins >= 25)
    return {
      name: "Diamond",
      gradient: "from-cyan-300 to-blue-600",
      text: "text-cyan-400",
      border: "border-cyan-500/50",
      shine: ["#22d3ee", "#3b82f6"],
    };
  if (wins >= 10)
    return {
      name: "Gold",
      gradient: "from-yellow-300 to-yellow-600",
      text: "text-yellow-400",
      border: "border-yellow-500/50",
      shine: ["#fde047", "#d97706"],
    };
  if (wins >= 3)
    return {
      name: "Silver",
      gradient: "from-slate-300 to-slate-500",
      text: "text-slate-300",
      border: "border-slate-400/50",
      shine: ["#cbd5e1", "#64748b"],
    };
  return {
    name: "Bronze",
    gradient: "from-orange-400 to-amber-700",
    text: "text-orange-500",
    border: "border-orange-700/50",
    shine: ["#f97316", "#92400e"],
  };
};

function AnimatedCount({ value }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate(v) {
        node.textContent = Math.round(v);
      },
    });
    return () => controls.stop();
  }, [value]);
  return <span ref={ref}>0</span>;
}

const AXIS_STYLE = { fill: "#71717a", fontSize: 11, fontFamily: "inherit" };
const GRID_COLOR = "rgba(128,128,128,0.07)";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const CompetitionStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/competition/stats");
        if (response.data.success) setStats(response.data.stats);
      } catch (error) {
        console.error("Error fetching competition stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <StatsSkeleton />;
  if (!stats || stats.totalGames === 0) return <EmptyStats />;

  const rank = getGamerRank(stats.wins);

  const pieData = [
    { id: 0, value: stats.wins, label: "Wins", color: "#f97316" },
    { id: 1, value: stats.losses, label: "Losses", color: "#3f3f46" },
    ...(stats.dnf > 0
      ? [{ id: 2, value: stats.dnf, label: "DNF", color: "#ef4444" }]
      : []),
  ].filter((d) => d.value > 0);

  const hasActivity = (stats.recentActivity?.length ?? 0) > 0;
  const lineX = (stats.recentActivity ?? []).map((d) => d.date);
  const lineY = (stats.recentActivity ?? []).map((d) => d.score);

  const hasModes = (stats.modeDistribution?.length ?? 0) > 0;
  const maxModeVal = hasModes
    ? Math.max(...stats.modeDistribution.map((m) => m.value))
    : 1;

  const statCards = [
    {
      title: "Matches",
      value: stats.totalGames,

      iconBg: "bg-blue-500/15 text-blue-400",
      numberClass: "text-metallic",
    },
    {
      title: "Wins",
      value: stats.wins,

      iconBg: "bg-yellow-500/15 text-yellow-400",
      numberClass: "text-metallic-orange",
      tag: `${stats.winRate}% WR`,
    },
    {
      title: "Streak",
      value: stats.currentStreak,

      iconBg: "bg-orange-500/15 text-orange-400",
      numberClass: "text-metallic-orange",
    },
    {
      title: "Best Score",
      value: stats.bestScore,

      iconBg: "bg-purple-500/15 text-purple-400",
      numberClass: "text-metallic",
      tag: `avg ${stats.avgScore}`,
    },
  ];

  return (
    <ThemeProvider theme={darkTheme}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-4"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-Inter flex items-center gap-2">
            <img
              src="/trophy.gif"
              alt=""
              width={40}
              height={40}
              className="rounded-full"
            />

            <span className="text-metallic">Competition</span>
            <span className="text-metallic">Stats</span>
          </h2>

          <div
            className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-full border ${rank.border} bg-[#111] overflow-hidden`}
          >
            <ShineBorder
              shineColor={rank.shine}
              borderWidth={1.5}
              duration={8}
            />
            {/* */} <Shield size={13} className={rank.text} />
            <span
              className={`text-xs font-black italic tracking-widest uppercase bg-gradient-to-r ${rank.gradient} bg-clip-text text-transparent`}
            >
              {rank.name}
            </span>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35, ease: "easeOut" }}
              className="rounded-xl border border-white/10 bg-[#111] p-4 flex flex-col gap-2.5 hover:border-orange-500/30 transition-colors cursor-default"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.iconBg}`}
                >
                  {card.icon}
                </div>
                {card.tag && (
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full leading-none">
                    {card.tag}
                  </span>
                )}
              </div>
              <div>
                <p
                  className={`text-2xl font-black leading-none ${card.numberClass}`}
                >
                  <AnimatedCount value={card.value} />
                </p>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-widest mt-0.5">
                  {card.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Donut — Match Outcomes */}
          <div className="rounded-xl border border-white/10 bg-[#111] p-4">
            <p className="text-[11px] font-bold text-metallic uppercase tracking-wider mb-4">
              Match Outcomes
            </p>
            <div className="flex items-center gap-5">
              <div
                className="relative flex-shrink-0"
                style={{ width: 160, height: 160 }}
              >
                <PieChart
                  series={[
                    {
                      data: pieData,
                      innerRadius: 44,
                      outerRadius: 72,
                      paddingAngle: 4,
                      cornerRadius: 5,
                      cx: 80,
                      cy: 80,
                    },
                  ]}
                  width={160}
                  height={160}
                  slots={{ legend: () => null }}
                  margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-metallic-orange leading-none">
                    {stats.totalGames}
                  </span>
                  <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-medium">
                    games
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 flex-1 min-w-0">
                {pieData.map((d) => (
                  <div key={d.id} className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="text-xs text-zinc-400 flex-1 truncate">
                      {d.label}
                    </span>
                    <span className="text-xs font-bold tabular-nums text-metallic">
                      {d.value}
                    </span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-2 mt-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Win Rate</span>
                    <span className="font-bold text-metallic-orange">
                      {stats.winRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Line — Recent Performance */}
          <div className="rounded-xl border border-white/10 bg-[#111] p-4">
            <p className="text-[11px] font-bold text-metallic uppercase tracking-wider mb-1">
              Recent Performance
            </p>
            {hasActivity ? (
              <LineChart
                xAxis={[
                  {
                    data: lineX,
                    scaleType: "band",
                    tickLabelStyle: AXIS_STYLE,
                  },
                ]}
                yAxis={[{ tickLabelStyle: AXIS_STYLE }]}
                series={[
                  {
                    data: lineY,
                    area: true,
                    color: "#f97316",
                    showMark: false,
                  },
                ]}
                height={185}
                slots={{ legend: () => null }}
                sx={{
                  "& .MuiAreaElement-root": { opacity: 0.2 },
                  "& .MuiLineElement-root": { strokeWidth: 2.5 },
                  "& .MuiChartsGrid-line": { stroke: GRID_COLOR },
                  "& .MuiChartsAxis-line": { display: "none" },
                  "& .MuiChartsAxis-tick": { display: "none" },
                }}
              />
            ) : (
              <div className="h-[185px] flex items-center justify-center text-zinc-400 text-sm">
                Play more matches to see your trend
              </div>
            )}
          </div>
        </div>

        {/* ── Mode Distribution — Bar Chart ── */}
        {hasModes && (
          <div className="rounded-xl border border-white/10 bg-[#111] p-4">
            <p className="text-[11px] font-bold text-metallic uppercase tracking-wider mb-4">
              Favorite Modes
            </p>
            <BarChart
              dataset={stats.modeDistribution}
              yAxis={[
                {
                  scaleType: "band",
                  dataKey: "name",
                  tickLabelStyle: AXIS_STYLE,
                },
              ]}
              xAxis={[{ tickLabelStyle: AXIS_STYLE }]}
              series={[{ dataKey: "value", color: "#10b981" }]}
              layout="horizontal"
              height={200}
              margin={{ left: 80, right: 20, top: 0, bottom: 20 }}
              slots={{ legend: () => null }}
              sx={{
                "& .MuiChartsGrid-line": { stroke: GRID_COLOR },
                "& .MuiChartsAxis-line": { display: "none" },
                "& .MuiChartsAxis-tick": { display: "none" },
              }}
            />
          </div>
        )}
      </motion.div>
    </ThemeProvider>
  );
};

/* ── Sub-components ── */

const StatsSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-7 w-44 bg-muted rounded-lg animate-pulse" />
      <div className="h-7 w-28 bg-muted rounded-full animate-pulse" />
    </div>
    <div className="grid grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="h-56 bg-muted rounded-xl animate-pulse" />
      <div className="h-56 bg-muted rounded-xl animate-pulse" />
    </div>
    <div className="h-32 bg-muted rounded-xl animate-pulse" />
  </div>
);

const EmptyStats = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="border border-dashed border-white/10 rounded-2xl p-10 text-center space-y-4 bg-[#111]"
  >
    <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto border border-orange-500/20">
      <Target size={26} className="text-orange-500" />
    </div>
    <h3 className="text-base font-black text-metallic-orange">
      Ready to Compete?
    </h3>
    <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
      Jump into multiplayer competitions — your stats will appear here.
    </p>
  </motion.div>
);

export default CompetitionStats;
