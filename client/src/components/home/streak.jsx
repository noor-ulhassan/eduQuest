import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Zap } from "lucide-react";

const Streak = () => {
  const user      = useSelector((state) => state.auth.user);
  const dayStreak = user?.dayStreak || 0;

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dayName  = date.toLocaleDateString("en-US", { weekday: "short" });
      const isActive = i >= 7 - dayStreak;
      return { day: dayName.substring(0, 2), isActive };
    });
  }, [dayStreak]);

  return (
    <div className="bg-white dark:bg-[#1a1730] rounded-[2rem] p-6 border border-zinc-300 dark:border-zinc-700 border-b-4 shadow-sm w-full max-w-[340px]">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1">
          <span className="text-4xl font-bold text-black dark:text-white leading-tight">{dayStreak}</span>
          <Zap
            className={`w-6 h-6 ${dayStreak > 0 ? "text-yellow-500 fill-yellow-500" : "text-zinc-200 fill-zinc-200"}`}
          />
        </div>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Day Streak</span>
      </div>

      <p className="text-zinc-500 dark:text-zinc-400 text-[13px] mb-5">
        {dayStreak > 0 ? (
          <>Solve <span className="font-bold text-zinc-900 dark:text-white">1 problem</span> to continue your streak</>
        ) : (
          <>Solve <span className="font-bold text-zinc-900 dark:text-white">1 problem</span> to start a streak</>
        )}
      </p>

      <div className="flex justify-between px-0.5">
        {days.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                day.isActive ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" : "border-zinc-100 dark:border-zinc-700 bg-transparent"
              }`}
            >
              <Zap
                className={`w-4 h-4 ${day.isActive ? "text-yellow-500 fill-yellow-500" : "text-zinc-200 fill-zinc-200"}`}
              />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{day.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Streak;
