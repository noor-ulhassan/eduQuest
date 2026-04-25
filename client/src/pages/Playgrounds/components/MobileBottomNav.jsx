import React from "react";
import { MessageCircle, FileCode2, Play, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  handleRunCode,
  isRunning,
  isLivePreview,
  currentProblem,
  goToNextProblem
}) {
  return (
    <div className="h-[60px] shrink-0 border-t border-white/10 bg-[#0d0d0d] flex items-center justify-around px-2 z-20">
      <button
        onClick={() => setActiveTab("task")}
        className={cn(
          "flex flex-col items-center gap-1 px-3 transition-colors",
          activeTab === "task" ? "text-red-500" : "text-zinc-500"
        )}
      >
        <FileCode2 className="w-5 h-5" />
        <span className="text-[10px] font-bold">TASK</span>
      </button>

      <button
        onClick={() => setActiveTab("editor")}
        className={cn(
          "flex flex-col items-center gap-1 px-3 transition-colors",
          activeTab === "editor" ? "text-red-500" : "text-zinc-500"
        )}
      >
        <Play className="w-5 h-5" />
        <span className="text-[10px] font-bold">CODE</span>
      </button>

      <div className="relative -mt-10">
        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/40 border-4 border-[#0a0a0a] active:scale-95 transition-transform"
        >
          {isRunning ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
          )}
        </button>
      </div>

      <button
        onClick={() => setActiveTab("output")}
        className={cn(
          "flex flex-col items-center gap-1 px-3 transition-colors",
          activeTab === "output" ? "text-red-500" : "text-zinc-500"
        )}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-[10px] font-bold">TESTS</span>
      </button>

      <button
        onClick={goToNextProblem}
        className="flex flex-col items-center gap-1 px-3 text-zinc-500"
      >
        <ChevronRight className="w-5 h-5" />
        <span className="text-[10px] font-bold">NEXT</span>
      </button>
    </div>
  );
}
