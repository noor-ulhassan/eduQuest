import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getGlobalLeaderboard } from "../../features/leaderboard/leaderboardApi";
import {
  Trophy,
  Medal,
  Crown,
  User as UserIcon,
  Search,
  ChevronDown,
  Shield,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  // Sort all users unconditionally by XP descending for the overall list
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.xp - a.xp);

  // Identify top 3
  const top3 = sortedLeaderboard.slice(0, 3);
  const restOfLeaderboard = sortedLeaderboard.slice(3);

  // Helper for formatting tier names
  const formatTier = (name) => {
    return `${name} Tier`;
  };

  // Get rank class for podium glow
  const getPodiumGlowParams = (rank) => {
    switch (rank) {
      case 1:
        return {
          glow: "ring-[#eab308]",
          badgeBg: "bg-[#eab308] text-black",
          text: "text-[#3f48ef]",
        };
      case 2:
        return {
          glow: "ring-[#d1d5db]",
          badgeBg: "bg-[#d1d5db] text-black",
          text: "text-[#3f48ef]",
        };
      case 3:
        return {
          glow: "ring-[#f59e0b]",
          badgeBg: "bg-[#f59e0b] text-black",
          text: "text-[#3f48ef]",
        };
      default:
        return {
          glow: "",
          badgeBg: "bg-zinc-700 text-white",
          text: "text-zinc-400",
        };
    }
  };

  // ─── Render ───
  return (
    <div className="flex flex-col min-h-screen bg-[#0d0b1a] text-white font-sans overflow-hidden">
      {/* ── Navbar ── */}
      <header className="h-[70px] shrink-0 border-b border-[#1e1b38] bg-[#0d0b1a] flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-10 h-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3F48EF] flex items-center justify-center">
              <span className="font-bold text-white tracking-widest text-xs">
                EQ
              </span>
            </div>
            <span className="font-bold text-lg tracking-wide">EduQuest</span>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8 h-full">
            {["Dashboard", "Challenges", "Leaderboard", "Profile"].map(
              (link) => {
                const isActive = link === "Leaderboard";
                return (
                  <button
                    key={link}
                    onClick={() => {
                      if (link === "Dashboard") navigate("/");
                      if (link === "Challenges") navigate("/playground");
                      if (link === "Profile") navigate("/profile");
                    }}
                    className={cn(
                      "h-full px-1 text-[13px] font-bold tracking-wide transition-colors relative flex items-center",
                      isActive
                        ? "text-[#3F48EF]"
                        : "text-zinc-400 hover:text-white",
                    )}
                  >
                    {link}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3F48EF] rounded-t-full" />
                    )}
                  </button>
                );
              },
            )}
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-[#1e1b38] rounded-full px-4 py-2 border border-[#2d2755]">
            <Search className="w-4 h-4 text-zinc-500 mr-2" />
            <input
              type="text"
              placeholder="Find players..."
              className="bg-transparent text-sm focus:outline-none text-white w-40 placeholder:text-zinc-500"
            />
          </div>
          <button className="bg-[#3F48EF] hover:bg-[#343cc4] text-white text-[13px] font-bold px-5 py-2.5 rounded-full transition-colors hidden sm:block">
            Upgrade Pro
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-transparent hover:border-zinc-600 transition-colors overflow-hidden flex items-center justify-center shrink-0"
          >
            {currentUser?.imageUrl ? (
              <img
                src={currentUser.imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="w-full h-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center">
                {currentUser?.name?.charAt(0) || "U"}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Main content area ── */}
      <div className="flex-1 overflow-y-auto pb-32 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#2d2755]">
        <div className="max-w-[1000px] mx-auto px-6 pt-12">
          {/* Header & Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-bold mb-2">Hall of Fame</h1>
              <p className="text-zinc-400 text-[15px]">
                Global ranking based on total XP earned.
              </p>
            </div>
            <div className="flex items-center bg-[#1e1b38] rounded-lg p-1.5 border border-[#2d2755]">
              {["Global", "Friends", "Monthly"].map((filter) => (
                <button
                  key={filter}
                  className={cn(
                    "px-6 py-2 rounded-md text-sm font-bold transition-all",
                    filter === "Global"
                      ? "bg-[#2d2755] text-white shadow"
                      : "text-zinc-400 hover:text-white",
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Top 3 Podium */}
          {!loading && top3.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
              {/* 2nd Place */}
              {top3[1] && (
                <div className="w-[260px] bg-[#161B2E] border border-[#2d2755] rounded-3xl p-6 flex flex-col items-center mt-8 relative">
                  <div className="relative mb-4">
                    <img
                      src={
                        top3[1].avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[1]._id}`
                      }
                      alt="avatar"
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-[#161B2E] outline outline-4 outline-[#d1d5db]"
                    />
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#d1d5db] text-black font-bold flex items-center justify-center rounded-full text-sm border-2 border-[#161B2E]">
                      2
                    </div>
                  </div>
                  <h3 className="font-bold text-lg">
                    {top3[1].username || top3[1].name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-zinc-400 text-sm mt-1 mb-4">
                    {(() => {
                      const Icon = getLeagueInfo(top3[1].xp).icon;
                      return <Icon className="w-3.5 h-3.5 text-zinc-400" />;
                    })()}
                    {formatTier(getLeagueInfo(top3[1].xp).name)}
                  </div>
                  <div className="text-[#3F48EF] font-bold text-lg">
                    {top3[1].xp.toLocaleString()} XP
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <div className="w-[300px] bg-gradient-to-b from-[#1c1836] to-[#0d0b1a] border border-[#3F48EF]/30 rounded-[32px] p-8 flex flex-col items-center relative shadow-[0_0_40px_-10px_rgba(63,72,239,0.3)] z-10">
                  <div className="absolute -top-6 text-yellow-500">
                    <Crown className="w-12 h-12 fill-yellow-500 stroke-black stroke-2" />
                  </div>
                  <div className="relative mb-5 mt-4">
                    <img
                      src={
                        top3[0].avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[0]._id}`
                      }
                      alt="avatar"
                      className="w-28 h-28 rounded-full object-cover ring-4 ring-[#161B2E] outline outline-4 outline-[#eab308] shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                    />
                    <div className="absolute -bottom-1 -right-2 w-8 h-8 bg-[#eab308] text-black font-bold flex items-center justify-center rounded-full text-sm border-4 border-[#161B2E]">
                      1
                    </div>
                  </div>
                  <h3 className="font-bold text-2xl">
                    {top3[0].username || top3[0].name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-yellow-500 text-sm mt-1 mb-6 font-semibold">
                    {(() => {
                      const Icon = getLeagueInfo(top3[0].xp).icon;
                      return <Icon className="w-4 h-4 fill-yellow-500" />;
                    })()}
                    Grandmaster
                  </div>
                  <div className="text-[#3F48EF] font-extrabold text-2xl tracking-wide font-mono">
                    {top3[0].xp.toLocaleString()} XP
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div className="w-[260px] bg-[#161B2E] border border-[#2d2755] rounded-3xl p-6 flex flex-col items-center mt-8 relative">
                  <div className="relative mb-4">
                    <img
                      src={
                        top3[2].avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[2]._id}`
                      }
                      alt="avatar"
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-[#161B2E] outline outline-4 outline-[#f59e0b]"
                    />
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#f59e0b] text-black font-bold flex items-center justify-center rounded-full text-sm border-2 border-[#161B2E]">
                      3
                    </div>
                  </div>
                  <h3 className="font-bold text-lg">
                    {top3[2].username || top3[2].name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-zinc-400 text-sm mt-1 mb-4">
                    {(() => {
                      const Icon = getLeagueInfo(top3[2].xp).icon;
                      return <Icon className="w-3.5 h-3.5 text-zinc-400" />;
                    })()}
                    {formatTier(getLeagueInfo(top3[2].xp).name)}
                  </div>
                  <div className="text-[#3F48EF] font-bold text-lg">
                    {top3[2].xp.toLocaleString()} XP
                  </div>
                </div>
              )}
            </div>
          )}

          {/* List Headers */}
          <div className="grid grid-cols-[3rem_minmax(150px,2fr)_minmax(150px,1.5fr)_1fr_4rem] gap-4 px-6 text-[11px] font-bold text-zinc-500 tracking-[0.2em] mb-4 pb-4 border-b border-[#2d2755]">
            <div>RANK</div>
            <div>PLAYER</div>
            <div>TIER</div>
            <div className="text-right">XP</div>
            <div className="text-right">ACTION</div>
          </div>

          {/* List Content */}
          <div className="space-y-3">
            {loading ? (
              // Skeletons
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#161B2E] border border-[#2d2755] rounded-xl h-[72px] px-6 flex items-center gap-4"
                >
                  <Skeleton className="w-6 h-6 rounded bg-[#2d2755] shrink-0" />
                  <Skeleton className="w-10 h-10 rounded-full bg-[#2d2755] shrink-0" />
                  <Skeleton className="h-4 w-32 bg-[#2d2755]" />
                  <div className="flex-1" />
                  <Skeleton className="h-4 w-20 bg-[#2d2755]" />
                </div>
              ))
            ) : restOfLeaderboard.length > 0 ? (
              // Actual remaining list
              restOfLeaderboard.map((user, idx) => {
                const globalRank = idx + 4; // since top 3 are extracted
                const leagueStyle = getLeagueInfo(user.xp);
                return (
                  <div
                    key={user._id}
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="group bg-[#161B2E] hover:bg-[#1e1b38] border border-[#2d2755] hover:border-[#3F48EF]/50 transition-colors rounded-xl h-[76px] px-6 grid grid-cols-[3rem_minmax(150px,2fr)_minmax(150px,1.5fr)_1fr_4rem] items-center gap-4 cursor-pointer"
                  >
                    <div className="font-bold text-zinc-400 text-lg">
                      #{globalRank}
                    </div>
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          user.avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user._id}`
                        }
                        alt="avatar"
                        className="w-10 h-10 rounded-full bg-[#2d2755]"
                      />
                      <span className="font-bold text-[15px]">
                        {user.username || user.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2.5 h-2.5 rounded-full border border-black",
                            `bg-[${leagueStyle.color.replace("text-", "")}]`,
                          )}
                        />
                        <span className="text-sm font-medium text-zinc-300">
                          {formatTier(leagueStyle.name)}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#2d2755] text-zinc-400 text-[10px] font-bold">
                        Lvl {user.level || 1}
                      </span>
                    </div>
                    <div className="text-right font-bold text-[15px] tabular-nums">
                      {user.xp.toLocaleString()}
                    </div>
                    <div className="flex justify-end pr-2">
                      <ChevronDown className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity -rotate-90" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center text-zinc-500 font-medium">
                No subsequent ranks found.
              </div>
            )}
          </div>

          {!loading && restOfLeaderboard.length >= 5 && (
            <button className="w-full mt-6 py-4 rounded-xl border border-dashed border-[#2d2755] text-zinc-400 font-bold text-sm tracking-wide hover:bg-[#1e1b38] hover:text-white transition-colors flex items-center justify-center gap-2">
              View More Ranks <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Sticky Bottom Bar ── */}
      {currentUser && (
        <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-[#0A0914] border-t border-[#1e1b38] z-30 px-6 sm:px-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full border border-[#2d2755] flex items-center justify-center text-[#3F48EF] font-bold text-xl bg-[#1e1b38]/50">
              {leaderboard.findIndex((u) => u._id === currentUser._id) + 1 ||
                "-"}
            </div>
            <img
              src={
                currentUser.imageUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser._id}`
              }
              alt="My Avatar"
              className="w-12 h-12 rounded-full ring-2 ring-[#3F48EF]"
            />
            <div>
              <div className="text-[#3F48EF] text-[10px] font-extrabold tracking-widest uppercase mb-0.5">
                Your Rank
              </div>
              <div className="font-bold text-[17px]">
                {currentUser.username || currentUser.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-12">
            <div className="hidden sm:block">
              <div className="text-zinc-500 text-xs mb-1">Current XP</div>
              <div className="font-bold text-xl tabular-nums">
                {currentUser.xp.toLocaleString()}{" "}
                <span className="text-[#3F48EF] text-sm font-extrabold ml-0.5">
                  XP
                </span>
              </div>
            </div>

            {nextTarget && (
              <div className="w-[300px] hidden md:block">
                <div className="flex justify-between text-[11px] mb-2 font-bold text-zinc-400">
                  <span>{userLeague?.name || "Bronze"} Tier</span>
                  <span>Next: {nextTarget.name.substring(0, 4)}</span>
                </div>
                <div className="h-2 rounded-full bg-[#1e1b38] overflow-hidden">
                  <div
                    className="h-full bg-[#3F48EF] rounded-full"
                    style={{ width: `${userProgress}%` }}
                  />
                </div>
                <div className="text-right text-[10px] text-zinc-500 mt-2 font-medium">
                  {(nextTarget.target - currentUser.xp).toLocaleString()} XP to
                  tier up
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
