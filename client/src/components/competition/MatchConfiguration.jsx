import React from "react";
import { motion } from "framer-motion";
import { Settings, Code, BookOpen, Loader2, Swords } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const MatchConfiguration = ({ settings, isStarting, onUpdateSettings, onStartGame }) => (
  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0c0c0c", border: "1px solid #1a1a1a" }}>

      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-900/80 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.18)" }}
        >
          <Settings size={16} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Match Configuration</h2>
          <p className="text-[11px] text-zinc-600">Customize your competition</p>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Target Domain */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.18em]">Target Domain</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: "programming", label: "Programming", icon: <Code size={18} />, activeColor: "#f97316", activeBg: "rgba(249,115,22,0.1)", activeBorder: "rgba(249,115,22,0.35)" },
              { id: "general", label: "General", icon: <BookOpen size={18} />, activeColor: "#60a5fa", activeBg: "rgba(59,130,246,0.1)", activeBorder: "rgba(59,130,246,0.35)" },
            ].map(({ id, label, icon, activeColor, activeBg, activeBorder }) => {
              const active = settings.category === id;
              return (
                <button
                  key={id}
                  onClick={() => onUpdateSettings({ category: id, challengeMode: "classic" })}
                  className="relative p-4 rounded-xl text-left transition-all duration-200"
                  style={{
                    background: active ? activeBg : "rgba(255,255,255,0.02)",
                    border: `1px solid ${active ? activeBorder : "#1e1e1e"}`,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span style={{ color: active ? activeColor : "#52525b" }}>{icon}</span>
                    <span className="text-sm font-bold" style={{ color: active ? "#fff" : "#71717a" }}>{label}</span>
                  </div>
                  {active && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: activeColor }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Game Mode */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.18em]">Game Mode</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "classic", icon: "🏁", name: "Classic", desc: "Race to finish" },
              { id: "survival", icon: "💀", name: "Survival", desc: "Lowest score out" },
              { id: "blitz", icon: "⚡", name: "Blitz", desc: "15s per question" },
              { id: "team", icon: "🤝", name: "Team", desc: "2v2 combined" },
              { id: "duel", icon: "⚔️", name: "Duel", desc: "1v1, 5 questions" },
              { id: "practice", icon: "🎯", name: "Practice", desc: "Solo, no rank" },
            ].map((gm) => {
              const active = settings.gameMode === gm.id;
              return (
                <button
                  key={gm.id}
                  onClick={() => {
                    const updates = { gameMode: gm.id };
                    if (gm.id === "duel") updates.totalQuestions = 5;
                    if (gm.id === "practice") updates.totalQuestions = 5;
                    onUpdateSettings(updates);
                  }}
                  className="relative p-3 rounded-xl text-center transition-all duration-200"
                  style={{
                    background: active ? "rgba(249,115,22,0.09)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${active ? "rgba(249,115,22,0.35)" : "#1c1c1c"}`,
                    boxShadow: active ? "0 0 16px rgba(249,115,22,0.08)" : "none",
                  }}
                >
                  <span className="text-lg block mb-1">{gm.icon}</span>
                  <span className="block text-[11px] font-bold" style={{ color: active ? "#fb923c" : "#71717a" }}>{gm.name}</span>
                  <span className="block text-[9px] mt-0.5" style={{ color: active ? "rgba(249,115,22,0.6)" : "#3f3f46" }}>{gm.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-zinc-900" />

        {/* Challenge Type */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.18em]">Challenge Type</p>
          <div className="space-y-1 max-h-[200px] overflow-y-auto pr-0.5 custom-scrollbar">
            {(settings.category === "programming"
              ? [
                  { id: "classic", name: "Classic Coding", icon: "💻", desc: "Standard algorithmic challenges" },
                  { id: "scenario", name: "Scenario Challenge", icon: "🎭", desc: "Real-world engineering narratives" },
                  { id: "debug", name: "Debug Detective", icon: "🔍", desc: "Find and fix critical bugs" },
                  { id: "outage", name: "Production Outage", icon: "🚨", desc: "High-pressure incident response" },
                  { id: "refactor", name: "Code Refactor", icon: "♻️", desc: "Optimize messy legacy code" },
                  { id: "missing", name: "Missing Link", icon: "🧩", desc: "Implement the missing component" },
                  { id: "interactive", name: "Interactive", icon: "🎮", desc: "Drag, drop, and type answers" },
                ]
              : [
                  { id: "classic", name: "Classic Quiz", icon: "📝", desc: "Standard multiple-choice" },
                  { id: "interactive", name: "Interactive", icon: "🎮", desc: "Drag, drop, and type answers" },
                  { id: "scenario", name: "Scenario Challenge", icon: "🎭", desc: "Real-world situations" },
                  { id: "missing", name: "Missing Link", icon: "🧩", desc: "Connect the system concepts" },
                ]
            ).map((mode) => {
              const active = settings.challengeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => onUpdateSettings("challengeMode", mode.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-150"
                  style={{
                    background: active ? "rgba(249,115,22,0.08)" : "transparent",
                    border: `1px solid ${active ? "rgba(249,115,22,0.25)" : "transparent"}`,
                  }}
                >
                  <span className="text-base shrink-0">{mode.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold" style={{ color: active ? "#fb923c" : "#a1a1aa" }}>{mode.name}</span>
                    <span className="block text-[10px] text-zinc-600 mt-0.5">{mode.desc}</span>
                  </div>
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-zinc-900" />

        {/* Topic & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.18em]">Specific Topic</p>
            <Input
              value={settings.topic}
              onChange={(e) => onUpdateSettings("topic", e.target.value)}
              placeholder={settings.category === "programming" ? "e.g. React Hooks, graphs..." : "e.g. History, Physics..."}
              className="h-9 bg-zinc-950 border-zinc-900 text-zinc-200 placeholder:text-zinc-700 focus-visible:ring-orange-500/40 focus-visible:border-orange-500/30 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.18em]">Description</p>
            <Textarea
              value={settings.description}
              onChange={(e) => onUpdateSettings("description", e.target.value)}
              placeholder="Context or rules..."
              rows={1}
              className="resize-none bg-zinc-950 border-zinc-900 text-zinc-200 placeholder:text-zinc-700 focus-visible:ring-orange-500/40 rounded-xl text-sm min-h-[36px]"
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.18em]">Difficulty</p>
            <div className="flex bg-zinc-950 rounded-xl p-0.5 border border-zinc-900">
              {[
                { id: "easy", label: "Eas" },
                { id: "medium", label: "Med" },
                { id: "hard", label: "Hard" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => onUpdateSettings("difficulty", id)}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
                  style={{
                    background: settings.difficulty === id ? "#27272a" : "transparent",
                    color: settings.difficulty === id ? "#fff" : "#52525b",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.18em]">Questions</p>
            <div className="flex bg-zinc-950 rounded-xl p-0.5 border border-zinc-900">
              {[3, 5, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => onUpdateSettings("totalQuestions", n)}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                  style={{
                    background: settings.totalQuestions === n ? "#27272a" : "transparent",
                    color: settings.totalQuestions === n ? "#fff" : "#52525b",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.18em]">Duration</p>
            <div className="flex bg-zinc-950 rounded-xl p-0.5 border border-zinc-900 flex-wrap">
              {[1, 3, 5, 10, 15, 30].map((m) => (
                <button
                  key={m}
                  onClick={() => onUpdateSettings("timerDuration", m * 60)}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all min-w-[14%]"
                  style={{
                    background: settings.timerDuration === m * 60 ? "#27272a" : "transparent",
                    color: settings.timerDuration === m * 60 ? "#fff" : "#52525b",
                  }}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Begin Competition */}
        <button
          onClick={onStartGame}
          disabled={isStarting || !settings.category}
          className="relative w-full h-[52px] rounded-2xl font-bold text-white flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #ea580c 100%)",
            backgroundSize: "200% 100%",
            border: "1px solid rgba(249,115,22,0.3)",
            boxShadow: "0 0 36px rgba(234,88,12,0.2), 0 1px 0 rgba(255,255,255,0.07) inset",
          }}
        >
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.06),transparent)" }}
          />
          {isStarting ? (
            <><Loader2 size={20} className="animate-spin" /><span>Initiating...</span></>
          ) : (
            <><Swords size={20} /><span>Begin Competition</span></>
          )}
        </button>

      </div>
    </div>
  </motion.div>
);

export default MatchConfiguration;
