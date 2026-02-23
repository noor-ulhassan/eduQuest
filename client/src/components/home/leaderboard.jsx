import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getGlobalLeaderboard } from "../../features/leaderboard/leaderboardApi";
import {
  Trophy,
  Medal,
  Crown,
  User as UserIcon,
  TrendingUp,
  Shield,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const Leaderboard = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await getGlobalLeaderboard();
        if (response.success) {
          setLeaderboard(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400 fill-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-700 fill-amber-700" />;
      default:
        // Return null for > 3 so we can just show numbers
        return null;
    }
  };

  const getLeagueInfo = (xp) => {
    if (xp >= 20000)
      return {
        name: "Diamond",
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
        border: "border-cyan-400/20",
        icon: Shield,
      };
    if (xp >= 10000)
      return {
        name: "Platinum",
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/20",
        icon: Shield,
      };
    if (xp >= 5000)
      return {
        name: "Gold",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        icon: Trophy,
      };
    if (xp >= 1000)
      return {
        name: "Silver",
        color: "text-gray-400",
        bg: "bg-gray-400/10",
        border: "border-gray-400/20",
        icon: Medal,
      };
    return {
      name: "Bronze",
      color: "text-amber-700",
      bg: "bg-amber-700/10",
      border: "border-amber-700/20",
      icon: Medal,
    };
  };

  const getNextLeagueTarget = (xp) => {
    if (xp >= 20000) return null; // Max level
    if (xp >= 10000) return { name: "Diamond", target: 20000 };
    if (xp >= 5000) return { name: "Platinum", target: 10000 };
    if (xp >= 1000) return { name: "Gold", target: 5000 };
    return { name: "Silver", target: 1000 };
  };

  // Group users by league
  const groupedUsers = leaderboard.reduce((acc, user) => {
    const league = getLeagueInfo(user.xp).name;
    if (!acc[league]) acc[league] = [];
    acc[league].push(user);
    return acc;
  }, {});

  // Sort league keys so higher leagues come first
  const leagueOrder = ["Diamond", "Platinum", "Gold", "Silver", "Bronze"];

  // Current user progress
  const userLeague = currentUser ? getLeagueInfo(currentUser.xp) : null;
  const nextTarget = currentUser ? getNextLeagueTarget(currentUser.xp) : null;

  // Progress calculation
  const getProgress = (current, target) => {
    let base = 0;
    if (target === 1000) base = 0;
    else if (target === 5000) base = 1000;
    else if (target === 10000) base = 5000;
    else if (target === 20000) base = 10000;

    const totalNeeded = target - base;
    const currentProgress = current - base;
    return Math.min(100, Math.max(0, (currentProgress / totalNeeded) * 100));
  };

  const userProgress = nextTarget
    ? getProgress(currentUser.xp, nextTarget.target)
    : 100;

  return (
    <Card className="w-full max-w-[1240px] mx-auto mt-6 sm:mt-8 md:mt-12 overflow-hidden border-0 bg-gradient-to-b from-white to-zinc-50/80 shadow-lg shadow-zinc-200/50 dark:shadow-none dark:bg-zinc-900/50 dark:from-zinc-900/80 dark:to-zinc-900/40">
      <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6 pt-6 sm:pt-8 space-y-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex-shrink-0">
              <img
                src="/trophy.gif"
                alt="Leaderboard"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-contain ring-2 ring-amber-200/50 dark:ring-amber-500/20"
              />
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white shadow">
                <Sparkles className="h-2.5 w-2.5" />
              </span>
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Global Leaderboard
              </CardTitle>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Top learners around the world
              </p>
            </div>
          </div>

          {currentUser && nextTarget && (
            <div className="flex-1 max-w-md rounded-xl border border-zinc-200/80 dark:border-zinc-700/50 bg-zinc-50/80 dark:bg-zinc-800/50 p-3 sm:p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Current League:{" "}
                  <span className={userLeague.color}>{userLeague.name}</span>
                </span>
                <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {currentUser.xp.toLocaleString()} / {nextTarget.target.toLocaleString()} XP
                </span>
              </div>
              <Progress
                value={userProgress}
                className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700"
                indicatorClassName="rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all duration-500"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-500 shrink-0" />
                Earn{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {(nextTarget.target - currentUser.xp).toLocaleString()} XP
                </span>{" "}
                to reach {nextTarget.name} League
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <Separator className="bg-zinc-200/80 dark:bg-zinc-700/50" />

      <CardContent className="p-0">
        <div
          role="presentation"
          className="hidden md:grid grid-cols-[5rem_1fr_8rem_5rem] items-center gap-4 px-4 sm:px-6 py-3 bg-zinc-50/70 dark:bg-zinc-800/30 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
        >
          <div className="text-center">Rank</div>
          <div className="pl-1">User</div>
          <div className="text-right pr-2">League</div>
          <div className="text-right tabular-nums">XP</div>
        </div>

        {loading ? (
          <div className="space-y-0 p-4 sm:p-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 py-4 px-2 sm:px-4"
              >
                <Skeleton className="h-6 w-12 rounded-lg shrink-0" />
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <Skeleton className="h-4 flex-1 max-w-[180px] rounded" />
                <Skeleton className="h-5 w-16 rounded-md shrink-0" />
                <Skeleton className="h-5 w-14 rounded-md shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <div
            role="list"
            className="h-[400px] sm:h-[500px] md:h-[600px] overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-100 dark:[&::-webkit-scrollbar-track]:bg-zinc-800/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600"
          >
            {leagueOrder.map((league) => {
              const users = groupedUsers[league];
              if (!users || users.length === 0) return null;

              const leagueStyle = getLeagueInfo(users[0].xp);

              return (
                <div key={league}>
                  <div
                    className={cn(
                      "sticky top-0 z-10 px-4 sm:px-6 py-2.5 flex items-center gap-2 backdrop-blur-sm border-y",
                      leagueStyle.bg,
                      leagueStyle.border
                    )}
                  >
                    <leagueStyle.icon
                      className={cn("h-4 w-4 shrink-0", leagueStyle.color)}
                    />
                    <span
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-widest",
                        leagueStyle.color
                      )}
                    >
                      {league} League
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                    {users.map((user) => {
                      const globalRank =
                        leaderboard.findIndex((u) => u._id === user._id) + 1;
                      const isCurrentUser =
                        currentUser && currentUser._id === user._id;

                      return (
                        <div
                          key={user._id}
                          role="listitem"
                          tabIndex={0}
                          onClick={() =>
                            navigate(
                              isCurrentUser
                                ? "/profile"
                                : `/profile/${user._id}`,
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              navigate(
                                isCurrentUser
                                  ? "/profile"
                                  : `/profile/${user._id}`,
                              );
                            }
                          }}
                          className={cn(
                            "grid grid-cols-[4rem_1fr_6rem_4rem] md:grid-cols-[5rem_1fr_8rem_5rem] items-center gap-2 md:gap-4 px-4 sm:px-6 py-3 sm:py-3.5 transition-colors cursor-pointer min-h-[72px] md:min-h-0",
                            "hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-500 rounded-sm",
                            isCurrentUser &&
                              "bg-sky-50/70 dark:bg-sky-950/30 hover:bg-sky-50 dark:hover:bg-sky-950/40 ring-inset ring-1 ring-sky-200/60 dark:ring-sky-700/40"
                          )}
                        >
                          <div className="flex justify-start md:justify-center items-center gap-1.5 col-span-1">
                            {getRankIcon(globalRank)}
                            {globalRank <= 10 ? (
                              <span
                                className={cn(
                                  "text-sm font-bold tabular-nums",
                                  globalRank <= 3
                                    ? "text-zinc-900 dark:text-zinc-100"
                                    : "text-zinc-600 dark:text-zinc-400"
                                )}
                              >
                                {globalRank > 3 ? `#${globalRank}` : ""}
                              </span>
                            ) : (
                              <span className="text-sm font-bold text-zinc-400 dark:text-zinc-500 tabular-nums">
                                #{globalRank}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 md:pl-1">
                            <Avatar
                              className={cn(
                                "h-9 w-9 sm:h-10 sm:w-10 border-2 flex-shrink-0 ring-2 ring-zinc-100 dark:ring-zinc-800",
                                isCurrentUser
                                  ? "border-sky-300 dark:border-sky-600"
                                  : "border-white dark:border-zinc-700"
                              )}
                            >
                              <AvatarImage src={user.avatarUrl} />
                              <AvatarFallback className="bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-600 dark:to-zinc-700 text-zinc-600 dark:text-zinc-300">
                                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4
                                  className={cn(
                                    "font-semibold text-sm truncate",
                                    isCurrentUser
                                      ? "text-sky-700 dark:text-sky-300"
                                      : "text-zinc-900 dark:text-zinc-100"
                                  )}
                                >
                                  {user.name || user.username || "Anonymous"}
                                </h4>
                                {isCurrentUser && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] font-bold px-1.5 py-0 h-4 bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 border-0 shrink-0"
                                  >
                                    YOU
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                                Level {user.level}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-start md:justify-end md:pr-2 col-span-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-full text-[11px] font-bold border shrink-0",
                                leagueStyle.bg,
                                leagueStyle.color,
                                leagueStyle.border
                              )}
                            >
                              {league}
                            </Badge>
                          </div>

                          <div className="text-left md:text-right col-span-1">
                            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm tabular-nums">
                              {user.xp.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-1">
                              XP
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {leaderboard.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-zinc-500 dark:text-zinc-400">
                <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-4 mb-4">
                  <Trophy className="h-10 w-10 opacity-40" />
                </div>
                <p className="text-sm font-medium">No learners on the leaderboard yet.</p>
                <p className="text-xs mt-1">Be the first to earn XP and climb the ranks.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
