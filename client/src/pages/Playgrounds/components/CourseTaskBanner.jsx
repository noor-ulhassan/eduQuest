import React from "react";
import { Terminal, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { clearTask } from "../../../features/playground/playgroundTaskSlice";

export default function CourseTaskBanner({ activeTask }) {
  const dispatch = useDispatch();
  if (!activeTask) return null;
  return (
    <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-5 shadow-lg shadow-red-500/10">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
            Course Task
          </span>
        </div>
        <button
          onClick={() => dispatch(clearTask())}
          className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
        {activeTask.instruction}
      </p>
    </div>
  );
}
