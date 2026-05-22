import React from "react";
import { CheckCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Terminal as MagicTerminal,
  TypingAnimation,
  AnimatedSpan,
} from "@/components/ui/terminal";

export default function OutputPanel({ output, testResult, isRunning, currentProblem }) {
  return (
    <div>
      {isRunning && (
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Executing…
        </div>
      )}
      {output && !isRunning && (
        <div className="space-y-4 my-2">
          {output.text && (
            <MagicTerminal
              key={`out-${currentProblem?.id}-${output.text.length}`}
              startOnView={false}
              className="w-full max-w-full bg-[#111111] border-white/10 shadow-xl"
            >
              <AnimatedSpan className="text-zinc-400 mb-2 font-mono">Output:</AnimatedSpan>
              <TypingAnimation
                className="text-emerald-400 whitespace-pre-wrap font-mono mt-2 block"
                duration={10}
                startOnView={false}
              >
                {output.text}
              </TypingAnimation>
            </MagicTerminal>
          )}
          {output.error && (
            <MagicTerminal
              key={`err-${currentProblem?.id}-${output.error.length}`}
              startOnView={false}
              className="w-full max-w-full bg-red-950/10 border-red-500/20 shadow-xl"
            >
              <AnimatedSpan className="text-red-400/80 mb-2 font-mono">Error:</AnimatedSpan>
              <TypingAnimation
                className="text-red-400 whitespace-pre-wrap font-mono mt-2 block"
                duration={10}
                startOnView={false}
              >
                {output.error}
              </TypingAnimation>
            </MagicTerminal>
          )}
          {testResult && (
            <div
              className={cn(
                "rounded-xl p-4 border flex items-center gap-2 text-sm font-medium",
                testResult.success
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/5 border-red-500/20 text-red-400",
              )}
            >
              {testResult.success ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {testResult.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
