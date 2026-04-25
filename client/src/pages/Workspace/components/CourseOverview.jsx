import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "@/features/auth/authApi";
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
  Book,
  BookOpen,
  LayoutDashboard,
  Plus,
} from "lucide-react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import WelcomeBanner from "./WelcomeBanner";
import CourseList from "./CourseList";
import AddCourseDialog from "./AddCourseDialog";
import EnrollCourseList from "./EnrollCourseList";
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
  const [recentCourse, setRecentCourse] = useState(null);
  const [open, setOpen] = useState(false);
  const currentPath = window.location.pathname;

  const SidebarOptions = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/workspace" },
    { title: "My Learning", icon: Book, path: "/my-learning" },
    { title: "Explore Courses", icon: BookOpen, path: "/#" },
    { title: "Billing", icon: BookOpen, path: "/#" },
    { title: "Profile", icon: UserIcon, path: "/profile" },
  ];

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

    // Fetch recent course for workspace if no specific course is selected
    if (!course && user?.email) {
      api
        .get(
          `http://localhost:8080/api/v1/ai/user-enrollments?email=${user.email}`,
        )
        .then((res) => {
          if (res.data.enrolledCourses && res.data.enrolledCourses.length > 0) {
            setRecentCourse(res.data.enrolledCourses[0]);
          }
        })
        .catch((err) => console.error("Failed to fetch recent course", err));
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
    <div className="bg-[#0a0a0a] text-white min-h-screen flex font-space-grotesk">
      {/* Sidebar Navigation */}
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="bg-[#111111] border-r border-white/10 h-[calc(100vh-64px)] pb-10 px-3 z-40">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden pt-4 -mx-1">
            {/* Sidebar Header */}
            <div className="flex items-center gap-3 mb-8">
              <img
                src="/logo1.png"
                alt="logo"
                width={30}
                height={30}
                className="shrink-0 shadow-lg rounded"
              />
              {open && (
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent whitespace-pre animate-in fade-in">
                  Workspace
                </h2>
              )}
            </div>

            {/* Create New Course Button */}
            <div className="mb-8">
              <AddCourseDialog>
                <button
                  className={`flex items-center justify-start gap-3 transition-all rounded-lg font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 shadow-lg shadow-red-500/20 hover:shadow-xl hover:-translate-y-0.5 ${open ? "w-full text-sm px-4 py-3" : "w-10 h-10 p-0 justify-center text-sm"}`}
                >
                  <Plus className="w-5 h-5 shrink-0" strokeWidth={3} />
                  {open && (
                    <span className="animate-in fade-in whitespace-pre">
                      Create New Course
                    </span>
                  )}
                </button>
              </AddCourseDialog>
            </div>

            {/* Sidebar Links */}
            <div className="flex flex-col gap-3 mt-2">
              {SidebarOptions.map((item, index) => (
                <SidebarLink
                  key={index}
                  link={{
                    label: item.title,
                    href: item.path,
                    icon: (
                      <item.icon
                        className={`h-6 w-6 shrink-0 ${
                          currentPath === item.path ||
                          (currentPath.startsWith(item.path) &&
                            item.path !== "/#")
                            ? "text-red-400"
                            : "text-zinc-400 group-hover/sidebar:text-white"
                        }`}
                      />
                    ),
                  }}
                  className={`font-bold transition-colors py-3 px-3 rounded-lg ${
                    currentPath === item.path ||
                    (currentPath.startsWith(item.path) && item.path !== "/#")
                      ? "text-red-400 bg-white/10"
                      : "hover:bg-white/5 text-zinc-300"
                  }`}
                />
              ))}
            </div>

            <div className="mt-auto">
              <div className="bg-gradient-to-br from-red-600/15 to-orange-600/10 rounded-xl p-4 border border-white/10 mt-8">
                {open && (
                  <>
                    <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">
                      Pro Access
                    </p>
                    <p className="text-sm text-zinc-400 mb-3">
                      Unlock unlimited course generation.
                    </p>
                  </>
                )}
                <button
                  className={`w-full bg-[#111111] py-2 rounded-lg border border-red-500/30 text-xs font-bold text-red-400 hover:bg-red-600/10 transition-colors ${!open && "px-1 text-[10px]"}`}
                >
                  {open ? "Upgrade Now" : "PRO"}
                </button>
              </div>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen bg-[#0a0a0a] ">
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
                    <h3 className="text-3xl font-bold mb-2">
                      {course
                        ? `Module ${currentChapterIndex + 1}: ${currentChapter?.chapterName}`
                        : activeCourse.name}
                    </h3>
                    <p className="text-zinc-400 max-w-sm mb-6">
                      You're making great progress! Finish this module to unlock
                      the next badge.
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
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-md shadow-black/50 hover:shadow-lg transition-shadow">
                <p className="text-sm text-zinc-400 font-medium mb-1">
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
                <div className="mt-4 w-full h-1.5 bg-white/5 dark:bg-red-600/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full"
                    style={{ width: `${(user?.xp % 1000) / 10}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-md shadow-black/50 hover:shadow-lg transition-shadow">
                <p className="text-sm text-zinc-400 font-medium mb-1">
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
                <p className="text-xs text-zinc-400 mt-4 italic">
                  Next milestone soon
                </p>
              </div>

              <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-md shadow-black/50 hover:shadow-lg transition-shadow">
                <p className="text-sm text-zinc-400 font-medium mb-1">
                  Global Ranking
                </p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-2xl font-bold">
                    {user?.rank || "Novice"}
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 mt-4 tracking-wider">
                  Lvl {user?.level || 1}
                </p>
              </div>
            </div>

            {course ? (
              <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-lg shadow-black/50 z-0">
                <h4 className="text-lg font-bold mb-8">Learning Path</h4>
                <div className="space-y-0 z-0">
                  {activeChapters.map((chap, idx) => {
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
                          <h5 className="text-lg font-bold">
                            {chap.chapterName}
                          </h5>
                          <p className="text-sm text-zinc-400 mt-1">
                            {chap.topics?.length} Topics •{" "}
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
                <EnrollCourseList userEmail={user?.email} />
                <CourseList />
              </div>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="w-80 shrink-0 space-y-6">
            {/* Unlocked Achievements */}
            <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/50 ">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold">Achievements</h4>
                <button className="text-xs text-red-400 font-bold hover:underline">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {activeCourseLayout?.achievements?.length > 0 ? (
                  activeCourseLayout.achievements.map((ach, i) => {
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
                              ? "bg-red-600/20 ring-2 ring-[#8c2bee] group-hover:scale-110"
                              : "bg-white/5 border border-dashed border-white/20 "
                          }`}
                        >
                          {unlocked ? (
                            <Star
                              className="text-red-400 w-8 h-8"
                              fill="currentColor"
                            />
                          ) : (
                            <Lock className="text-slate-400 dark:text-zinc-400 w-8 h-8" />
                          )}
                        </div>
                        <p
                          className={`text-xs font-bold ${!unlocked && "text-zinc-400"}`}
                        >
                          {ach.title}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="flex flex-col items-center text-center group cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mb-2 ring-2 ring-[#8c2bee] group-hover:scale-110 transition-transform">
                        <Star
                          className="text-red-400 w-8 h-8"
                          fill="currentColor"
                        />
                      </div>
                      <p className="text-xs font-bold">Early Bird</p>
                    </div>
                    <div className="flex flex-col items-center text-center group cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mb-2 ring-2 ring-[#8c2bee] group-hover:scale-110 transition-transform">
                        <Code className="text-red-400 w-8 h-8" />
                      </div>
                      <p className="text-xs font-bold">Code Wizard</p>
                    </div>
                    <div className="flex flex-col items-center text-center group cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2 border border-dashed border-white/20 ">
                        <Lock className="text-slate-400 dark:text-zinc-400 w-8 h-8" />
                      </div>
                      <p className="text-xs font-bold text-zinc-400">
                        Fast Typer
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center group cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2 border border-dashed border-white/20 ">
                        <Lock className="text-slate-400 dark:text-zinc-400 w-8 h-8" />
                      </div>
                      <p className="text-xs font-bold text-zinc-400">
                        Bug Hunter
                      </p>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Skill Radar */}
            <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/50 ">
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
            <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/50 ">
              <h4 className="font-bold mb-4">Leaderboard</h4>
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

            {/* Help/Support Banner */}
            <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-6 relative overflow-hidden group mt-6 shadow-lg shadow-red-500/20 z-0">
              <div className="z-10 relative">
                <h4 className="text-white font-bold mb-1">Need help?</h4>
                <p className="text-white/80 text-xs mb-4">
                  Chat with our AI architecture mentor anytime.
                </p>
                <button className="bg-[#111111] text-red-400 px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-[#0a0a0a] transition-colors">
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
