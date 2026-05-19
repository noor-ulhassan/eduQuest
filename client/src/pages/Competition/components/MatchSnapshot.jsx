import React from "react";
import { LayoutGrid } from "lucide-react";

const MODE_CONFIG = {
  classic:  { iconSrc: "/game.png",   label: "Classic",     color: "#f97316" },
  survival: { iconSrc: "/survival.png",  label: "Survival",    color: "#ef4444" },
  blitz:    { iconSrc: "/blitz.png",    label: "Blitz",        color: "#eab308" },
  team:     { iconSrc: "/team.png",  label: "Team Battle",  color: "#06b6d4" },
  duel:     { iconSrc: "/swords-silver.png", label: "Duel",         color: "#a855f7" },
  practice: { iconSrc: "/practice.png", label: "Practice",     color: "#71717a" },
};

const DIFFICULTY_CONFIG = {
  easy:   { color: "#22c55e", label: "Easy"   },
  medium: { color: "#f97316", label: "Medium" },
  hard:   { color: "#ef4444", label: "Hard"   },
};

const Row = ({ label, value, valueColor, accent }) => (
  <div
    className="flex items-center justify-between py-2.5"
    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
  >
    <span className="text-[11px] text-zinc-600 font-medium">{label}</span>
    <span className="text-[12px] font-bold capitalize" style={{ color: valueColor || "#a1a1aa" }}>
      {value}
    </span>
  </div>
);

const MatchSnapshot = ({ settings }) => {
  const mode = MODE_CONFIG[settings.gameMode] || MODE_CONFIG.classic;
  const difficulty = DIFFICULTY_CONFIG[settings.difficulty] || DIFFICULTY_CONFIG.medium;
  const durationMins = Math.round(settings.timerDuration / 60);
  const { iconSrc, label: modeLabel, color: modeColor } = mode;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#0c0c0c", border: "1px solid #1a1a1a" }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-900/80 flex items-center gap-2.5">
        <div className="flex items-center justify-center shrink-0">
          <img
            src={iconSrc}
            alt={modeLabel}
            className="w-6 h-6 object-contain"
          />
        </div>
        <div>
          <span className="text-sm font-semibold text-metallic">Match Preview</span>
          <p className="text-[10px] text-zinc-600 leading-tight">Current settings at a glance</p>
        </div>
      </div>

      {/* Rows */}
      <div className="px-5 pb-1">
        <Row label="Mode"       value={modeLabel}                         valueColor={modeColor} />
        <Row label="Category"   value={settings.category === "programming" ? "Programming" : "General"} />
        <Row label="Difficulty" value={difficulty.label}                  valueColor={difficulty.color} />
        <Row label="Questions"  value={`${settings.totalQuestions}`} />
        <Row label="Duration"   value={`${durationMins}m`} />
        {settings.topic && (
          <Row label="Topic" value={settings.topic} valueColor="#71717a" />
        )}
      </div>

      {/* Footer note */}
      <div className="px-5 py-3">
        <p className="text-[10px] text-zinc-700 text-center">
          Guests see these settings while they wait
        </p>
      </div>
    </div>
  );
};

export default MatchSnapshot;
