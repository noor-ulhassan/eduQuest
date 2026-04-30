import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Plus,
  LogIn,
  Zap,
  Shield,
  Users,
  Trophy,
  X,
  ArrowRight,
} from "lucide-react";

const MODES = [
  { icon: Zap, color: "#eab308", name: "Blitz", desc: "3× speed bonus" },
  {
    icon: Shield,
    color: "#ef4444",
    name: "Survival",
    desc: "Last one standing",
  },
  { icon: Users, color: "#3b82f6", name: "Team Battle", desc: "Blue vs Red" },
  { icon: Trophy, color: "#f97316", name: "Classic", desc: "Highest XP wins" },
];

const JoinModal = ({ onClose, onJoin }) => {
  const [code, setCode] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: "#0c0c0c", border: "1px solid #1e1e1e" }}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Join a Room</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Enter the code from your host
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const t = code.trim().toUpperCase();
              if (t.length >= 4) onJoin(t);
            }}
            className="space-y-3"
          >
            <input
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Room code"
              maxLength={8}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-center text-2xl font-black tracking-[0.3em] placeholder:text-zinc-700 placeholder:text-base placeholder:tracking-normal placeholder:font-normal outline-none focus:border-orange-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={code.trim().length < 4}
              className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <ArrowRight size={18} /> Enter Arena
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CompetitionPage = () => {
  const navigate = useNavigate();
  const [showJoin, setShowJoin] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-orange-500/30 flex flex-col">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-600/5 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-[-10%] w-[500px] h-[400px] bg-red-800/4 rounded-full blur-[140px]" />
      </div>

      {/* Main — vertically centred, never scrolls on a normal viewport */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10 gap-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-orange-400"
          style={{
            background: "rgba(234,88,12,0.08)",
            border: "1px solid rgba(234,88,12,0.2)",
          }}
        >
          Live Competition Arena
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.07 }}
          className="text-center space-y-4 max-w-2xl"
        >
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none">
            <span className="text-metallic">Compete.</span>{" "}
            <span className="text-metallic-orange">Conquer.</span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Real-time knowledge battles. Pick your mode, invite your rivals, and
            see who knows their stuff.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mt-2"
        >
          <button
            onClick={() => navigate("/competition/lobby")}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-colors"
          >
            <Plus size={15} /> Create Competition
          </button>
          <button
            onClick={() => setShowJoin(true)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <LogIn size={18} /> Join with Code
          </button>
        </motion.div>

        {/* Mode pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {MODES.map((m) => (
            <div
              key={m.name}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid #1e1e1e",
                color: m.color,
              }}
            >
              <m.icon size={11} />
              {m.name}
              <span className="text-zinc-600 font-normal">— {m.desc}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {showJoin && (
          <JoinModal
            onClose={() => setShowJoin(false)}
            onJoin={(code) => {
              setShowJoin(false);
              navigate(`/competition/lobby?join=${code}`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompetitionPage;
