import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Zap, Smartphone } from "lucide-react";

const Streak = () => {
  const user = useSelector((state) => state.auth.user);
  const dayStreak = user?.dayStreak || 0;

  // Calculate last 5 days with streak status
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (4 - i));
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

      // Mark day as active if it's within the current streak
      const isActive = i >= 5 - dayStreak;

      return {
        day: dayName.substring(0, 2), // First 2 letters
        isActive,
      };
    });
  }, [dayStreak]);

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-zinc-400 border-b-4 shadow-sm w-full max-w-[340px] mt-16">
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-1">
          <span className="text-4xl font-bold text-black leading-tight">
            {dayStreak}
          </span>
          <Zap
            className={`w-6 h-6 ${dayStreak > 0 ? "text-yellow-500 fill-yellow-500" : "text-zinc-200 fill-zinc-200"}`}
          />
        </div>
        <div className="flex gap-1.5 pt-1">
          <Smartphone className="w-4 h-4 text-zinc-200" />
          <Smartphone className="w-4 h-4 text-zinc-200" />
        </div>
      </div>

      <p className="text-zinc-500 text-[14px] mb-5">
        {dayStreak > 0 ? (
          <>
            Solve <span className="font-bold text-zinc-900">1 problem</span> to
            continue your streak
          </>
        ) : (
          <>
            Solve <span className="font-bold text-zinc-900">1 problem</span> to
            start a streak
          </>
        )}
      </p>

      <div className="flex justify-between px-0.5">
        {days.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
                day.isActive
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-zinc-100 bg-transparent"
              }`}
            >
              <Zap
                className={`w-5 h-5 ${day.isActive ? "text-yellow-500 fill-yellow-500" : "text-zinc-200"}`}
              />
            </div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">
              {day.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Streak;
