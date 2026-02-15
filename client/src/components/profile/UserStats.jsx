import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const UserStats = () => {
  const user = useSelector((state) => state.auth.user);

  const name = user?.name || "Guest User";
  const level = user?.level || 1;
  const xp = user?.xp;
  const rank = user?.rank || "Bronze";
  const badges = user?.badges?.length || 0;
  const dayStreak = user?.dayStreak || 0;
  const avatarUrl = user?.avatarUrl || "/Avatar.png";

  const xpInCurrentLevel = xp % 1000;
  const progressPercentage = (xpInCurrentLevel / 1000) * 100;

  const [animatedXP, setAnimatedXP] = useState(0);
  const [animatedBadges, setAnimatedBadges] = useState(0);
  const [animatedStreak, setAnimatedStreak] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const stepTime = 30;
    const steps = Math.ceil(duration / stepTime);

    const xpStep = xp / steps;
    const badgesStep = badges / steps;
    const streakStep = dayStreak / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setAnimatedXP(Math.min(xp, Math.floor(xpStep * currentStep)));
      setAnimatedBadges(Math.min(badges, Math.floor(badgesStep * currentStep)));
      setAnimatedStreak(
        Math.min(dayStreak, Math.floor(streakStep * currentStep)),
      );

      if (currentStep >= steps) clearInterval(interval);
    }, stepTime);

    return () => clearInterval(interval);
  }, [xp, badges, dayStreak]);

  const stats = [
    {
      label: "Total XP",
      value: animatedXP,
      icon: "/star.png",
      bg: "bg-yellow-900",
    },
    {
      label: "Rank",
      value: rank,
      icon: "/level_1.png",
      bg: "bg-gray-800",
    },
    {
      label: "Badges",
      value: animatedBadges,
      icon: "/badge.png",
      bg: "bg-gray-800",
    },
    {
      label: "Day Streak",
      value: animatedStreak,
      icon: "/fire.png",
      bg: "bg-gray-800",
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
            {1000 - xpInCurrentLevel} XP to Level {level + 1}
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
