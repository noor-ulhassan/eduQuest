import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getGlobalLeaderboard } from "../../features/leaderboard/leaderboardApi";
import {
  Trophy,
  Medal,
  Crown,
  User as UserIcon,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Leaderboard = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
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
    <Card className="w-full max-w-[1240px] mx-auto mt-12 bg-white/50 backdrop-blur-sm border-zinc-200/60 shadow-xl overflow-hidden">
      <CardHeader className="pb-6 border-b border-gray-100 bg-white/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src="/trophy.gif"
              alt="Target"
              className="w-20 h-20 rounded-full object-contain"
            />

            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Global Leaderboard
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Top learners around the world
              </p>
            </div>
          </div>

          {currentUser && nextTarget && (
            <div className="flex-1 max-w-md bg-zinc-50 rounded-xl p-4 border border-zinc-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-zinc-700">
                  Current League:{" "}
                  <span className={userLeague.color}>{userLeague.name}</span>
                </span>
                <span className="text-xs text-zinc-500">
                  {currentUser.xp} / {nextTarget.target} XP
                </span>
              </div>

              <Progress
                value={userProgress}
                className="h-2 w-full bg-zinc-200"
                indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-600"
              />

              <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                <TrendingUp size={14} className="text-green-500" />
                Earn{" "}
                <span className="font-bold text-zinc-700">
                  {(nextTarget.target - currentUser.xp).toLocaleString()} XP
                </span>{" "}
                to reach {nextTarget.name} League
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex items-center px-6 py-3 bg-zinc-50/50 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
          <div className="w-20 text-center">Rank</div>
          <div className="flex-1 pl-4">User</div>
          <div className="w-32 text-right pr-4">League</div>
          <div className="w-24 text-right">XP</div>
        </div>

        {loading ? (
          <div className="space-y-4 p-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
            {leagueOrder.map((league) => {
              const users = groupedUsers[league];
              if (!users || users.length === 0) return null;

              const leagueStyle = getLeagueInfo(users[0].xp); // Get style from first user in league

              return (
                <div key={league}>
                  {/* League Separator Header */}
                  <div
                    className={`sticky top-0 z-10 px-6 py-2 ${leagueStyle.bg} backdrop-blur-md border-y ${leagueStyle.border} flex items-center gap-2`}
                  >
                    <leagueStyle.icon
                      className={`w-4 h-4 ${leagueStyle.color}`}
                    />
                    <span
                      className={`text-xs font-bold ${leagueStyle.color} uppercase tracking-widest`}
                    >
                      {league} League
                    </span>
                  </div>

                  <div className="divide-y divide-gray-50">
                    {users.map((user) => {
                      // Calculate global rank by finding index in original sorted list + 1
                      const globalRank =
                        leaderboard.findIndex((u) => u._id === user._id) + 1;
                      const isCurrentUser =
                        currentUser && currentUser._id === user._id;

                      return (
                        <div
                          key={user._id}
                          className={`flex items-center px-6 py-4 transition-colors hover:bg-zinc-50 ${isCurrentUser ? "bg-blue-50/50 hover:bg-blue-50" : ""}`}
                        >
                          {/* Rank */}
                          <div className="w-20 flex justify-center items-center gap-1">
                            {getRankIcon(globalRank)}
                            {/* Show Sr No. for top 10 always, or for all. User said "for top 10" */}
                            {globalRank <= 10 ? (
                              <span
                                className={`text-sm font-bold ${globalRank <= 3 ? "text-gray-900" : "text-gray-500"}`}
                              >
                                {globalRank > 3 ? `#${globalRank}` : ""}
                              </span>
                            ) : (
                              <span className="text-sm font-bold text-gray-400">
                                #{globalRank}
                              </span>
                            )}
                          </div>

                          {/* User */}
                          <div className="flex-1 flex items-center gap-4 pl-4 min-w-0">
                            <Avatar
                              className={`h-10 w-10 border-2 ${isCurrentUser ? "border-blue-200" : "border-white"} shadow-sm ring-2 ring-gray-100`}
                            >
                              <AvatarImage src={user.avatarUrl} />
                              <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200">
                                <UserIcon className="w-5 h-5 text-gray-400" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4
                                  className={`font-bold text-sm truncate ${isCurrentUser ? "text-blue-700" : "text-gray-900"}`}
                                >
                                  {user.name || user.username || "Anonymous"}
                                </h4>
                                {isCurrentUser && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-600">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 font-medium">
                                Level {user.level}
                              </p>
                            </div>
                          </div>

                          {/* League Badge */}
                          <div className="w-32 flex justify-end pr-4">
                            <div
                              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${leagueStyle.bg} ${leagueStyle.color} ${leagueStyle.border} shadow-sm`}
                            >
                              {league}
                            </div>
                          </div>

                          {/* XP */}
                          <div className="w-24 text-right">
                            <span className="font-mono font-bold text-gray-900 text-sm">
                              {user.xp.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-400 ml-1">
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
              <div className="text-center py-20 text-gray-400">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No learners found on the leaderboard yet.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
