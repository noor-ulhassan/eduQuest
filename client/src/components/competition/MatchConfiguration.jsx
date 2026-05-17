import React from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Code,
  BookOpen,
  Loader2,
  Swords,
  Flag,
  Flame,
  Zap,
  Users,
  Target,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  playSelectSound,
  playModeSelectSound,
  playMetricSelectSound,
  playBeginCompetitionSound,
} from "@/lib/sound";

const GAME_MODES = [
  {
    id: "classic",
    Icon: Flag,
    name: "Classic",
    desc: "Race to finish",
    color: "#f97316",
    glow: "rgba(249,115,22,0.18)",
    border: "rgba(249,115,22,0.45)",
  },
  {
    id: "survival",
    Icon: Flame,
    name: "Survival",
    desc: "Lowest score out",
    color: "#ef4444",
    glow: "rgba(239,68,68,0.18)",
    border: "rgba(239,68,68,0.45)",
  },
  {
    id: "blitz",
    Icon: Zap,
    name: "Blitz",
    desc: "15s per question",
    color: "#eab308",
    glow: "rgba(234,179,8,0.18)",
    border: "rgba(234,179,8,0.45)",
  },
  {
    id: "team",
    Icon: Users,
    name: "Team",
    desc: "2v2 combined",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.18)",
    border: "rgba(6,182,212,0.45)",
  },
  {
    id: "duel",
    Icon: Swords,
    name: "Duel",
    desc: "1v1, 5 questions",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.18)",
    border: "rgba(168,85,247,0.45)",
  },
  {
    id: "practice",
    Icon: Target,
    name: "Practice",
    desc: "Solo, no rank",
    color: "#71717a",
    glow: "rgba(113,113,122,0.12)",
    border: "rgba(113,113,122,0.35)",
  },
];

const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-2 mb-2.5">
    <span className="w-0.5 h-3 rounded-full bg-orange-500 shrink-0" />
    <p className="text-[10px] font-bold text-metallic uppercase tracking-[0.18em]">
      {children}
    </p>
  </div>
);

const MatchConfiguration = ({
  settings,
  isStarting,
  onUpdateSettings,
  onStartGame,
  playerCount = 1,
}) => {
  const modeMinPlayers = { duel: 2, survival: 2, team: 2 };
  const modeMinLabels = {
    duel: "Duel requires 2 players (1v1)",
    survival: "Survival requires at least 2 players",
    team: "Team Battle requires at least 2 players",
  };
  const requiredCount = modeMinPlayers[settings.gameMode];
  const insufficientPlayers =
    requiredCount !== undefined && playerCount < requiredCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#0c0c0c", border: "1px solid #1a1a1a" }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-900/80 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.18)",
            }}
          >
            <Settings size={16} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-metallic">
              Match Configuration
            </h2>
            <p className="text-[11px] text-zinc-600">
              Customize your competition
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Category */}
          <div>
            <SectionLabel>Category</SectionLabel>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  id: "programming",
                  label: "Programming",
                  Icon: Code,
                  activeColor: "#f97316",
                  activeBg: "rgba(249,115,22,0.1)",
                  activeBorder: "rgba(249,115,22,0.35)",
                },
                {
                  id: "general",
                  label: "General",
                  Icon: BookOpen,
                  activeColor: "#60a5fa",
                  activeBg: "rgba(59,130,246,0.1)",
                  activeBorder: "rgba(59,130,246,0.35)",
                },
              ].map(
                ({
                  id,
                  label,
                  Icon: BtnIcon,
                  activeColor,
                  activeBg,
                  activeBorder,
                }) => {
                  const active = settings.category === id;
                  return (
                    <motion.button
                      key={id}
                      whileHover={{ scale: active ? 1 : 1.02 }}
                      onClick={() => {
                        playSelectSound();
                        onUpdateSettings({
                          category: id,
                          challengeMode: "classic",
                        });
                      }}
                      className="relative p-4 rounded-xl text-left transition-all duration-200"
                      style={{
                        background: active
                          ? activeBg
                          : "rgba(255,255,255,0.02)",
                        border: `1px solid ${active ? activeBorder : "#1e1e1e"}`,
                        boxShadow: active ? `0 0 20px ${activeBg}` : "none",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <BtnIcon
                          size={18}
                          style={{ color: active ? activeColor : "#52525b" }}
                        />
                        <span
                          className={`text-sm font-bold ${active ? "text-metallic" : ""}`}
                          style={{ color: active ? undefined : "#71717a" }}
                        >
                          {label}
                        </span>
                      </div>
                      {active && (
                        <div
                          className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                          style={{ background: activeColor }}
                        />
                      )}
                    </motion.button>
                  );
                },
              )}
            </div>
          </div>

          {/* Game Mode */}
          <div>
            <SectionLabel>Game Mode</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {GAME_MODES.map((gm, idx) => {
                const active = settings.gameMode === gm.id;
                return (
                  <motion.button
                    key={gm.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05, duration: 0.18 }}
                    whileHover={{
                      y: active ? 0 : -2,
                      transition: { duration: 0.12 },
                    }}
                    onClick={() => {
                      playModeSelectSound();
                      const updates = { gameMode: gm.id };
                      if (gm.id === "duel" || gm.id === "practice")
                        updates.totalQuestions = 5;
                      onUpdateSettings(updates);
                    }}
                    className="relative p-3 rounded-xl text-center transition-colors duration-200"
                    style={{
                      background: active
                        ? `${gm.glow}`
                        : "rgba(255,255,255,0.02)",
                      border: `1px solid ${active ? gm.border : "#1c1c1c"}`,
                      boxShadow: active ? `0 0 20px ${gm.glow}` : "none",
                    }}
                  >
                    <gm.Icon
                      size={18}
                      className="mx-auto mb-1.5"
                      style={{ color: active ? gm.color : "#52525b" }}
                    />
                    <span
                      className="block text-[11px] font-bold"
                      style={{ color: active ? gm.color : "#71717a" }}
                    >
                      {gm.name}
                    </span>
                    <span
                      className="block text-[9px] mt-0.5"
                      style={{ color: active ? `${gm.color}99` : "#3f3f46" }}
                    >
                      {gm.desc}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Challenge Type */}
          <div>
            <SectionLabel>Challenge Type</SectionLabel>
            <div className="space-y-1 max-h-[200px] overflow-y-auto pr-0.5 custom-scrollbar">
              {(settings.category === "programming"
                ? [
                    {
                      id: "classic",
                      name: "Classic Coding",
                      icon: "💻",
                      desc: "Standard algorithmic challenges",
                    },
                    {
                      id: "scenario",
                      name: "Scenario Challenge",
                      icon: "🎭",
                      desc: "Real-world engineering narratives",
                    },
                    {
                      id: "debug",
                      name: "Debug Detective",
                      icon: "🔍",
                      desc: "Find and fix critical bugs",
                    },
                    {
                      id: "outage",
                      name: "Production Outage",
                      icon: "🚨",
                      desc: "High-pressure incident response",
                    },
                    {
                      id: "visual_interactive",
                      name: "Visual Interactive",
                      icon: "🎮",
                      desc: "Grid puzzles & code tracing",
                    },
                  ]
                : [
                    {
                      id: "classic",
                      name: "Classic Quiz",
                      icon: "📝",
                      desc: "Standard multiple-choice",
                    },
                    {
                      id: "scenario",
                      name: "Scenario Challenge",
                      icon: "🎭",
                      desc: "Real-world situations",
                    },
                  ]
              ).map((mode) => {
                const active = settings.challengeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      playSelectSound();
                      onUpdateSettings("challengeMode", mode.id);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-150"
                    style={{
                      background: active
                        ? "rgba(249,115,22,0.09)"
                        : "transparent",
                      border: `1px solid ${active ? "rgba(249,115,22,0.28)" : "transparent"}`,
                      borderLeft: active
                        ? "3px solid rgba(249,115,22,0.65)"
                        : "3px solid transparent",
                    }}
                  >
                    <span className="text-base shrink-0">{mode.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`block text-[13px] font-semibold ${active ? "text-metallic-orange" : ""}`}
                        style={{ color: active ? undefined : "#a1a1aa" }}
                      >
                        {mode.name}
                      </span>
                      <span className="block text-[10px] text-zinc-600 mt-0.5">
                        {mode.desc}
                      </span>
                    </div>
                    {active && (
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <SectionLabel>Specific Topic</SectionLabel>
              <Input
                value={settings.topic}
                onChange={(e) => onUpdateSettings("topic", e.target.value)}
                placeholder={
                  settings.category === "programming"
                    ? "e.g. React Hooks, graphs..."
                    : "e.g. History, Physics..."
                }
                className="h-9 bg-zinc-950 border-zinc-900 text-zinc-200 placeholder:text-zinc-700 focus-visible:ring-orange-500/40 focus-visible:border-orange-500/30 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-2">
              <SectionLabel>Description</SectionLabel>
              <Textarea
                value={settings.description}
                onChange={(e) =>
                  onUpdateSettings("description", e.target.value)
                }
                placeholder="Context or rules..."
                rows={1}
                className="resize-none bg-zinc-950 border-zinc-900 text-zinc-200 placeholder:text-zinc-700 focus-visible:ring-orange-500/40 rounded-xl text-sm min-h-[36px]"
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3">
            {/* Difficulty */}
            <div className="space-y-2">
              <SectionLabel>Difficulty</SectionLabel>
              <div className="flex bg-zinc-950 rounded-xl p-0.5 border border-zinc-900">
                {[
                  { id: "easy", label: "Eas", color: "#22c55e" },
                  { id: "medium", label: "Med", color: "#f97316" },
                  { id: "hard", label: "Hard", color: "#ef4444" },
                ].map(({ id, label, color }) => {
                  const active = settings.difficulty === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        playMetricSelectSound();
                        onUpdateSettings("difficulty", id);
                      }}
                      className="flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
                      style={{
                        background: active
                          ? "rgba(255,255,255,0.06)"
                          : "transparent",
                        color: active ? color : "#52525b",
                        boxShadow: active ? `0 0 10px ${color}30` : "none",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-2">
              <SectionLabel>
                Questions{" "}
                {settings.gameMode === "duel" ? (
                  <span className="text-orange-600/70 normal-case font-normal">
                    (locked)
                  </span>
                ) : settings.totalQuestions > 0 &&
                  settings.timerDuration > 0 ? (
                  <span className="text-zinc-600 normal-case font-normal">
                    ~
                    {Math.round(
                      settings.timerDuration / settings.totalQuestions,
                    )}
                    s
                  </span>
                ) : null}
              </SectionLabel>
              <div
                className={`flex bg-zinc-950 rounded-xl p-0.5 border border-zinc-900 ${settings.gameMode === "duel" ? "opacity-40 pointer-events-none" : ""}`}
              >
                {[3, 5, 10].map((n) => {
                  const active = settings.totalQuestions === n;
                  return (
                    <button
                      key={n}
                      onClick={() => {
                        playMetricSelectSound();
                        onUpdateSettings("totalQuestions", n);
                      }}
                      disabled={settings.gameMode === "duel"}
                      className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                      style={{
                        background: active
                          ? "rgba(249,115,22,0.12)"
                          : "transparent",
                        color: active ? "#fb923c" : "#52525b",
                        boxShadow: active
                          ? "0 0 10px rgba(249,115,22,0.1)"
                          : "none",
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <SectionLabel>Duration</SectionLabel>
              <div className="flex bg-zinc-950 rounded-xl p-0.5 border border-zinc-900 flex-wrap">
                {[1, 3, 5, 10, 15, 30].map((m) => {
                  const active = settings.timerDuration === m * 60;
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        playMetricSelectSound();
                        onUpdateSettings("timerDuration", m * 60);
                      }}
                      className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all min-w-[14%]"
                      style={{
                        background: active
                          ? "rgba(249,115,22,0.12)"
                          : "transparent",
                        color: active ? "#fb923c" : "#52525b",
                        boxShadow: active
                          ? "0 0 10px rgba(249,115,22,0.1)"
                          : "none",
                      }}
                    >
                      {m}m
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Player count warning */}
          {insufficientPlayers && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold"
              style={{
                background: "rgba(234,88,12,0.08)",
                border: "1px solid rgba(234,88,12,0.2)",
                color: "#fb923c",
              }}
            >
              <span>⚠️</span>
              <span>
                {modeMinLabels[settings.gameMode]} — waiting for more players to
                join.
              </span>
            </div>
          )}

          {/* Begin Competition */}
          <motion.div
            className="rounded-2xl"
            animate={{
              boxShadow: [
                "0 0 20px rgba(234,88,12,0.15), 0 4px 15px rgba(234,88,12,0.1)",
                "0 0 55px rgba(234,88,12,0.45), 0 4px 30px rgba(234,88,12,0.3)",
                "0 0 20px rgba(234,88,12,0.15), 0 4px 15px rgba(234,88,12,0.1)",
              ],
            }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            <button
              onClick={() => {
                if (!isStarting && settings.category && !insufficientPlayers)
                  playBeginCompetitionSound();
                onStartGame();
              }}
              disabled={isStarting || !settings.category || insufficientPlayers}
              className="relative w-full h-[60px] rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #ea580c 100%)",
                backgroundSize: "200% 100%",
                border: "1px solid rgba(249,115,22,0.35)",
              }}
            >
              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ x: ["-100%", "220%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 3.5,
                  ease: "easeInOut",
                  repeatDelay: 2,
                }}
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                  width: "50%",
                }}
              />
              {/* Top gloss */}
              <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.08), transparent)",
                }}
              />
              {isStarting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-metallic">Starting...</span>
                </>
              ) : (
                <>
                  <img src="/swords-silver.png" alt="" width={30} height={30} />
                  <span className="text-metallic">Begin Competition</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MatchConfiguration;
