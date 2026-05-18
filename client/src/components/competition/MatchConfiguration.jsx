import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
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
    iconSrc: "/classic.png",
    name: "Classic",
    desc: "Race to finish",
    badge: null,
    color: "#f97316",
    glow: "rgba(249,115,22,0.18)",
    border: "rgba(249,115,22,0.45)",
  },
  {
    id: "survival",
    iconSrc: "/survival.png",
    name: "Survival",
    desc: "Lowest score out",
    badge: "2+",
    color: "#ef4444",
    glow: "rgba(239,68,68,0.18)",
    border: "rgba(239,68,68,0.45)",
  },
  {
    id: "blitz",
    iconSrc: "/blitz.png",
    name: "Blitz",
    desc: "15s per question",
    badge: null,
    color: "#eab308",
    glow: "rgba(234,179,8,0.18)",
    border: "rgba(234,179,8,0.45)",
  },
  {
    id: "team",
    iconSrc: "/team.png",
    name: "Team",
    desc: "2v2 combined",
    badge: "2v2",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.18)",
    border: "rgba(6,182,212,0.45)",
  },
  {
    id: "duel",
    iconSrc: "/swords-silver.png",
    name: "Duel",
    desc: "1v1, 5 questions",
    badge: "1v1",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.18)",
    border: "rgba(168,85,247,0.45)",
  },
  {
    id: "practice",
    iconSrc: "/practice.png",
    name: "Practice",
    desc: "Solo, no rank",
    badge: "Solo",
    color: "#71717a",
    glow: "rgba(113,113,122,0.12)",
    border: "rgba(113,113,122,0.35)",
  },
];

const CATEGORIES = [
  {
    id: "programming",
    label: "Programming",
    sublabel: "Code challenges & algorithms",
    iconSrc: "/visual-basic.png",
    activeColor: "#f97316",
    activeBg: "rgba(249,115,22,0.1)",
    activeBorder: "rgba(249,115,22,0.35)",
  },
  {
    id: "general",
    label: "General",
    sublabel: "Knowledge & trivia quizzes",
    iconSrc: "/book01.png",
    activeColor: "#60a5fa",
    activeBg: "rgba(59,130,246,0.1)",
    activeBorder: "rgba(59,130,246,0.35)",
  },
];

const PROGRAMMING_CHALLENGES = [
  {
    id: "classic",
    name: "Classic Coding",
    iconSrc: "/visual-basic.png",
    desc: "Standard algorithmic challenges",
  },
  {
    id: "scenario",
    name: "Scenario Challenge",
    iconSrc: "/scenario.png",
    desc: "Real-world engineering narratives",
  },
  {
    id: "debug",
    name: "Debug Detective",
    iconSrc: "/debug.png",
    desc: "Find and fix critical bugs",
  },
  {
    id: "outage",
    name: "Production Outage",
    iconSrc: "/siren.png",
    desc: "High-pressure incident response",
  },
  {
    id: "visual_interactive",
    name: "Visual Interactive",
    iconSrc: "/interactive.png",
    desc: "Grid puzzles & code tracing",
  },
];

const GENERAL_CHALLENGES = [
  {
    id: "classic",
    name: "Classic Quiz",
    iconSrc: "/book01.png",
    desc: "Standard multiple-choice",
  },
  {
    id: "scenario",
    name: "Scenario Challenge",
    iconSrc: "/books.png",
    desc: "Real-world situations",
  },
];

const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="w-0.5 h-3.5 rounded-full bg-orange-500 shrink-0" />
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
  const durationMins = Math.round(settings.timerDuration / 60);
  const challengeModes =
    settings.category === "programming"
      ? PROGRAMMING_CHALLENGES
      : GENERAL_CHALLENGES;

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
        <div className="px-6 py-4 border-b border-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
              <img src="/settings.png" alt="" width={30} height={30} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-metallic">
                Match Configuration
              </h2>
              <p className="text-[11px] text-zinc-600">
                Customize your competition
              </p>
            </div>
          </div>
          {playerCount > 0 && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{
                background: "rgba(34,197,94,0.07)",
                border: "1px solid rgba(34,197,94,0.18)",
                color: "#4ade80",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              {playerCount} {playerCount === 1 ? "player" : "players"} in lobby
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Category */}
          <div>
            <SectionLabel>Category</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(
                ({
                  id,
                  label,
                  sublabel,
                  iconSrc,
                  activeColor,
                  activeBg,
                  activeBorder,
                }) => {
                  const active = settings.category === id;
                  return (
                    <motion.button
                      key={id}
                      whileHover={{ scale: active ? 1 : 1.01 }}
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
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center shrink-0 mt-0.5">
                          <img
                            src={iconSrc}
                            alt={label}
                            className="w-6 h-6 object-contain"
                            style={{
                              opacity: active ? 1 : 0.5,
                              filter: active ? "none" : "grayscale(100%)",
                            }}
                          />
                        </div>
                        <div>
                          <span
                            className="block text-sm font-bold"
                            style={{ color: active ? "#e5e7eb" : "#71717a" }}
                          >
                            {label}
                          </span>
                          <span
                            className="block text-[10px] mt-0.5"
                            style={{ color: active ? "#6b7280" : "#3f3f46" }}
                          >
                            {sublabel}
                          </span>
                        </div>
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
                    className="relative p-3.5 rounded-xl text-center transition-colors duration-200 flex flex-col items-center"
                    style={{
                      background: active ? gm.glow : "rgba(255,255,255,0.02)",
                      border: `1px solid ${active ? gm.border : "#1c1c1c"}`,
                      boxShadow: active ? `0 0 20px ${gm.glow}` : "none",
                    }}
                  >
                    <img
                      src={gm.iconSrc}
                      alt={gm.name}
                      className="w-7 h-7 object-contain mb-1.5"
                      style={{
                        opacity: active ? 1 : 0.5,
                        filter: active
                          ? "none"
                          : "grayscale(100%) brightness(0.8)",
                      }}
                    />
                    <span
                      className="block text-[11px] font-bold leading-tight"
                      style={{ color: active ? gm.color : "#71717a" }}
                    >
                      {gm.name}
                    </span>
                    <span
                      className="block text-[9px] mt-0.5 leading-tight"
                      style={{ color: active ? `${gm.color}99` : "#3f3f46" }}
                    >
                      {gm.desc}
                    </span>
                    {gm.badge && (
                      <span
                        className="absolute -top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold"
                        style={{
                          background: active
                            ? `${gm.color}25`
                            : "rgba(255,255,255,0.05)",
                          border: `1px solid ${active ? `${gm.color}40` : "#2a2a2a"}`,
                          color: active ? gm.color : "#52525b",
                        }}
                      >
                        {gm.badge}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Challenge Type */}
          <div>
            <SectionLabel>Challenge Type</SectionLabel>
            <div className="space-y-1">
              {challengeModes.map((mode) => {
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
                    <div className="shrink-0 flex items-center justify-center">
                      <img
                        src={mode.iconSrc}
                        alt={mode.name}
                        className="w-5 h-5 object-contain"
                        style={{
                          opacity: active ? 1 : 0.6,
                          filter: active ? "none" : "grayscale(100%)",
                        }}
                      />
                    </div>
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
          <div className="space-y-3">
            {/* Row 1: Difficulty + Questions */}
            <div className="grid grid-cols-2 gap-3">
              {/* Difficulty */}
              <div className="space-y-2">
                <SectionLabel>Difficulty</SectionLabel>
                <div className="flex bg-zinc-950 rounded-xl p-0.5 border border-zinc-900">
                  {[
                    { id: "easy", label: "Easy", color: "#22c55e" },
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
            </div>

            {/* Row 2: Duration — full width */}
            <div className="space-y-2">
              <SectionLabel>Duration</SectionLabel>
              <div className="grid grid-cols-6 bg-zinc-950 rounded-xl p-0.5 border border-zinc-900">
                {[1, 3, 5, 10, 15, 30].map((m) => {
                  const active = settings.timerDuration === m * 60;
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        playMetricSelectSound();
                        onUpdateSettings("timerDuration", m * 60);
                      }}
                      className="py-1.5 rounded-lg text-[10px] font-bold transition-all"
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

          {/* Match Summary */}
          <div
            className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-[11px] text-zinc-600 flex-wrap"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid #1c1c1c",
            }}
          >
            <span className="capitalize font-semibold text-zinc-500">
              {settings.gameMode}
            </span>
            <span className="text-zinc-800">·</span>
            <span className="capitalize">{settings.category}</span>
            <span className="text-zinc-800">·</span>
            <span className="capitalize">{settings.difficulty}</span>
            <span className="text-zinc-800">·</span>
            <span>{settings.totalQuestions} Questions</span>
            <span className="text-zinc-800">·</span>
            <span>{durationMins}m</span>
          </div>

          {/* Begin Competition */}
          <button
            onClick={() => {
              if (!isStarting && settings.category && !insufficientPlayers)
                playBeginCompetitionSound();
              onStartGame();
            }}
            disabled={isStarting || !settings.category || insufficientPlayers}
            className="w-full h-[60px] rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br from-orange-600 to-red-600 border border-orange-500/30"
          >
            {isStarting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span className="text-white">Starting...</span>
              </>
            ) : (
              <>
                <img src="/swords-silver.png" alt="" width={30} height={30} />
                <span className="text-white">Begin Competition</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MatchConfiguration;
