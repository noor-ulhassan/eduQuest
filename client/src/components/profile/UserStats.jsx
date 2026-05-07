import React, { useEffect, useState, useId, useRef } from "react";
import { useSelector } from "react-redux";
import { getLevelProgress } from "@/utils/levelUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black dark:text-neutral-200"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

const UserStats = () => {
  const user = useSelector((state) => state.auth.user);

  const name = user?.name || "Guest User";
  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const rank = user?.rank || "Bronze";
  const badges = user?.badges?.length || 0;
  const dayStreak = user?.dayStreak || 0;
  const avatarUrl = user?.avatarUrl || "/Avatar.png";

  const {
    xpInLevel: xpInCurrentLevel,
    xpToNextLevel,
    progressPercent: progressPercentage,
  } = getLevelProgress(xp, level);

  const [animatedXP, setAnimatedXP] = useState(0);
  const [animatedBadges, setAnimatedBadges] = useState(0);
  const [animatedStreak, setAnimatedStreak] = useState(0);

  const [active, setActive] = useState(false);
  const ref = useRef(null);
  const id = useId();

  useOutsideClick(ref, () => setActive(false));

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }
    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

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
      bg: "bg-yellow-900/20",
      textClass: "text-yellow-500",
      borderClass: "border-yellow-900",
    },
    {
      label: "Rank",
      value: rank,
      icon: "/level_1.png",
      bg: "bg-zinc-900/50",
      textClass: "text-zinc-300",
      borderClass: "border-zinc-800",
    },
    {
      label: "Badges",
      value: animatedBadges,
      icon: "/badge.png",
      bg: "bg-zinc-900/50",
      textClass: "text-zinc-300",
      borderClass: "border-zinc-800",
    },
    {
      label: "Day Streak",
      value: animatedStreak,
      icon: "/fire.png",
      bg: "bg-orange-900/20",
      textClass: "text-orange-500",
      borderClass: "border-orange-900/50",
    },
  ];

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm h-full w-full z-40"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-50 p-4 pointer-events-none">
            <motion.button
              key={`button-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-4 right-4 sm:top-8 sm:right-8 items-center justify-center bg-neutral-800 rounded-full h-10 w-10 shadow-lg z-[60] pointer-events-auto cursor-pointer"
              onClick={() => setActive(false)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${id}`}
              ref={ref}
              className="w-full max-w-[600px] h-fit max-h-[90vh] overflow-y-auto flex flex-col bg-[#111] rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 pointer-events-auto no-scrollbar"
            >
              <div className="p-6 sm:p-8 relative z-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 mb-6 sm:mb-8">
                  <motion.div
                    layoutId={`image-${id}`}
                    className="relative shrink-0 mx-auto sm:mx-0"
                  >
                    <img
                      src={avatarUrl}
                      alt={`${name}'s Avatar`}
                      className="w-24 h-24 rounded-full border-2 border-zinc-900 relative z-10 object-cover shadow-sm"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="w-24 h-24 rounded-full border-2 border-zinc-900 relative z-10 bg-orange-600 hidden items-center justify-center text-white font-bold text-3xl shadow-sm">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-[#111] rounded-full z-20 shadow-sm"></span>
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <motion.h3
                      layoutId={`title-${id}`}
                      className="text-2xl text-white font-black truncate tracking-tight"
                    >
                      {name}
                    </motion.h3>
                    <motion.div
                      layoutId={`level-${id}`}
                      className="mt-1 flex items-center gap-2"
                    >
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-bold text-white shadow-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
                        }}
                      >
                        Level {level}
                      </span>
                    </motion.div>
                    <motion.div layoutId={`progress-${id}`} className="mt-4">
                      <Progress
                        value={progressPercentage}
                        className="h-3 bg-zinc-800"
                        indicatorClassName="bg-gradient-to-r from-yellow-400 to-orange-500"
                      />
                    </motion.div>
                    <motion.p
                      layoutId={`xp-text-${id}`}
                      className="text-xs font-semibold text-zinc-400 mt-2 uppercase tracking-wide"
                    >
                      {xpToNextLevel} XP to Level {level + 1}
                    </motion.p>
                  </div>
                </div>

                <motion.div
                  layoutId={`grid-${id}`}
                  className="grid grid-cols-2 gap-3 sm:gap-4"
                >
                  {stats.map((stat, i) => (
                    <motion.div
                      layoutId={`stat-${stat.label}-${id}`}
                      key={i}
                      className={`flex items-center sm:items-start sm:flex-col text-left sm:text-center gap-3 sm:gap-2 p-3 sm:p-5 rounded-xl sm:rounded-2xl border ${stat.borderClass} ${stat.bg} shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform`}
                    >
                      <motion.div
                        layoutId={`stat-icon-wrapper-${stat.label}-${id}`}
                        className="w-10 h-10 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center"
                      >
                        <motion.img
                          layoutId={`stat-icon-${stat.label}-${id}`}
                          src={stat.icon}
                          alt={stat.label}
                          className="w-8 h-8 sm:w-12 sm:h-12 drop-shadow-sm group-hover:scale-110 transition-transform"
                        />
                      </motion.div>
                      <div className="min-w-0">
                        <motion.p
                          layoutId={`stat-val-${stat.label}-${id}`}
                          className={`font-black text-lg sm:text-3xl leading-tight truncate ${stat.textClass} drop-shadow-sm`}
                        >
                          {stat.value}
                        </motion.p>
                        <motion.p
                          layoutId={`stat-label-${stat.label}-${id}`}
                          className="text-[11px] sm:text-sm font-bold text-zinc-400 uppercase tracking-wider truncate sm:mt-1"
                        >
                          {stat.label}
                        </motion.p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <motion.div
        layoutId={`card-${id}`}
        onClick={() => setActive(!active)}
        className="w-full max-w-md mx-auto mb-4 overflow-hidden border border-white/10 rounded-xl shadow-lg group relative bg-[#111] cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="p-6 relative z-10 pointer-events-none">
          <div className="flex items-center gap-5">
            <motion.div layoutId={`image-${id}`} className="relative shrink-0">
              <img
                src={avatarUrl}
                alt={`${name}'s Avatar`}
                className="w-20 h-20 rounded-full border-2 border-zinc-900 relative z-10 object-cover shadow-sm transition-all"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="w-20 h-20 rounded-full border-2 border-zinc-900 relative z-10 bg-orange-600 hidden items-center justify-center text-white font-bold text-2xl shadow-sm transition-all">
                {name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-[#111] rounded-full z-20 shadow-sm transition-all"></span>
            </motion.div>

            <div className="flex-1 min-w-0">
              <motion.h3
                layoutId={`title-${id}`}
                className="text-xl text-white font-black truncate tracking-tight"
              >
                {name}
              </motion.h3>
              <motion.div
                layoutId={`level-${id}`}
                className="mt-1 flex items-center gap-2"
              >
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold text-white shadow-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
                  }}
                >
                  Level {level}
                </span>
              </motion.div>

              <motion.div layoutId={`progress-${id}`} className="mt-3">
                <Progress
                  value={progressPercentage}
                  className="h-2.5 bg-zinc-800"
                  indicatorClassName="bg-gradient-to-r from-yellow-400 to-orange-500"
                />
              </motion.div>
              <motion.p
                layoutId={`xp-text-${id}`}
                className="text-[11px] font-semibold text-zinc-400 mt-1.5 uppercase tracking-wide flex justify-between items-center"
              >
                <span>{xpToNextLevel} XP Left</span>
                <span className="text-orange-400 hover:text-orange-600 transition-colors md:hidden">
                  See Stats &rarr;
                </span>
              </motion.p>
            </div>
          </div>

          <motion.div
            layoutId={`grid-${id}`}
            className="hidden md:grid mt-8 grid-cols-2 gap-3"
          >
            {stats.map((stat, i) => (
              <motion.div
                layoutId={`stat-${stat.label}-${id}`}
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl border ${stat.borderClass} ${stat.bg} shadow-sm relative overflow-hidden`}
              >
                <motion.div
                  layoutId={`stat-icon-wrapper-${stat.label}-${id}`}
                  className="w-10 h-10 shrink-0 flex items-center justify-center"
                >
                  <motion.img
                    layoutId={`stat-icon-${stat.label}-${id}`}
                    src={stat.icon}
                    alt={stat.label}
                    className="w-8 h-8 drop-shadow-sm"
                  />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <motion.p
                    layoutId={`stat-val-${stat.label}-${id}`}
                    className={`font-black text-lg leading-tight truncate ${stat.textClass} drop-shadow-sm`}
                  >
                    {stat.value}
                  </motion.p>
                  <motion.p
                    layoutId={`stat-label-${stat.label}-${id}`}
                    className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider truncate"
                  >
                    {stat.label}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default UserStats;
