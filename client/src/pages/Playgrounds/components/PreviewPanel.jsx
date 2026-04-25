import React from "react";
import { Terminal, Maximize2, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PreviewPanel({
  isLivePreview,
  iframeRef,
  isRunning,
  handleRunCode,
  output,
  testResult
}) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a] border-l border-white/5">
      <div className="h-10 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
            {isLivePreview ? "Live Preview" : "Output Terminal"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isLivePreview && (
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center gap-1.5 text-[10px] font-black text-red-500 hover:text-red-400 disabled:opacity-50 transition-colors tracking-tighter"
            >
              {isRunning ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              VALIDATE
            </button>
          )}
          <button className="text-zinc-600 hover:text-zinc-400">
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-black/20 overflow-hidden">
        {isLivePreview ? (
          <div className="w-full h-full bg-white relative">
            <iframe
              ref={iframeRef}
              title="Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-modals allow-forms"
            />
          </div>
        ) : (
          <div className="w-full h-full p-4 font-mono text-[13px] overflow-y-auto selection:bg-red-500/30">
            {output ? (
              <div
                className={cn(
                  "animate-in fade-in slide-in-from-bottom-1 duration-300",
                  output.error ? "text-red-400" : "text-zinc-300"
                )}
              >
                {output.text}
              </div>
            ) : (
              <div className="text-zinc-700 italic opacity-40">
                // Output will appear here after execution...
              </div>
            )}

            {testResult && (
              <div
                className={cn(
                  "mt-6 p-4 rounded-xl border animate-in zoom-in-95 duration-500",
                  testResult.success
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                )}
              >
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      testResult.success ? "bg-emerald-500" : "bg-red-500"
                    )}
                  />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                    {testResult.success ? "Passed" : "Failed"}
                  </span>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {testResult.message}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
