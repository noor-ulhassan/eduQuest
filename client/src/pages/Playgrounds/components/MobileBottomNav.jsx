import React from "react";
import {
  MessageCircle,
  FileCode2,
  Play,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TABS = [
  { key: "task", label: "Task", Icon: FileCode2 },
  { key: "editor", label: "Code", Icon: Terminal },
];

const RIGHT_TABS = [
  { key: "output", label: "Tests", Icon: MessageCircle },
];

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  handleRunCode,
  isRunning,
  isLivePreview,
  currentProblem,
  goToNextProblem,
}) {
  const renderTab = ({ key, label, Icon }) => {
    const isActive = activeTab === key;
    return (
      <button
        key={key}
        onClick={() => setActiveTab(key)}
        className={cn(
          "relative flex flex-col items-center gap-0.5 px-3 py-1 transition-colors",
          isActive ? "text-red-400" : "text-zinc-500",
        )}
      >
        {/* Active indicator dot */}
        {isActive && (
          <motion.span
            layoutId="mobile-tab-dot"
            className="absolute -top-0.5 w-1.5 h-1.5 rounded-full bg-red-500"
            style={{ boxShadow: "0 0 8px rgba(239,68,68,0.7)" }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          />
        )}
        <Icon className={cn("w-5 h-5", isActive && "fill-red-400/10")} />
        <span
          className={cn(
            "text-[9px] font-black tracking-widest uppercase",
            isActive && "text-red-400",
          )}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <div
      className="h-[60px] shrink-0 flex items-center justify-around px-2 z-20 relative"
      style={{
        background: "rgba(13,13,13,0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* hair-line glow on top */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.35) 50%, transparent 100%)",
        }}
      />

      {TABS.map(renderTab)}

      {/* Floating RUN button */}
      <div className="relative -mt-10 px-1">
        <motion.button
          onClick={handleRunCode}
          disabled={isRunning}
          whileTap={{ scale: 0.92 }}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform"
          style={{
            background:
              "linear-gradient(135deg, #ef4444 0%, #dc2626 60%, #b91c1c 100%)",
            border: "4px solid #0a0a0a",
            boxShadow:
              "0 0 24px rgba(239,68,68,0.55), 0 6px 16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
          }}
        >
          {isRunning ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
          )}
        </motion.button>
      </div>

      {RIGHT_TABS.map(renderTab)}

      <button
        onClick={goToNextProblem}
        className="flex flex-col items-center gap-0.5 px-3 py-1 text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
        <span className="text-[9px] font-black tracking-widest uppercase">
          Next
        </span>
      </button>
    </div>
  );
}
