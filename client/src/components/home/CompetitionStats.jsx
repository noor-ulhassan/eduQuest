import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Label,
} from "recharts";
import { Trophy, Swords, Target, Zap, Star } from "lucide-react";
import api from "../../features/auth/authApi";

const CompetitionStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/competition/stats");
        if (response.data.success) {
          setStats(response.data.stats);
        }
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

  // ── Chart data ──
  const pieData = [
    { name: "wins", value: stats.wins, fill: "var(--color-wins)" },
    { name: "losses", value: stats.losses, fill: "var(--color-losses)" },
    ...(stats.dnf > 0
      ? [{ name: "dnf", value: stats.dnf, fill: "var(--color-dnf)" }]
      : []),
  ].filter((d) => d.value > 0);

  const pieConfig = {
    wins: { label: "Wins", color: "#f97316" },
    losses: { label: "Losses", color: "#94a3b8" },
    dnf: { label: "DNF", color: "#ef4444" },
  };

  const areaConfig = {
    score: { label: "Score", color: "#f97316" },
  };

  const barConfig = {};
  const BAR_COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"];
  (stats.modeDistribution || []).forEach((m, i) => {
    barConfig[m.name] = {
      label: m.name,
      color: BAR_COLORS[i % BAR_COLORS.length],
    };
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold font-hand flex items-center gap-2">
        <Trophy className="text-orange-500 w-5 h-5" />
        Competition{" "}
        <span className="text-blue-500 dark:text-blue-400">Performance</span>
      </h2>

      {/* ── Summary Row ── */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          title="Matches"
          value={stats.totalGames}
          icon={<Swords size={16} />}
        />
        <StatCard
          title="Wins"
          value={stats.wins}
          icon={<Trophy size={16} className="text-yellow-500" />}
          sub={`${stats.winRate}%`}
        />
        <StatCard
          title="Streak"
          value={stats.currentStreak}
          icon={<Zap size={16} className="text-orange-500" />}
        />
        <StatCard
          title="Best"
          value={stats.bestScore}
          icon={<Star size={16} className="text-blue-500" />}
          sub={`Avg ${stats.avgScore}`}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Outcomes Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Match Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={pieConfig}
              className="mx-auto aspect-square max-h-[200px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {stats.totalGames}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 18}
                              className="fill-muted-foreground text-xs"
                            >
                              Games
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex justify-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> Wins
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> Losses
              </span>
              {stats.dnf > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> DNF
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity?.length > 0 ? (
              <ChartContainer config={areaConfig} className="max-h-[220px]">
                <AreaChart
                  data={stats.recentActivity}
                  margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                >
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--color-score)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--color-score)"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex items-center justify-between gap-4 w-full">
                            <span className="text-muted-foreground">
                              {areaConfig[name]?.label || name}
                            </span>
                            <span className="font-mono font-bold tabular-nums">
                              {value} pts
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Area
                    dataKey="score"
                    type="monotone"
                    stroke="var(--color-score)"
                    strokeWidth={2}
                    fill="url(#scoreGrad)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Play more matches to see trends
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Mode Distribution ── */}
      {stats.modeDistribution?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Favorite Modes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="max-h-[180px]">
              <BarChart
                data={stats.modeDistribution}
                layout="vertical"
                margin={{ left: 10, right: 10 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={90}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <div className="flex items-center justify-between gap-4 w-full">
                          <span className="text-muted-foreground">Games</span>
                          <span className="font-mono font-bold tabular-nums">
                            {value}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                  {stats.modeDistribution.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/* ── Sub-components ── */
const StatCard = ({ title, value, icon, sub }) => (
  <Card className="transition-shadow hover:shadow-sm">
    <CardContent className="p-3 flex flex-col items-center text-center gap-0.5">
      <div className="p-1.5 bg-muted rounded-full mb-1">{icon}</div>
      <span className="text-xl font-bold leading-none">{value}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
        {title}
      </span>
      {sub && (
        <span className="text-[10px] text-emerald-600 dark:text-green-400 font-medium">
          {sub}
        </span>
      )}
    </CardContent>
  </Card>
);

const StatsSkeleton = () => (
  <div className="space-y-4">
    <div className="h-6 w-40 bg-muted rounded animate-pulse" />
    <div className="grid grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="h-52 bg-muted rounded-xl animate-pulse" />
      <div className="h-52 bg-muted rounded-xl animate-pulse" />
    </div>
  </div>
);

const EmptyStats = () => (
  <div className="border border-dashed border-border rounded-2xl p-10 text-center space-y-3">
    <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto">
      <Target size={28} className="text-muted-foreground" />
    </div>
    <h3 className="text-base font-bold">No Competition Data</h3>
    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
      Participate in multiplayer competitions to unlock your performance
      analytics!
    </p>
  </div>
);

export default CompetitionStats;
