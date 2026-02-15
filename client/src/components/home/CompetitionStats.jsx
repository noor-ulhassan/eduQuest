import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { Trophy, Swords, AlertCircle, Target, Zap, Clock } from "lucide-react";
import api from "../../features/auth/authApi";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const CompetitionStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/competition/stats");
        if (response.data.success) {
          setStats(
            response.data.stats || {
              totalGames: 0,
              wins: 0,
              losses: 0,
              dnf: 0,
              winRate: 0,
              recentActivity: [],
              modeDistribution: [],
            },
          );
        }
      } catch (error) {
        console.error("Error fetching competition stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <StatsSkeleton />;
  }

  if (!stats || stats.totalGames === 0) {
    return <EmptyStats />;
  }

  const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-hand flex items-center gap-2">
        <Trophy className="text-orange-500" />
        Competition <span className="text-blue-400">Performance</span>
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Matches"
          value={stats.totalGames}
          icon={<Swords size={20} className="text-zinc-400" />}
        />
        <StatCard
          title="Wins"
          value={stats.wins}
          icon={<Trophy size={20} className="text-yellow-500" />}
          subtext={`${((stats.wins / stats.totalGames) * 100).toFixed(0)}% Win Rate`}
        />
        <StatCard
          title="Win Streak"
          value={stats.currentStreak || 0}
          icon={<Zap size={20} className="text-orange-500" />}
        />
        <StatCard
          title="Time per Match"
          value="~8m" // Placeholder or calc
          icon={<Clock size={20} className="text-blue-500" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Win/Loss/DNF Distribution */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-200">
              Match Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Wins", value: stats.wins },
                    { name: "Losses", value: stats.losses - stats.dnf }, // Losses excluding DNF
                    { name: "DNF", value: stats.dnf },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell key="win" fill="#f97316" /> {/* Orange for Win */}
                  <Cell key="loss" fill="#3f3f46" /> {/* Zinc for Loss */}
                  <Cell key="dnf" fill="#ef4444" /> {/* Red for DNF */}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                  }}
                  itemStyle={{ color: "#e4e4e7" }}
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-zinc-400 font-bold text-xl"
                >
                  {stats.totalGames}
                </text>
                <text
                  x="50%"
                  y="60%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-zinc-600 text-xs uppercase"
                >
                  Total
                </text>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs text-zinc-500 mt-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>{" "}
                Wins
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-zinc-700"></span>{" "}
                Losses
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> DNF
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Trend (Score) */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-200">
              Recent Performance (XP)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.recentActivity}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#52525b"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#52525b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                  }}
                  itemStyle={{ color: "#f97316" }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#f97316"
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Mode Distribution */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-200">
            Favorite Modes
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.modeDistribution}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                stroke="#a1a1aa"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "#27272a" }}
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                }}
              />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
                barSize={20}
              >
                {stats.modeDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// Sub-components
const StatCard = ({ title, value, icon, subtext }) => (
  <Card className="bg-zinc-900/50 border-zinc-800">
    <CardContent className="p-6 flex flex-col items-center text-center">
      <div className="mb-2 p-2 bg-zinc-800/50 rounded-full">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">
        {title}
      </div>
      {subtext && <div className="text-xs text-green-400">{subtext}</div>}
    </CardContent>
  </Card>
);

const StatsSkeleton = () => (
  <div className="space-y-6">
    <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
    <div className="grid grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-zinc-900 rounded-xl animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-2 gap-6">
      <div className="h-64 bg-zinc-900 rounded-xl animate-pulse" />
      <div className="h-64 bg-zinc-900 rounded-xl animate-pulse" />
    </div>
  </div>
);

const EmptyStats = () => (
  <div className="border border-dashed border-zinc-800 rounded-2xl p-12 text-center space-y-4">
    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto">
      <Target size={32} className="text-zinc-600" />
    </div>
    <div>
      <h3 className="text-lg font-bold text-white">No Competition Data</h3>
      <p className="text-zinc-500 text-sm max-w-sm mx-auto">
        Participate in multiplayer competitions to unlock your performance
        analytics and visualize your progress!
      </p>
    </div>
  </div>
);

export default CompetitionStats;
