import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getGlobalLeaderboard } from "@/features/leaderboard/leaderboardApi";
import {
  GraduationCap,
  Map,
  Trophy,
  Users,
  User as UserIcon,
  Terminal,
  Search,
  Bell,
  Play,
  Check,
  Lock,
  Star,
  Code,
  Bug,
  Zap,
  Medal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarRadiusAxis,
} from "recharts";

export default function CourseOverview({ course, enrollment, onResume }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const courseLayout = course?.courseOutput;
  const chapters = courseLayout?.chapters || [];

  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLB, setLoadingLB] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await getGlobalLeaderboard();
        if (response.success) {
          setLeaderboard(response.data.slice(0, 3)); // Only need top 3
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoadingLB(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Calculate progress
  const totalChapters = course?.noOfChapters || chapters.length || 1;
  const completedChaptersCount = enrollment?.completedChapters?.length || 0;
  const progressPercent = Math.round(
    (completedChaptersCount / totalChapters) * 100,
  );

  // Find the current active module
  const currentChapterIndex = Math.min(
    completedChaptersCount,
    chapters.length - 1,
  );
  const currentChapter = chapters[currentChapterIndex];

  // Chart Config
  const chartData = [
    { name: "Progress", value: progressPercent, fill: "#8c2bee" },
  ];
  const chartConfig = {
    progress: {
      label: "Course Progress",
      color: "#8c2bee",
    },
    skills: {
      label: "Skill Level",
      color: "#8c2bee",
    },
  };

  const radarData = [
    { subject: "Logic", A: 85, fullMark: 100 },
    { subject: "Syntax", A: 70, fullMark: 100 },
    { subject: "Design", A: 90, fullMark: 100 },
    { subject: "Speed", A: 65, fullMark: 100 },
    { subject: "Testing", A: 50, fullMark: 100 },
  ];

  return (
    <div className="bg-slate-100 dark:bg-[#12091b] text-slate-900 dark:text-slate-100 min-h-screen flex font-space-grotesk">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200/80 dark:border-[#8c2bee]/15 bg-white dark:bg-[#160d22] flex flex-col fixed left-0 top-0 h-full z-20 shadow-xl shadow-slate-200/50 dark:shadow-black/30">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8c2bee] to-[#6b1fb8] rounded-xl flex items-center justify-center shadow-lg shadow-[#8c2bee]/30">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#8c2bee] to-[#b06aff] bg-clip-text text-transparent">
            EduQuest
          </h1>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#8c2bee] text-white rounded-xl transition-all">
            <Map className="w-5 h-5" />
            <span className="font-medium">Path</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-[#8c2bee]/10 hover:text-[#8c2bee] rounded-xl transition-all">
            <Trophy className="w-5 h-5" />
            <span className="font-medium">Achievements</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-[#8c2bee]/10 hover:text-[#8c2bee] rounded-xl transition-all">
            <Users className="w-5 h-5" />
            <span className="font-medium">Community</span>
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-[#8c2bee]/10 hover:text-[#8c2bee] rounded-xl transition-all"
          >
            <UserIcon className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </button>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-gradient-to-br from-[#8c2bee]/15 to-[#6b1fb8]/10 rounded-xl p-4 border border-[#8c2bee]/25">
            <p className="text-xs font-semibold text-[#8c2bee] uppercase tracking-wider mb-2">
              Pro Access
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              Unlock unlimited course generation.
            </p>
            <button className="w-full bg-gradient-to-r from-[#8c2bee] to-[#6b1fb8] py-2.5 rounded-lg text-sm font-bold text-white hover:shadow-lg hover:shadow-[#8c2bee]/30 transition-all hover:-translate-y-0.5">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen bg-slate-100 dark:bg-[#12091b]">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 sticky top-0 bg-white/90 dark:bg-[#160d22]/90 backdrop-blur-xl z-10 border-b border-slate-200/80 dark:border-[#8c2bee]/15 shadow-sm dark:shadow-black/10 ">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#8c2bee]/20 rounded-lg">
              <Terminal className="text-[#8c2bee] w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">
              {course?.name || "Next-Gen Server Architecture"}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                className="pl-10 pr-4 py-2 bg-slate-200 dark:bg-[#8c2bee]/10 border-none rounded-xl focus:ring-2 focus:ring-[#8c2bee] focus:outline-none w-64 text-sm text-slate-900 dark:text-white"
                placeholder="Search lessons..."
                type="text"
              />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-[#8c2bee] transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#8c2bee] rounded-full ring-2 ring-white dark:ring-[#191022]"></span>
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-[#8c2bee] overflow-hidden">
              <img
                src={
                  user?.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?._id}`
                }
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        <div className="p-8 flex gap-8">
          {/* Left Column: Path & Progress */}
          <div className="flex-1 space-y-8">
            {/* Progress Header Card */}
            <div className="bg-white dark:bg-[#1e1230] border border-slate-200/80 dark:border-[#8c2bee]/15 rounded-2xl p-8 flex items-center justify-between overflow-hidden relative shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:shadow-xl transition-shadow z-0">
              <div className="z-10">
                <span className="px-3 py-1 bg-[#8c2bee]/20 text-[#8c2bee] text-xs font-bold rounded-full mb-4 inline-block">
                  CONTINUE LEARNING
                </span>
                <h3 className="text-3xl font-bold mb-2">
                  Module {currentChapterIndex + 1}:{" "}
                  {currentChapter?.chapterName}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                  You're making great progress! Finish this module to unlock the
                  next badge.
                </p>
                <button
                  onClick={() => onResume(currentChapterIndex, 0)}
                  className="px-6 py-3 bg-gradient-to-r from-[#8c2bee] to-[#6b1fb8] text-white font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[#8c2bee]/30 hover:shadow-xl hover:shadow-[#8c2bee]/40"
                >
                  <Play className="w-5 h-5" fill="currentColor" /> Resume Module
                </button>
              </div>
              <div className="flex items-center gap-8 z-10 mr-4 lg:mr-10 relative">
                <div className="relative flex items-center justify-center w-36 h-36 lg:w-48 lg:h-48 drop-shadow-2xl">
                  <ChartContainer
                    config={chartConfig}
                    className="w-full h-full absolute inset-0"
                  >
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="75%"
                      outerRadius="100%"
                      barSize={16}
                      data={chartData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        angleAxisId={0}
                        tick={false}
                      />
                      <RadialBar
                        background={{
                          fill: "var(--tw-colors-slate-200)",
                          opacity: 0.2,
                        }}
                        dataKey="value"
                        cornerRadius={10}
                        className="transition-all duration-1000 ease-out"
                      />
                    </RadialBarChart>
                  </ChartContainer>
                  <span className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white relative z-10 drop-shadow-md">
                    {progressPercent}%
                  </span>
                </div>
              </div>
              {/* Decorative background shapes */}
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#8c2bee]/10 rounded-full blur-3xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#1e1230] border border-slate-200/80 dark:border-[#8c2bee]/15 rounded-2xl p-6 shadow-md shadow-slate-200/50 dark:shadow-black/20 hover:shadow-lg transition-shadow">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                  Total Experience
                </p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-2xl font-bold">
                    {user?.xp?.toLocaleString() || 0}
                  </h4>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    +XP
                  </span>
                </div>
                <div className="mt-4 w-full h-1.5 bg-slate-200 dark:bg-[#8c2bee]/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8c2bee] rounded-full"
                    style={{ width: `${(user?.xp % 1000) / 10}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1e1230] border border-slate-200/80 dark:border-[#8c2bee]/15 rounded-2xl p-6 shadow-md shadow-slate-200/50 dark:shadow-black/20 hover:shadow-lg transition-shadow">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                  Current Streak
                </p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-2xl font-bold">
                    {user?.dayStreak || 0} Days
                  </h4>
                  <Zap
                    className="text-orange-500 w-4 h-4"
                    fill="currentColor"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-4 italic">
                  Next milestone soon
                </p>
              </div>

              <div className="bg-white dark:bg-[#1e1230] border border-slate-200/80 dark:border-[#8c2bee]/15 rounded-2xl p-6 shadow-md shadow-slate-200/50 dark:shadow-black/20 hover:shadow-lg transition-shadow">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                  Global Ranking
                </p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-2xl font-bold">
                    {user?.rank || "Novice"}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-4 tracking-wider">
                  Lvl {user?.level || 1}
                </p>
              </div>
            </div>

            {/* Vertical Learning Path */}
            <div className="bg-white dark:bg-[#1e1230] border border-slate-200/80 dark:border-[#8c2bee]/15 rounded-2xl p-8 shadow-lg shadow-slate-200/50 dark:shadow-black/20 z-0">
              <h4 className="text-lg font-bold mb-8">Learning Path</h4>
              <div className="space-y-0 z-0">
                {chapters.map((chap, idx) => {
                  const isCompleted = enrollment?.completedChapters?.includes(
                    chap.chapterName,
                  );
                  const isCurrent = idx === currentChapterIndex;
                  // Unlock all modules
                  const isLocked = false;

                  return (
                    <div
                      key={idx}
                      className="flex gap-6 group cursor-pointer"
                      onClick={() => !isLocked && onResume(idx, 0)}
                    >
                      <div className="flex flex-col items-center z-0">
                        {isCompleted ? (
                          <div className="w-12 h-12 rounded-full bg-[#8c2bee] flex items-center justify-center text-white ring-8 ring-[#8c2bee]/10 z-10 transition-transform hover:scale-110">
                            <Check className="w-6 h-6" strokeWidth={3} />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-12 h-12 rounded-full border-4 border-[#8c2bee] bg-white dark:bg-[#191022] flex items-center justify-center text-[#8c2bee] ring-8 ring-[#8c2bee]/20 z-10 transition-transform hover:scale-110">
                            <Play
                              className="w-5 h-5 ml-1 flex-shrink-0"
                              fill="currentColor"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-[#191022] flex items-center justify-center text-slate-500 dark:text-slate-400 z-10 transition-transform hover:scale-110">
                            <Play className="w-4 h-4 ml-0.5" />
                          </div>
                        )}
                        {/* Line connecting nodes */}
                        {idx !== chapters.length - 1 && (
                          <div
                            className={cn(
                              "w-1 h-full min-h-[5rem] -my-2 transition-colors",
                              isCompleted
                                ? "bg-[#8c2bee] opacity-30"
                                : "bg-slate-300 dark:bg-slate-700",
                            )}
                          ></div>
                        )}
                      </div>
                      <div className="flex-1 pb-12 pt-2">
                        <span
                          className={cn(
                            "text-xs font-bold uppercase tracking-widest",
                            isLocked ? "text-slate-500" : "text-[#8c2bee]",
                          )}
                        >
                          Module {idx + 1}
                        </span>
                        <h5 className="text-lg font-bold">
                          {chap.chapterName}
                        </h5>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {chap.topics?.length} Topics •{" "}
                          {chap.duration || "15 mins"}
                        </p>
                        {isCurrent && (
                          <div className="flex items-center gap-2 mt-3">
                            <span className="w-2 h-2 bg-[#8c2bee] rounded-full animate-pulse"></span>
                            <span className="text-xs font-medium text-slate-400">
                              Active Learning Session
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="w-80 shrink-0 space-y-6">
            {/* Unlocked Achievements */}
            <section className="bg-white dark:bg-[#1e1230] border border-slate-200/80 dark:border-[#8c2bee]/15 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold">Achievements</h4>
                <button className="text-xs text-[#8c2bee] font-bold hover:underline">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {courseLayout?.achievements?.length > 0 ? (
                  courseLayout.achievements.map((ach, i) => {
                    const unlocked = enrollment?.unlockedAchievements?.includes(
                      ach.title,
                    );
                    return (
                      <div
                        key={i}
                        className={`flex flex-col items-center text-center group ${unlocked ? "cursor-pointer" : "opacity-50"}`}
                      >
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-transform ${
                            unlocked
                              ? "bg-[#8c2bee]/20 ring-2 ring-[#8c2bee] group-hover:scale-110"
                              : "bg-slate-200 dark:bg-slate-800 border border-dashed border-slate-400 dark:border-slate-600"
                          }`}
                        >
                          {unlocked ? (
                            <Star
                              className="text-[#8c2bee] w-8 h-8"
                              fill="currentColor"
                            />
                          ) : (
                            <Lock className="text-slate-400 dark:text-slate-600 w-8 h-8" />
                          )}
                        </div>
                        <p
                          className={`text-xs font-bold ${!unlocked && "text-slate-500"}`}
                        >
                          {ach.title}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="flex flex-col items-center text-center group cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-[#8c2bee]/20 flex items-center justify-center mb-2 ring-2 ring-[#8c2bee] group-hover:scale-110 transition-transform">
                        <Star
                          className="text-[#8c2bee] w-8 h-8"
                          fill="currentColor"
                        />
                      </div>
                      <p className="text-xs font-bold">Early Bird</p>
                    </div>
                    <div className="flex flex-col items-center text-center group cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-[#8c2bee]/20 flex items-center justify-center mb-2 ring-2 ring-[#8c2bee] group-hover:scale-110 transition-transform">
                        <Code className="text-[#8c2bee] w-8 h-8" />
                      </div>
                      <p className="text-xs font-bold">Code Wizard</p>
                    </div>
                    <div className="flex flex-col items-center text-center group cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-2 border border-dashed border-slate-400 dark:border-slate-600">
                        <Lock className="text-slate-400 dark:text-slate-600 w-8 h-8" />
                      </div>
                      <p className="text-xs font-bold text-slate-500">
                        Fast Typer
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center group cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-2 border border-dashed border-slate-400 dark:border-slate-600">
                        <Lock className="text-slate-400 dark:text-slate-600 w-8 h-8" />
                      </div>
                      <p className="text-xs font-bold text-slate-500">
                        Bug Hunter
                      </p>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Skill Radar */}
            <section className="bg-white dark:bg-[#1e1230] border border-slate-200/80 dark:border-[#8c2bee]/15 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
              <h4 className="font-bold mb-4">Skill Analysis</h4>
              <div className="h-48 w-full -ml-2">
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    data={radarData}
                  >
                    <PolarGrid
                      stroke="var(--tw-colors-slate-200)"
                      opacity={0.2}
                    />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{
                        fill: "var(--tw-colors-slate-500)",
                        fontSize: 10,
                      }}
                    />
                    <Radar
                      dataKey="A"
                      stroke="#8c2bee"
                      fill="#8c2bee"
                      fillOpacity={0.3}
                      dot={{ r: 3, fillOpacity: 1 }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                  </RadarChart>
                </ChartContainer>
              </div>
            </section>

            {/* Leaderboard Teaser */}
            <section className="bg-white dark:bg-[#1e1230] border border-slate-200/80 dark:border-[#8c2bee]/15 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
              <h4 className="font-bold mb-4">Leaderboard</h4>
              <div className="space-y-4">
                {loadingLB ? (
                  <div className="text-sm text-slate-500 text-center py-4">
                    Loading top players...
                  </div>
                ) : leaderboard.length > 0 ? (
                  leaderboard.map((player, idx) => (
                    <div
                      key={player._id || idx}
                      className="flex items-center gap-3"
                    >
                      <span className="text-sm font-bold text-slate-500 w-4">
                        {idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#8c2bee]/20 shrink-0">
                        <img
                          src={
                            player.avatarUrl ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${player._id || player.username}`
                          }
                          alt="Player"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {player.username || player.name || "Unknown"}
                        </p>
                        <p className="text-[10px] text-slate-500 hidden sm:block">
                          Lvl {player.level || 1} •{" "}
                          {player.xp?.toLocaleString()} XP
                        </p>
                        <p className="text-[10px] text-slate-500 sm:hidden">
                          {player.xp?.toLocaleString()} XP
                        </p>
                      </div>
                      {idx === 0 && (
                        <Medal className="text-yellow-500 w-5 h-5 shrink-0" />
                      )}
                      {idx === 1 && (
                        <Medal className="text-gray-400 w-5 h-5 shrink-0" />
                      )}
                      {idx === 2 && (
                        <Medal className="text-amber-700 w-5 h-5 shrink-0" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500 text-center py-4">
                    No data available
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate("/leaderboard")}
                className="w-full mt-6 text-sm font-bold text-[#8c2bee] py-2 border border-[#8c2bee]/20 rounded-lg hover:bg-[#8c2bee]/5 transition-colors"
              >
                Show Full List
              </button>
            </section>

            {/* Help/Support Banner */}
            <div className="bg-gradient-to-br from-[#8c2bee] to-[#6b1fb8] rounded-2xl p-6 relative overflow-hidden group mt-6 shadow-lg shadow-[#8c2bee]/30 z-0">
              <div className="z-10 relative">
                <h4 className="text-white font-bold mb-1">Need help?</h4>
                <p className="text-white/80 text-xs mb-4">
                  Chat with our AI architecture mentor anytime.
                </p>
                <button className="bg-white text-[#8c2bee] px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-slate-100 transition-colors">
                  Ask Mentor
                </button>
              </div>
              <Zap className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-125 transition-transform" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
