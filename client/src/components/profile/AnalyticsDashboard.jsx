import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Trophy, Code, Target, Flame, Activity, Star } from "lucide-react";
import api from "@/features/auth/authApi";

// Aceternity UI
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

// Shadcn UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const COLORS = [
  "#4f46e5",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#8b5cf6",
];

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/user/analytics");
        if (response.data.success) {
          setData(response.data.analytics);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center animate-pulse bg-white border border-zinc-200 rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-zinc-500 font-medium">
            Loading platform analytics...
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { global, playground, competitions } = data;

  // Next level calc
  const nextLevel = global.level + 1;
  const xpCurrent = global.totalXP % 1000;
  const xpNeeded = 1000 - xpCurrent;
  const progressPercent = (xpCurrent / 1000) * 100;

  return (
    <div className="space-y-8">
      {/* 1. Global Progression Header - Aceternity Background Beams */}
      <BackgroundBeamsWithCollision className="h-[22rem] md:h-[20rem] rounded-2xl">
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex items-center justify-center gap-6">
            <div className="w-24 h-24 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center backdrop-blur-md shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform">
              <Trophy
                className="w-12 h-12 text-yellow-500 drop-shadow-lg"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className="text-zinc-400 dark:text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-1">
                Global League Rank
              </p>
              <h2 className="text-4xl font-black tracking-tight flex items-baseline gap-3 text-black dark:text-white drop-shadow-sm">
                {global.rank}
                <span className="text-sm font-bold text-zinc-100 bg-indigo-500/80 px-3 py-1 rounded-full shadow-inner tracking-wide uppercase">
                  Level {global.level}
                </span>
              </h2>
            </div>
          </div>

          <Card className="w-full md:w-1/3 bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center text-sm font-bold mb-3">
                <span className="text-yellow-500 flex items-center gap-2 text-lg">
                  <Star className="w-5 h-5 fill-yellow-500" /> {global.totalXP}{" "}
                  XP
                </span>
                <span className="text-zinc-400 text-xs tracking-wide uppercase">
                  {xpNeeded} XP to Lev {nextLevel}
                </span>
              </div>
              <Progress
                value={progressPercent}
                className="h-3 bg-black/20"
                indicatorClassName="bg-gradient-to-r from-yellow-500 to-yellow-300"
              />
            </CardContent>
          </Card>
        </div>
      </BackgroundBeamsWithCollision>

      {/* 2. Key Metrics Grid - Aceternity BentoGrid */}
      <div className="pt-2">
        <h3 className="text-xl font-bold mb-4 text-zinc-800 dark:text-zinc-100 px-1">
          Performance Highlights
        </h3>
        <BentoGrid className="md:auto-rows-[10rem]">
          {[
            {
              title: global.dayStreak.toString(),
              description: "Current Day Streak",
              icon: (
                <Flame className="w-8 h-8 text-orange-500 drop-shadow-md" />
              ),
              className:
                "md:col-span-1 border-orange-100 dark:border-white/10 bg-gradient-to-br from-orange-50 to-white dark:from-zinc-900 dark:to-zinc-950",
            },
            {
              title: playground.totalProblemsSolved.toString(),
              description: "Problems Solved",
              icon: <Code className="w-8 h-8 text-indigo-500 drop-shadow-md" />,
              className:
                "md:col-span-1 border-indigo-100 dark:border-white/10 bg-gradient-to-br from-indigo-50 to-white dark:from-zinc-900 dark:to-zinc-950",
            },
            {
              title: `${competitions.winRate}%`,
              description: "Overall Win Rate",
              icon: (
                <Target className="w-8 h-8 text-emerald-500 drop-shadow-md" />
              ),
              className:
                "md:col-span-2 border-emerald-100 dark:border-white/10 bg-gradient-to-br from-emerald-50 to-white dark:from-zinc-900 dark:to-zinc-950",
            },
            {
              title: competitions.totalGamesPlayed.toString(),
              description: "Matches Played",
              icon: (
                <Activity className="w-8 h-8 text-pink-500 drop-shadow-md" />
              ),
              className:
                "md:col-span-2 border-pink-100 dark:border-white/10 bg-gradient-to-br from-pink-50 to-white dark:from-zinc-900 dark:to-zinc-950",
            },
          ].map((stat, i) => (
            <BentoGridItem
              key={i}
              title={<span className="text-3xl font-black">{stat.title}</span>}
              description={
                <span className="text-sm font-medium uppercase tracking-wider">
                  {stat.description}
                </span>
              }
              icon={stat.icon}
              className={`flex flex-col justify-end p-6 hover:scale-[1.02] transition-transform ${stat.className}`}
            />
          ))}
        </BentoGrid>
      </div>

      {/* 3. Charts Section - Shadcn Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Languages Pie Chart */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-500" /> Playground Mastery
            </CardTitle>
          </CardHeader>
          <CardContent>
            {playground.languageDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={playground.languageDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="solvedCount"
                      nameKey="language"
                    >
                      {playground.languageDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value, name) => [
                        value + " Problems",
                        name.charAt(0).toUpperCase() + name.slice(1),
                      ]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e4e4e7",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      formatter={(value) => (
                        <span className="text-zinc-600 dark:text-zinc-300 font-semibold capitalize">
                          {value}
                        </span>
                      )}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-zinc-400 text-sm font-medium">
                No playground problems solved yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Competition History Line Chart */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-500" /> Recent Competition
              Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            {competitions.recentHistory.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={competitions.recentHistory}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorScore"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e4e4e7"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 12, fontWeight: 500 }}
                      dx={-10}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                      }}
                      labelStyle={{
                        color: "#000",
                        fontWeight: "bold",
                        marginBottom: "4px",
                      }}
                      cursor={{
                        stroke: "#10b981",
                        strokeWidth: 1,
                        strokeDasharray: "4 4",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#10b981"
                      strokeWidth={4}
                      dot={{
                        r: 5,
                        fill: "#fff",
                        strokeWidth: 3,
                        stroke: "#10b981",
                      }}
                      activeDot={{
                        r: 8,
                        fill: "#10b981",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      name="Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-zinc-400 text-sm font-medium">
                No competition history found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
