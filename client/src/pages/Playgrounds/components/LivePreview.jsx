import React from "react";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LivePreview({ iframeRef, testResult, isMobile }) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
      {/* Browser chrome */}
      <div className="px-4 py-2.5 bg-[#111111] border-b border-white/10 flex items-center gap-3">
        <div className="flex gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[11px] text-zinc-500 font-medium bg-[#1a1a1a] px-4 py-0.5 rounded border border-white/10">
            preview
          </span>
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
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
          }}
        >
          {testResult.success ? <CheckCircle className="w-3.5 h-3.5" /> : <span>✗</span>}
          {testResult.message}
        </motion.div>
      )}
    </div>
  );
}
