import React from "react";
import { Zap, Smartphone } from "lucide-react";

const Streak = () => {
  const days = ["Th", "F", "S", "Su", "M"];

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-zinc-400 border-b-4 shadow-sm w-full max-w-[340px] mt-16">
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-1">
          <span className="text-4xl font-bold text-black leading-tight">0</span>
          <Zap className="w-6 h-6 text-zinc-200 fill-zinc-200" />
        </div>
        <div className="flex gap-1.5 pt-1">
          <Smartphone className="w-4 h-4 text-zinc-200" />
          <Smartphone className="w-4 h-4 text-zinc-200" />
        </div>
      </div>

      <p className="text-zinc-500 text-[14px] mb-5">
        Solve <span className="font-bold text-zinc-900">3 problems</span> to
        start a streak
      </p>

      <div className="flex justify-between px-0.5">
        {days.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full border border-zinc-100 flex items-center justify-center bg-transparent">
              <Zap className="w-5 h-5 text-zinc-200" />
            </div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">
              {day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Streak;
