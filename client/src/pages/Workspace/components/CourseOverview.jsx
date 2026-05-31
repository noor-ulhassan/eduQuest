import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "@/features/auth/authApi";
import { getLevelProgress } from "@/utils/levelUtils";
import { getGlobalLeaderboard } from "@/features/leaderboard/leaderboardApi";
import AchievementsCard from "../../Homepage/components/AchievementsCard";
import {
  User as UserIcon,
  Play,
  Check,
  Lock,
  Star,
  Code,
  Zap,
  Medal,
  Book,
  BookOpen,
  LayoutDashboard,
  Flame,
  FileText,
} from "lucide-react";
import { motion } from "motion/react";

import WelcomeBanner from "./WelcomeBanner";
import CourseList from "./CourseList";
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
} from "recharts";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

const useCountUp = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
};

// Floating "+XP!" particle that shoots upward and fades — triggered on XP card click
const FloatingXP = ({ onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 1000);
    return () => clearTimeout(t);
  }, []);
  return (
    <span
      className="absolute top-0 right-4 text-emerald-400 font-bold text-sm pointer-events-none"
      style={{ animation: "floatUp 1s ease-out forwards" }}
    >
      +XP!
    </span>
  );
};
export default function CourseOverview({ course, enrollment, onResume }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const courseLayout = course?.courseOutput;
  const chapters = courseLayout?.chapters || [];

  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLB, setLoadingLB] = useState(true);
  const [recentCourse, setRecentCourse] = useState(null);
  const [loadingRecent, setLoadingRecent] = useState(!course);
  const [open, setOpen] = useState(false);
  const currentPath = window.location.pathname;

  const xp = useCountUp(user?.xp || 0); // animated XP number
  const streak = useCountUp(user?.dayStreak || 0); // animated streak number
  const [showXPParticle, setShowXPParticle] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes floatUp {
        0%   { opacity: 1; transform: translateY(0px); }
        100% { opacity: 0; transform: translateY(-40px); }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 8px 2px rgba(16,185,129,0.3); }
        50%       { box-shadow: 0 0 20px 6px rgba(16,185,129,0.6); }
      }
      @keyframes orangeGlow {
        0%, 100% { box-shadow: 0 0 8px 2px rgba(249,115,22,0.3); }
        50%       { box-shadow: 0 0 20px 6px rgba(249,115,22,0.6); }
      }
      @keyframes goldGlow {
        0%, 100% { box-shadow: 0 0 8px 2px rgba(234,179,8,0.3); }
        50%       { box-shadow: 0 0 20px 6px rgba(234,179,8,0.6); }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await getGlobalLeaderboard();
        const entries = response?.data?.data ?? [];
        if (entries.length) {
          setLeaderboard(entries.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoadingLB(false);
      }
    };
    fetchLeaderboard();

    // Fetch recent course for workspace if no specific course is selected
    if (!course && user?.email) {
      api
        .get("/ai/user-enrollments")
        .then((res) => {
          if (res.data.enrolledCourses && res.data.enrolledCourses.length > 0) {
            setRecentCourse(res.data.enrolledCourses[0]);
          }
        })
        .catch((err) => console.error("Failed to fetch recent course", err))
        .finally(() => setLoadingRecent(false));
    } else {
      setLoadingRecent(false);
    }
  }, [course, user?.email]);

  const activeCourse = course || recentCourse;
  const activeCourseLayout =
    activeCourse?.courseOutput || activeCourse?.courseLayout;
  const activeChapters = activeCourseLayout?.chapters || [];

  // Calculate progress
  const totalChapters =
    activeCourse?.noOfChapters || activeChapters.length || 1;
  const completedChaptersCount = enrollment?.completedChapters?.length || 0;
  // If recentCourse is used, we might not have exact enrollment data passed in.
  // Fallback to progress field if available.
  const progressPercent = course
    ? Math.round((completedChaptersCount / totalChapters) * 100)
    : activeCourse?.progress || 0;

  // Find the current active module
  const currentChapterIndex = course
    ? Math.min(completedChaptersCount, activeChapters.length - 1)
    : 0;
  const currentChapter = activeChapters[currentChapterIndex];

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
    <div className="bg-[#0a0a0a] text-metallic min-h-screen flex font-space-grotesk">
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#0a0a0a]">
        <DottedGlowBackground
          color="rgba(255, 255, 255, 0.2)"
          glowColor="rgba(249, 115, 22, 0.6)"
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative z-10">
        {loadingRecent ? (
          /* ── Full-page skeleton — shown until recentCourse resolves ── */
          <div className="p-8 flex gap-8 animate-pulse">
            <div className="flex-1 space-y-8">
              <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="h-5 w-36 bg-white/10 rounded-full" />
                    <div className="h-8 w-72 bg-white/10 rounded-lg" />
                    <div className="h-4 w-52 bg-white/10 rounded-full" />
                    <div className="h-11 w-36 bg-white/10 rounded-lg mt-6" />
                  </div>
                  <div className="w-40 h-40 rounded-full bg-white/10 shrink-0" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-[#111111] border border-white/10 rounded-2xl h-36"
                  />
                ))}
              </div>
              <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 space-y-8">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-5 items-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded-full w-2/3" />
                      <div className="h-3 bg-white/10 rounded-full w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-80 shrink-0 space-y-6">
              <div className="bg-[#111111] border border-white/10 rounded-2xl h-56" />
              <div className="bg-[#111111] border border-white/10 rounded-2xl h-64" />
              <div className="bg-[#111111] border border-white/10 rounded-2xl h-52" />
            </div>
          </div>
        ) : (
          <div className="p-8 flex gap-8">
            {/* Left Column: Path & Progress */}
            <div className="flex-1 space-y-8">
              {activeCourse ? (
                <>
                  {/* Progress Header Card */}
                  <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex items-center justify-between overflow-hidden relative shadow-lg shadow-black/50 hover:shadow-xl transition-shadow z-0">
                    <div className="z-10">
                      <span className="px-3 py-1 bg-red-600/20 text-red-400 text-xs font-bold rounded-full mb-4 inline-block">
                        CONTINUE LEARNING
                      </span>
                      <h3 className="text-3xl font-bold mb-2 text-metallic">
                        {course
                          ? `Module ${currentChapterIndex + 1}: ${currentChapter?.chapterName}`
                          : activeCourse.name}
                      </h3>
                      <p className="text-zinc-400 max-w-sm mb-6">
                        You're making great progress! Finish this module to
                        unlock the next badge.
                      </p>
                      <button
                        onClick={() =>
                          course
                            ? onResume(currentChapterIndex, 0)
                            : navigate(
                                `/course/${activeCourse.courseId || activeCourse._id}`,
                              )
                        }
                        className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg flex items-center gap-2 hover:bg-red-500 border border-red-400"
                      >
                        <Play className="w-5 h-5" fill="currentColor" /> Resume
                        Module
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
                        <span className="text-3xl lg:text-4xl font-black text-white dark:text-white relative z-10 drop-shadow-md">
                          {progressPercent}%
                        </span>
                      </div>
                    </div>
                    {/* Decorative background shapes */}
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-600/10 rounded-full blur-3xl"></div>
                  </div>
                </>
              ) : null}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  className="relative bg-[#111111] border border-white/10 rounded-2xl p-4 sm:pd-6 shadow-md shadow-black/50 hover:border-emerald-500/40 hover:shadow-lg transition-all cursor-pointer"
                  style={{
                    animation: "slideUp 0.4s ease-out both",
                    animationDelay: "0ms",
                  }}
                  onClick={() => setShowXPParticle(true)}
                >
                  {showXPParticle && (
                    <FloatingXP onDone={() => setShowXPParticle(false)} />
                  )}
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <p className="text-sm sm:text-sm text-zinc-400 font-medium">
                      Total Experience
                    </p>
                    <div
                      className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0"
                      style={{ animation: "pulseGlow 2s ease-in-out infinite" }}
                    >
                      <Zap
                        className="w-4 h-4 text-emerald-500"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 text-metallic">
                    <h4 className="text-xl sm:text-2xl font-bold">
                      {xp.toLocaleString()}
                    </h4>
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      +XP
                    </span>
                  </div>
                  <div className="mt-3 sm:mt-4 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{
                        width: `${getLevelProgress(user?.xp || 0, user?.level || 1).progressPercent}%`,
                      }}
                    />
                  </div>
                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60">
                      ⚡ {Math.floor((user?.xp || 0) / 1000)} levels earned
                    </span>
                  </div>
                </div>

                {/* Streak Card */}

                <div
                  className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-md shadow-black/50 hover:border-orange-500/40 hover:shadow-lg transition-all"
                  style={{
                    animation: "slideUp 0.4s ease-out both",
                    animationDelay: "100ms",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-sm text-zinc-400 font-medium">
                      Current Streak
                    </p>
                    <div
                      className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0"
                      style={{
                        animation: "orangeGlow 2s ease-in-out infinite",
                      }}
                    >
                      <Flame
                        className="w-4 h-4 text-orange-500"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-metallic">
                    {streak} <span className="text-orange-400">Days</span>
                  </h4>
                  <div className="flex gap-1.5 mt-3 sm:mt-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border transition-all duration-300 ${
                          i < (user?.dayStreak || 0)
                            ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                            : "bg-white/5 border-white/10 text-zinc-600"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-3 h-3"
                          fill="currentColor"
                        >
                          <path d="M12 2c0 0-6 6.5-6 11a6 6 0 0 0 12 0c0-4.5-6-11-6-11zm0 15.5c-1.38 0-2.5-1.12-2.5-2.5 0-1.5 2.5-5 2.5-5s2.5 3.5 2.5 5c0 1.38-1.12 2.5-2.5 2.5z" />
                        </svg>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 mt-4 sm:mt-4 italic">
                    Next milestone soon
                  </p>
                </div>

                {/* Rank Card */}

                <div
                  className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-md shadow-black/50 hover:border-yellow-500/40 hover:shadow-lg transition-all"
                  style={{
                    animation: "slideUp 0.4s ease-out both",
                    animationDelay: "200ms",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-sm text-zinc-400 font-medium">
                      Global Ranking
                    </p>
                    <div
                      className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0 text-base"
                      style={{ animation: "goldGlow 2s ease-in-out infinite" }}
                    >
                      <img
                        src="https://twemoji.maxcdn.com/v/latest/72x72/1f3c5.png"
                        className="w-5 h-5"
                        alt="medal"
                      />
                    </div>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-metallic">
                    {user?.league || "Bronze"}
                  </h4>
                  <div className="mt-3 sm:mt-4 flex gap-1">
                    {["Bronze", "Silver", "Gold", "Platinum", "Diamond"].map(
                      (tier, i) => (
                        <div
                          key={tier}
                          className={`flex-1 h-1.5 rounded-full transition-all duration-700 ${
                            [
                              "Bronze",
                              "Silver",
                              "Gold",
                              "Platinum",
                              "Diamond",
                            ].indexOf(user?.league || "Bronze") >= i
                              ? "bg-yellow-500"
                              : "bg-white/10"
                          }`}
                          style={{ transitionDelay: `${i * 150}ms` }}
                        />
                      ),
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-3 sm:mt-4 tracking-wider">
                    ⭐ Lvl {user?.level || 1}
                  </p>
                </div>
              </div>

              {course ? (
                <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-lg shadow-black/50 z-0">
                  <h4 className="text-lg font-bold mb-8 text-metallic">
                    Learning Path
                  </h4>
                  <div className="space-y-0 z-0">
                    {activeChapters.map((chap, idx) => {
                      const isCompleted =
                        enrollment?.completedChapters?.includes(
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
                              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white ring-8 ring-red-500/10 z-10 transition-transform hover:scale-110">
                                <Check className="w-6 h-6" strokeWidth={3} />
                              </div>
                            ) : isCurrent ? (
                              <div className="w-12 h-12 rounded-full border-4 border-red-500 bg-[#111111] flex items-center justify-center text-red-400 ring-8 ring-red-500/20 z-10 transition-transform hover:scale-110">
                                <Play
                                  className="w-5 h-5 ml-1 flex-shrink-0"
                                  fill="currentColor"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-[#0a0a0a] flex items-center justify-center text-zinc-400 z-10 transition-transform hover:scale-110">
                                <Play className="w-4 h-4 ml-0.5" />
                              </div>
                            )}
                            {/* Line connecting nodes */}
                            {idx !== chapters.length - 1 && (
                              <div
                                className={cn(
                                  "w-1 h-full min-h-[5rem] -my-2 transition-colors",
                                  isCompleted
                                    ? "bg-red-600 opacity-30"
                                    : "bg-slate-300 dark:bg-slate-700",
                                )}
                              ></div>
                            )}
                          </div>
                          <div className="flex-1 pb-12 pt-2">
                            <span
                              className={cn(
                                "text-xs font-bold uppercase tracking-widest",
                                isLocked ? "text-zinc-400" : "text-red-400",
                              )}
                            >
                              Module {idx + 1}
                            </span>
                            <h5 className="text-lg font-bold text-metallic">
                              {chap.chapterName}
                            </h5>
                            <p className="text-sm text-zinc-400 mt-1">
                              {chap.blocks?.length || 0} Blocks •{" "}
                              {chap.duration || "15 mins"}
                            </p>
                            {isCurrent && (
                              <div className="flex items-center gap-2 mt-3">
                                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
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
              ) : (
                <div className="space-y-8 z-0 w-full overflow-hidden">
                  <WelcomeBanner />
                  <CourseList />
                </div>
              )}
            </div>

            {/* Right Column: Sidebar */}
            <div className="w-80 shrink-0 space-y-6">
              {/* Unlocked Achievements */}
              <AchievementsCard className="bg-[#111111] border border-white/10" />

              {/* Skill Radar */}
              <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/50 ">
                <h4 className="font-bold mb-4 text-metallic">Skill Analysis</h4>
                <div className="h-48 w-full -ml-2">
                  <ChartContainer
                    config={chartConfig}
                    className="w-full h-full"
                  >
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      data={radarData}
                    >
                      <PolarGrid stroke="#334155" opacity={0.5} />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{
                          fill: "#94a3b8",
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
              <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/50 ">
                <h4 className="font-bold mb-4 text-metallic">Leaderboard</h4>
                <div className="space-y-4">
                  {loadingLB ? (
                    <div className="text-sm text-zinc-400 text-center py-4">
                      Loading top players...
                    </div>
                  ) : leaderboard.length > 0 ? (
                    leaderboard.map((player, idx) => (
                      <div
                        key={player._id || idx}
                        className="flex items-center gap-3"
                      >
                        <span className="text-sm font-bold text-zinc-400 w-4">
                          {idx + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-red-600/20 shrink-0">
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
                          <p className="text-[10px] text-zinc-400 hidden sm:block">
                            Lvl {player.level || 1} •{" "}
                            {player.xp?.toLocaleString()} XP
                          </p>
                          <p className="text-[10px] text-zinc-400 sm:hidden">
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
                    <div className="text-sm text-zinc-400 text-center py-4">
                      No data available
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate("/leaderboard")}
                  className="w-full mt-6 text-sm font-bold text-red-400 py-2 border border-red-500/20 rounded-lg hover:bg-red-600/5 transition-colors"
                >
                  Show Full List
                </button>
              </section>

              {/* Help/Support Banner
              <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-6 relative overflow-hidden group mt-6 shadow-lg shadow-red-500/20 z-0">
                <div className="z-10 relative">
                  <h4 className="text-white font-bold mb-1">Need help?</h4>
                  <p className="text-white/80 text-xs mb-4">
                    Get personalized help from your course guide anytime.
                  </p>
                  <button className="bg-[#111111] text-red-400 px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-[#0a0a0a] transition-colors">
                    Get Help
                  </button>
                </div>
                <Zap className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-125 transition-transform" />
              </div> */}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
