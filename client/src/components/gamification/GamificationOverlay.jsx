import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { onEvent } from "@/lib/gamificationBus";
import { playVictorySound, playRankChangeSound } from "@/lib/sound";

const RARITY = {
  Common:    { bg: "from-zinc-700/95 to-zinc-800/95",       border: "border-zinc-500/40",  label: "text-zinc-300" },
  Rare:      { bg: "from-blue-600/95 to-blue-900/95",       border: "border-blue-400/40",  label: "text-blue-200" },
  Epic:      { bg: "from-purple-600/95 to-purple-900/95",   border: "border-purple-400/40",label: "text-purple-200" },
  Legendary: { bg: "from-amber-500/95 to-orange-800/95",    border: "border-amber-400/50", label: "text-amber-100" },
};

const RANK_COLOR = {
  Novice:      "text-zinc-400",
  Bronze:      "text-amber-600",
  Silver:      "text-slate-300",
  Gold:        "text-yellow-400",
  Platinum:    "text-cyan-300",
  Diamond:     "text-blue-400",
  Master:      "text-purple-400",
  Grandmaster: "text-red-400",
};

export default function GamificationOverlay() {
  const [xpEvent, setXpEvent]   = useState(null);   // { key, amount }
  const [levelUp, setLevelUp]   = useState(null);   // { key, level }
  const [badges, setBadges]     = useState([]);      // [{ id, title, icon, rarity }]
  const [rankUp, setRankUp]     = useState(null);   // { key, rank }

  const handle = useCallback((ev) => {
    switch (ev.type) {
      case "xp":
        setXpEvent({ key: Date.now(), amount: ev.amount });
        break;
      case "levelUp":
        setLevelUp({ key: Date.now(), level: ev.level });
        playVictorySound();
        break;
      case "badge": {
        const id = Date.now() + Math.random();
        setBadges((p) => [...p, { id, ...ev }]);
        playRankChangeSound();
        setTimeout(() => setBadges((p) => p.filter((b) => b.id !== id)), 3600);
        break;
      }
      case "rankUp":
        setRankUp({ key: Date.now(), rank: ev.rank });
        break;
    }
  }, []);

  useEffect(() => onEvent(handle), [handle]);

  // XP auto-dismiss — keyed so rapid successive XP events don't cancel each other
  useEffect(() => {
    if (!xpEvent) return;
    const { key } = xpEvent;
    const t = setTimeout(
      () => setXpEvent((p) => (p?.key === key ? null : p)),
      1800,
    );
    return () => clearTimeout(t);
  }, [xpEvent?.key]);

  // Level-up auto-dismiss — keyed
  const levelUpKeyRef = useRef(null);
  useEffect(() => {
    if (!levelUp) return;
    levelUpKeyRef.current = levelUp.key;
    const k = levelUp.key;
    const t = setTimeout(
      () => setLevelUp((p) => (p?.key === k ? null : p)),
      3200,
    );
    return () => clearTimeout(t);
  }, [levelUp?.key]);

  // Rank-up auto-dismiss — keyed
  useEffect(() => {
    if (!rankUp) return;
    const k = rankUp.key;
    const t = setTimeout(
      () => setRankUp((p) => (p?.key === k ? null : p)),
      2800,
    );
    return () => clearTimeout(t);
  }, [rankUp?.key]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">

      {/* ── XP float (bottom-center) ── */}
      <AnimatePresence>
        {xpEvent && (
          <motion.div
            key={xpEvent.key}
            className="absolute bottom-[38%] left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -70, scale: 1 }}
            exit={{ opacity: 0, y: -130, scale: 0.85 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <span className="text-5xl font-black text-yellow-400 drop-shadow-[0_0_28px_rgba(250,204,21,0.85)] tracking-tight select-none">
              +{xpEvent.amount} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Level-up (full-screen, click to dismiss) ── */}
      <AnimatePresence>
        {levelUp && (
          <motion.div
            key={levelUp.key}
            className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLevelUp(null)}
          >
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />

            <motion.div
              className="relative z-10 flex flex-col items-center gap-5 select-none"
              initial={{ scale: 0.4, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.75, opacity: 0 }}
              transition={{ type: "spring", damping: 14, stiffness: 220 }}
            >
              <motion.span
                className="text-8xl"
                animate={{ rotate: [0, -12, 12, -8, 8, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                ⭐
              </motion.span>

              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.45em] text-yellow-400/80 mb-2">
                  Level Up!
                </p>
                <p className="text-[96px] font-black text-white leading-none drop-shadow-[0_0_48px_rgba(255,255,255,0.35)]">
                  {levelUp.level}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm font-semibold text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 px-7 py-2.5 rounded-full"
              >
                New rewards unlocked
              </motion.div>

              <p className="text-[11px] text-white/25 mt-1">tap to dismiss</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Badge earned (bottom-right stack) ── */}
      <div className="absolute bottom-6 right-6 flex flex-col-reverse gap-3 items-end">
        <AnimatePresence mode="popLayout">
          {badges.map((badge) => {
            const s = RARITY[badge.rarity] ?? RARITY.Common;
            return (
              <motion.div
                key={badge.id}
                layout
                initial={{ x: 120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 120, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 220 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r ${s.bg} border ${s.border} shadow-2xl backdrop-blur-md`}
              >
                <span className="text-3xl leading-none">{badge.icon}</span>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/50 mb-0.5">
                    Badge Earned · {badge.rarity}
                  </p>
                  <p className={`text-sm font-bold ${s.label}`}>{badge.title}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Rank-up (top-center banner) ── */}
      <AnimatePresence>
        {rankUp && (
          <motion.div
            key={rankUp.key}
            className="absolute top-6 left-1/2 -translate-x-1/2"
            initial={{ y: -90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -90, opacity: 0 }}
            transition={{ type: "spring", damping: 18, stiffness: 260 }}
          >
            <div className="flex items-center gap-3 bg-[#111111] bg-opacity-95 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl shadow-2xl">
              <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/50">
                  Rank Up!
                </p>
                <p className={`text-base font-black ${RANK_COLOR[rankUp.rank] ?? "text-white"}`}>
                  {rankUp.rank}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
