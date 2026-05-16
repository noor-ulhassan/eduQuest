import { useSelector } from "react-redux";
import Streak from "@/components/home/streak";
import BadgesCard from "@/components/home/BadgesCard";
import AchievementsCard from "@/components/home/AchievementsCard";
import DailyQuests from "@/components/home/DailyQuests";
import SmartSuggestion from "@/components/home/SmartSuggestion";
import LeaderboardPreview from "@/components/home/LeaderboardPreview";
import { getLevelProgress } from "@/utils/levelUtils";

const LEAGUE_COLOR = {
  Grandmaster: "text-red-400",
  Master:      "text-purple-400",
  Diamond:     "text-cyan-400",
  Platinum:    "text-emerald-400",
  Gold:        "text-yellow-400",
  Silver:      "text-zinc-300",
  Bronze:      "text-orange-400",
};

const XPBar = ({ user }) => {
  const { progressPercent, xpToNextLevel, xpInLevel, xpNeeded } =
    getLevelProgress(user?.xp ?? 0, user?.level ?? 1);
  const leagueColor = LEAGUE_COLOR[user?.league] ?? "text-orange-400";

  return (
    <div className="bg-[#1a1730] rounded-[2rem] p-6 border border-zinc-700 shadow-sm flex-1">
      {/* Level + League */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">
            Level
          </div>
          <div className="text-4xl font-black text-white leading-none">
            {user?.level ?? 1}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-black ${leagueColor}`}>
            {user?.league ?? "Bronze"}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {(user?.xp ?? 0).toLocaleString()} XP total
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-white/[0.04] rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* XP labels */}
      <div className="flex justify-between text-[11px] font-medium text-zinc-500">
        <span>
          {xpInLevel} / {xpNeeded} XP this level
        </span>
        <span className="font-bold text-zinc-400">
          {xpToNextLevel} to Level {(user?.level ?? 1) + 1}
        </span>
      </div>
    </div>
  );
};

const GamificationDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Your Dashboard
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {user?.name
              ? `Welcome back, ${user.name.split(" ")[0]}.`
              : "Track your progress."}
          </p>
        </div>

        {/* Row 1: XP Bar + Streak */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <XPBar user={user} />
          <div className="shrink-0">
            <Streak />
          </div>
        </div>

        {/* Row 2: SmartSuggestion + DailyQuests */}
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="w-full lg:w-80 shrink-0">
            <SmartSuggestion />
          </div>
          <div className="flex-1 min-w-0">
            <DailyQuests />
          </div>
        </div>

        {/* Row 3: Badges + Achievements + Leaderboard Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BadgesCard />
          <AchievementsCard />
          <LeaderboardPreview />
        </div>

      </div>
    </div>
  );
};

export default GamificationDashboard;
