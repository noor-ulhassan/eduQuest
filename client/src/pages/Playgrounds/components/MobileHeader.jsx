import React from "react";
import { ArrowLeft, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MobileHeader({ title, xp, progressPercent }) {
  const navigate = useNavigate();
  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-white/[0.07] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate(-1)} className="text-zinc-300 hover:text-white p-0.5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-[15px] text-white truncate">{title}</h1>
        </div>
        <span className="flex items-center gap-2 bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full border border-red-500/20 shrink-0">
          <span className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
            <Star className="w-2.5 h-2.5 text-black fill-current" />
          </span>
          {xp} XP
        </span>
      </header>

      <div className="px-4 pb-3 shrink-0">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.15em] font-bold mb-2">
          <span className="text-red-500">Lesson Progress</span>
          <span className="text-white">{progressPercent}%</span>
        </div>
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </>
  );
}
