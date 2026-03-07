import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const UserStats = () => {
  const user = useSelector((state) => state.auth.user);

  const name = user?.name || "Guest User";
  const level = user?.level || 1;
  const xp = user?.xp || 0;
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

    // Initial trigger to avoid 0 state if xp is 0 but component mounts
    if (xp === 0) setAnimatedXP(0);
    if (badges === 0) setAnimatedBadges(0);
    if (dayStreak === 0) setAnimatedStreak(0);

    return () => clearInterval(interval);
  }, [xp, badges, dayStreak]);

  const stats = [
    {
      label: "Total XP",
      value: animatedXP,
      icon: "/star.png",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      textClass: "text-yellow-600 dark:text-yellow-500",
      borderClass: "border-yellow-200 dark:border-yellow-900",
    },
    {
      label: "Rank",
      value: rank,
      icon: "/level_1.png",
      bg: "bg-zinc-50 dark:bg-zinc-900/50",
      textClass: "text-zinc-700 dark:text-zinc-300",
      borderClass: "border-zinc-200 dark:border-zinc-800",
    },
    {
      label: "Badges",
      value: animatedBadges,
      icon: "/badge.png",
      bg: "bg-zinc-50 dark:bg-zinc-900/50",
      textClass: "text-zinc-700 dark:text-zinc-300",
      borderClass: "border-zinc-200 dark:border-zinc-800",
    },
    {
      label: "Day Streak",
      value: animatedStreak,
      icon: "/fire.png",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      textClass: "text-orange-600 dark:text-orange-500",
      borderClass: "border-orange-200 dark:border-orange-900/50",
    },
  ];

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-lg group relative">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl group-hover:bg-yellow-400/20 transition-all duration-700" />

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-5 mb-8">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full blur-[6px] opacity-40"></div>
            <img
              src={avatarUrl}
              alt={`${name}'s Avatar`}
              className="w-20 h-20 rounded-full border-2 border-white dark:border-zinc-900 relative z-10 object-cover shadow-sm"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            {/* Fallback avatar if error */}
            <div className="w-20 h-20 rounded-full border-2 border-white dark:border-zinc-900 relative z-10 bg-indigo-600 hidden items-center justify-center text-white font-bold text-2xl shadow-sm">
              {name.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-zinc-950 rounded-full z-20 shadow-sm"></span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl text-zinc-900 dark:text-white font-black truncate tracking-tight">
              {name}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold text-white shadow-sm"
                style={{
                  background:
                    "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
                }}
              >
                Level {level}
              </span>
            </div>

            <div className="mt-3">
              <Progress
                value={progressPercentage}
                className="h-2.5 bg-zinc-100 dark:bg-zinc-800"
                indicatorClassName="bg-gradient-to-r from-yellow-400 to-orange-500"
              />
            </div>
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-1.5 uppercase tracking-wide">
              {1000 - xpInCurrentLevel} XP to Level {level + 1}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl border ${stat.borderClass} ${stat.bg} hover:scale-[1.03] transition-transform duration-300 shadow-sm`}
            >
              <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                <img
                  src={stat.icon}
                  alt={stat.label}
                  className="w-8 h-8 drop-shadow-sm"
                />
              </div>
              <div className="min-w-0">
                <p
                  className={`font-black text-lg leading-tight truncate ${stat.textClass} drop-shadow-sm`}
                >
                  {stat.value}
                </p>
                <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStats;
