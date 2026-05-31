import React from "react";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LivePreview({ iframeRef, testResult, isMobile }) {
  return (
    <div className="bg-[#161616] rounded-xl border border-white/[0.12] overflow-hidden">
      {/* Browser chrome */}
      <div className="px-4 py-2.5 bg-[#0e0e0e] border-b border-white/10 flex items-center gap-3">
        <div className="flex gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div
            className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono bg-[#1a1a1a] px-4 py-1 rounded-md"
            style={{ border: "1px solid rgba(255,255,255,0.07)", maxWidth: "200px", width: "100%" }}
          >
            <span className="text-zinc-600">●</span>
            <span className="flex-1 text-center">localhost / preview</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {testResult && (
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded",
                testResult.success ? "bg-emerald-500/20 text-[#2cf07d]" : "bg-red-500/20 text-red-400",
              )}
            >
              {testResult.success ? "✓ PASSED" : "✗ FAILED"}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
            </span>
            Live
          </span>
        </div>
      </div>

      <iframe
        ref={iframeRef}
        className="w-full border-0 bg-[#1a1a1a]"
        style={{ height: isMobile ? 180 : 250 }}
        title="Live Preview"
        sandbox="allow-scripts allow-same-origin"
      />

      {testResult && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2.5 border-t text-xs font-bold flex items-center gap-2.5"
          style={{
            background: testResult.success
              ? "linear-gradient(90deg, rgba(44,240,157,0.08), rgba(44,240,157,0.02))"
              : "linear-gradient(90deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))",
            borderTopColor: testResult.success ? "rgba(44,240,157,0.22)" : "rgba(239,68,68,0.22)",
            color: testResult.success ? "#2cf09d" : "#f87171",
            boxShadow: testResult.success ? "inset 0 1px 0 rgba(44,240,157,0.12)" : undefined,
          }}
        >
          {testResult.success ? <CheckCircle className="w-3.5 h-3.5" /> : <span>✗</span>}
          {testResult.message}
        </motion.div>
      )}
    </div>
  );
}
