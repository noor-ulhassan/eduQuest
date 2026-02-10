import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const UserStats = () => {
  const user = useSelector((state) => state.auth.user);

  const xp = user?.xp || 0;
  // Calculate level based on XP (assuming 1000 XP per level)
  const calculatedLevel = Math.floor(xp / 1000) + 1;
  const level = user?.level || calculatedLevel;

  const xpInCurrentLevel = xp % 1000;
  const nextLevelXp = 1000;
  const progressPercentage = (xpInCurrentLevel / nextLevelXp) * 100;

  const name = user?.name || "Guest User";
  const dayStreak = user?.dayStreak || 0;
  const avatarUrl = user?.avatarUrl || "/Avatar.png";

  const getLeague = (xp) => {
    if (xp >= 20000) return "Diamond";
    if (xp >= 10000) return "Platinum";
    if (xp >= 5000) return "Gold";
    if (xp >= 1000) return "Silver";
    return "Bronze";
  };

  const getRankTitle = (level) => {
    if (level >= 100) return "GOAT";
    if (level >= 50) return "Grandmaster";
    if (level >= 40) return "Master";
    if (level >= 30) return "Skilled";
    if (level >= 3) return "";
    if (level >= 1) return "Amateur";
    return "Learner";
  };

  const league = getLeague(xp);
  const rankTitle = getRankTitle(level);

  const [animatedXP, setAnimatedXP] = useState(0);
  const [animatedStreak, setAnimatedStreak] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const stepTime = 30;
    const steps = Math.ceil(duration / stepTime);

    const xpStep = xp / steps;
    const streakStep = dayStreak / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setAnimatedXP(Math.min(xp, Math.floor(xpStep * currentStep)));
      setAnimatedStreak(
        Math.min(dayStreak, Math.floor(streakStep * currentStep)),
      );

      if (currentStep >= steps) clearInterval(interval);
    }, stepTime);

    return () => clearInterval(interval);
  }, [xp, dayStreak]);

  const stats = [
    {
      label: "Rank",
      value: rankTitle,
      icon: "/level_1.png",
      bg: "bg-gray-800",
      glow: "hover:shadow-indigo-500/20",
    },
    {
      label: "League",
      value: league,
      icon: "/badge.png",
      bg: "bg-yellow-900",
      glow: "hover:shadow-yellow-500/20",
    },
    {
      label: "Total XP",
      value: animatedXP.toLocaleString(),
      icon: "/star.png",
      bg: "bg-gray-800",
      glow: "hover:shadow-green-500/20",
    },
    {
      label: "Day Streak",
      value: `${animatedStreak} Days`,
      icon: "/fire.png",
      bg: "bg-gray-800",
      glow: "hover:shadow-orange-500/20",
    },
  ];

  return (
    <div className="bg-zinc-100 border border-zinc-800 rounded-2xl p-6  max-w-md mx-auto text-white">
      <div className="flex items-center gap-4 mb-6 relative">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full"></div>
          <img
            src={avatarUrl}
            alt={`${name}'s Avatar`}
            className="w-20 h-20 rounded-full border-2 border-gray-800 relative z-0 object-cover aspect-square"
          />
          <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-400  rounded-full"></span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg text-black font-bold">{name}</h3>
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500 text-white">
              Level {level}
            </span>
          </div>

          <div className="mt-2 h-2 w-full max-w-[160px] bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-2 bg-yellow-500 transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            {nextLevelXp - xpInCurrentLevel} XP to Level {level + 1}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-3 rounded-lg ${stat.bg} hover:scale-[1.05] transition-transform shadow-lg ${stat.glow} relative`}
          >
            <div className="w-10 h-10 flex items-center justify-center relative">
              <img src={stat.icon} alt={stat.label} className="w-full h-full" />
            </div>
            <div>
              <p className="font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-300">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserStats;
