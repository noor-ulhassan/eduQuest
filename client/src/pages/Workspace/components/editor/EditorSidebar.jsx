import React from "react";
import { BookOpen, ChevronRight, Code } from "lucide-react";

export default function EditorSidebar({ chapters, selectedIndex, onSelect, courseName }) {
  return (
    <aside className="w-72 shrink-0 bg-[#111] border-r border-white/10 flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-white/10">
        <h2 className="text-sm font-bold text-white truncate">{courseName || "Course"}</h2>
        <p className="text-[10px] text-zinc-500 mt-1">{chapters.length} chapters</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {chapters.map((ch, idx) => {
          const isActive = idx === selectedIndex;
          const blockCount = ch.blocks?.length || ch.topics?.length || 0;
          const exerciseCount = ch.exercises?.length || 0;

          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              <span className={`flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold shrink-0 ${
                isActive ? "bg-white/20" : "bg-white/5"
              }`}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {ch.chapterName || `Chapter ${idx + 1}`}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-zinc-500 flex items-center gap-0.5">
                    <BookOpen className="w-2.5 h-2.5" /> {blockCount}
                  </span>
                  {exerciseCount > 0 && (
                    <span className="text-[9px] text-emerald-500 flex items-center gap-0.5">
                      <Code className="w-2.5 h-2.5" /> {exerciseCount}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white/60" : "text-zinc-600"}`} />
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
