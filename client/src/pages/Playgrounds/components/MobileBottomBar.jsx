import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, ChevronRight, GraduationCap, Loader2, Play, Terminal, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileBottomBar({ isRunning, testResult, handleRunCode, goToNextProblem, setIsSidebarOpen }) {
  const navigate = useNavigate();

  const navItems = [
    { icon: GraduationCap, label: "LEARN",    active: true,  action: () => setIsSidebarOpen(true) },
    { icon: Terminal,      label: "PRACTICE", active: false, action: () => navigate("/playground") },
    { icon: BarChart2,     label: "RANKING",  active: false, action: () => navigate("/leaderboard") },
    { icon: User,          label: "PROFILE",  active: false, action: () => navigate("/profile") },
  ];

  return (
    <>
      <div className="px-4 pb-4 pt-2 bg-[#0a0a0a] shrink-0 flex gap-3">
        <button
          onClick={handleRunCode} disabled={isRunning || testResult?.success}
          className="flex-1 h-[56px] bg-[#2cf07d] hover:bg-[#2cf09d] disabled:opacity-50 text-black font-bold text-[17px] tracking-wide rounded-[20px] flex items-center justify-center gap-2.5 transition-colors"
        >
          {isRunning ? <><Loader2 className="w-5 h-5 animate-spin" /> RUNNING…</> : <><Play className="w-5 h-5 fill-current" /> RUN CODE</>}
        </button>
        {testResult?.success && (
          <button onClick={goToNextProblem} className="flex-1 h-[56px] bg-[#34d399] hover:bg-[#10b981] text-black font-bold text-[17px] tracking-wide rounded-[20px] flex items-center justify-center gap-2.5 transition-colors animate-in slide-in-from-right-4">
            NEXT <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex items-center justify-around py-3 border-t border-white/10 bg-[#111111] shrink-0">
        {navItems.map((item) => (
          <button key={item.label} onClick={item.action}
            className={cn("flex flex-col items-center gap-1.5 text-[10px] font-bold tracking-widest transition-colors", item.active ? "text-red-400" : "text-zinc-500 hover:text-zinc-400")}
          >
            <item.icon className={cn("w-6 h-6", item.active && "fill-red-400/20")} />
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}
