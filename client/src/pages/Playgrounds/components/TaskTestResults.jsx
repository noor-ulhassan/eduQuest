import React from "react";
import { Loader2, Play } from "lucide-react";

export default function TaskTestResults({ handleRunTask, isRunningTask, taskTestResults }) {
  return (
    <div className="space-y-3">
      <button
        onClick={handleRunTask} disabled={isRunningTask}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
      >
        {isRunningTask ? <><Loader2 className="w-4 h-4 animate-spin" /> Running Tests…</> : <><Play className="w-4 h-4 fill-white" /> Run Task Tests</>}
      </button>

      {taskTestResults.length > 0 && (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 py-2 bg-[#111111] border-b border-white/10 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Test Results
          </div>
          <div className="divide-y divide-white/5">
            {taskTestResults.map((r, i) => (
              <div key={i} className={`flex items-start gap-3 px-4 py-3 text-xs font-mono ${r.passed ? "bg-emerald-500/5" : "bg-red-500/5"}`}>
                <span className="shrink-0 mt-0.5 text-xs">{r.passed ? "✓" : "✗"}</span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  {r.input && <p className="text-zinc-500">in: <span className="text-zinc-300">{r.input}</span></p>}
                  <p className={r.passed ? "text-emerald-400" : "text-red-400"}>got: {r.actualOutput}</p>
                  {!r.passed && <p className="text-zinc-500">expected: {r.expectedOutput}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
