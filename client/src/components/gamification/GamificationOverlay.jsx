import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { onEvent } from "@/lib/gamificationBus";
import {
  playLevelUpSound,
  playBadgeEarnedSound,
  playRankChangeSound,
  playXPGainSound,
} from "@/lib/sound";
import confetti from "canvas-confetti";

// ─── Rarity config ────────────────────────────────────────────────────
const RARITY = {
  Common: {
    bg: "from-zinc-700/95 to-zinc-900/95",
    border: "border-zinc-500/40",
    label: "text-zinc-200",
    glow: "",
    shimmer: "rgba(255,255,255,0.12)",
  },
  Rare: {
    bg: "from-blue-600/90 to-blue-950/95",
    border: "border-blue-400/50",
    label: "text-blue-100",
    glow: "shadow-[0_0_26px_rgba(59,130,246,0.5)]",
    shimmer: "rgba(147,197,253,0.2)",
  },
  Epic: {
    bg: "from-purple-600/90 to-purple-950/95",
    border: "border-purple-400/50",
    label: "text-purple-100",
    glow: "shadow-[0_0_26px_rgba(168,85,247,0.55)]",
    shimmer: "rgba(216,180,254,0.2)",
  },
  Legendary: {
    bg: "from-amber-500/90 to-orange-950/95",
    border: "border-amber-400/60",
    label: "text-amber-100",
    glow: "shadow-[0_0_32px_rgba(245,158,11,0.65)]",
    shimmer: "rgba(253,230,138,0.25)",
  },
};

// ─── Rank color + glow ────────────────────────────────────────────────
const RANK_STYLE = {
  Novice:      { text: "text-zinc-400",   glow: "rgba(161,161,170,0.4)" },
  Bronze:      { text: "text-amber-600",  glow: "rgba(217,119,6,0.45)" },
  Silver:      { text: "text-slate-300",  glow: "rgba(203,213,225,0.45)" },
  Gold:        { text: "text-yellow-400", glow: "rgba(250,204,21,0.55)" },
  Platinum:    { text: "text-cyan-300",   glow: "rgba(103,232,249,0.55)" },
  Diamond:     { text: "text-blue-400",   glow: "rgba(96,165,250,0.55)" },
  Master:      { text: "text-purple-400", glow: "rgba(192,132,252,0.55)" },
  Grandmaster: { text: "text-red-400",    glow: "rgba(248,113,113,0.55)" },
};

// Sparkle positions orbiting the level number
const STARS = [
  { x: -74, y: -54, delay: 0.36, size: 20 },
  { x:  78, y: -50, delay: 0.43, size: 16 },
  { x: -90, y:  16, delay: 0.51, size: 13 },
  { x:  92, y:  20, delay: 0.39, size: 15 },
  { x: -60, y:  64, delay: 0.56, size: 19 },
  { x:  64, y:  70, delay: 0.47, size: 13 },
];

// ═══════════════════════════════════════════════════════════════════════
// XP FLOAT
// ═══════════════════════════════════════════════════════════════════════
const XPFloat = ({ amount, eventKey }) => (
  <motion.div
    key={eventKey}
    className="absolute bottom-[38%] left-1/2 -translate-x-1/2 pointer-events-none"
    initial={{ opacity: 0, y: 0, scale: 0.55 }}
    animate={{ opacity: [0, 1, 1, 0], y: -110, scale: [0.55, 1.08, 1, 0.92] }}
    transition={{ duration: 1.7, ease: "easeOut", times: [0, 0.08, 0.55, 1] }}
  >
    {/* Ambient glow bloom */}
    <div className="absolute inset-0 rounded-full bg-yellow-400/25 blur-2xl scale-[2]" />

    {/* Pill chip */}
    <div className="relative flex items-center gap-2 bg-gradient-to-r from-yellow-500/92 to-amber-500/92 border border-yellow-300/55 px-5 py-2.5 rounded-full shadow-[0_0_30px_rgba(250,204,21,0.65),0_2px_0_rgba(255,255,255,0.12)_inset] backdrop-blur-sm">
      <motion.span
        className="text-base leading-none select-none"
        animate={{ rotate: [0, 20, -10, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        ✦
      </motion.span>
      <span className="text-[22px] font-black text-white tracking-tight leading-none select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
        +{amount} XP
      </span>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════
// LEVEL-UP CEREMONY
// ═══════════════════════════════════════════════════════════════════════
const LevelUpCeremony = ({ level, onDismiss }) => {
  useEffect(() => {
    // Staggered confetti bursts — center, left, right
    const t1 = setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 360,
        startVelocity: 34,
        origin: { x: 0.5, y: 0.46 },
        colors: ["#FFD700", "#FFA500", "#FFF8DC", "#FF6B35", "#FFEFD5", "#FFC0CB"],
        ticks: 95,
        scalar: 0.88,
        gravity: 0.62,
        shapes: ["star", "circle"],
        zIndex: 10000,
      });
    }, 310);

    const t2 = setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 58,
        spread: 54,
        startVelocity: 60,
        origin: { x: 0.06, y: 0.52 },
        colors: ["#FFD700", "#FFA500", "#FF6B35"],
        ticks: 80,
        scalar: 0.80,
        zIndex: 10000,
      });
      confetti({
        particleCount: 60,
        angle: 122,
        spread: 54,
        startVelocity: 60,
        origin: { x: 0.94, y: 0.52 },
        colors: ["#FFD700", "#FFA500", "#FF6B35"],
        ticks: 80,
        scalar: 0.80,
        zIndex: 10000,
      });
    }, 490);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer"
      onClick={onDismiss}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      {/* ── White screen flash ── */}
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none"
        initial={{ opacity: 0.42 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.20, ease: "easeOut" }}
      />

      {/* ── Radial dark backdrop ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 58% 58% at 50% 50%, rgba(251,191,36,0.11) 0%, rgba(0,0,0,0.90) 65%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28, delay: 0.06 }}
      />

      {/* ── Expanding pulse rings ── */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 220,
            height: 220,
            left: "50%",
            top: "46%",
            x: "-50%",
            y: "-50%",
            border: "1.5px solid rgba(251,191,36,0.32)",
          }}
          initial={{ scale: 0.25, opacity: 0.85 }}
          animate={{ scale: 5.2, opacity: 0 }}
          transition={{ delay: 0.10 + i * 0.15, duration: 1.05, ease: "easeOut" }}
        />
      ))}

      {/* ── Central glow bloom ── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 320,
          height: 320,
          left: "50%",
          top: "46%",
          x: "-50%",
          y: "-50%",
          background: "radial-gradient(circle, rgba(251,191,36,0.22) 0%, transparent 70%)",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1.1], opacity: [0, 0.85, 0.18] }}
        transition={{ delay: 0.08, duration: 0.75, ease: "easeOut" }}
      />

      {/* ── Main content card ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-3.5 select-none"
        initial={{ scale: 0.32, y: 55, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.68, opacity: 0, y: -24 }}
        transition={{ type: "spring", damping: 15, stiffness: 265, delay: 0.05 }}
      >
        {/* LEVEL UP label — expands letter-spacing on entrance */}
        <motion.p
          className="text-[11px] font-black uppercase text-yellow-400"
          initial={{ opacity: 0, letterSpacing: "0.15em" }}
          animate={{ opacity: 1, letterSpacing: "0.55em" }}
          transition={{ delay: 0.20, duration: 0.38 }}
        >
          Level Up!
        </motion.p>

        {/* Level number + orbiting sparkles */}
        <div className="relative flex items-center justify-center">
          {/* Glow fog behind number */}
          <div className="absolute w-44 h-32 bg-yellow-400/14 rounded-full blur-3xl pointer-events-none" />

          {/* Number — slams in from large blurry to sharp */}
          <motion.p
            className="relative font-black text-white leading-none z-10"
            style={{
              fontSize: 116,
              textShadow:
                "0 0 55px rgba(251,191,36,0.55), 0 0 110px rgba(251,191,36,0.25)",
            }}
            initial={{ scale: 2.3, opacity: 0, filter: "blur(18px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{
              type: "spring",
              damping: 19,
              stiffness: 340,
              delay: 0.13,
            }}
          >
            {level}
          </motion.p>

          {/* Orbiting sparkle ✦ */}
          {STARS.map((s, i) => (
            <motion.span
              key={i}
              className="absolute text-yellow-300 pointer-events-none z-20"
              style={{
                fontSize: s.size,
                top: `calc(50% + ${s.y}px)`,
                left: `calc(50% + ${s.x}px)`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1.35, 1, 0],
                rotate: [0, 28, -12, 22],
              }}
              transition={{
                delay: s.delay,
                duration: 1.85,
                times: [0, 0.14, 0.65, 1],
              }}
            >
              ✦
            </motion.span>
          ))}
        </div>

        {/* XP fill bar — represents the bar hitting 100% */}
        <motion.div
          className="w-52"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
        >
          <div className="h-[5px] w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #F59E0B, #F97316, #EF4444)",
                boxShadow: "0 0 10px rgba(249,115,22,0.6)",
              }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                delay: 0.48,
                duration: 0.88,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            />
          </div>
        </motion.div>

        {/* "New rewards unlocked" badge + shimmer sweep */}
        <motion.div
          initial={{ opacity: 0, scale: 0.80, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.36, type: "spring", damping: 18, stiffness: 280 }}
          className="relative overflow-hidden text-sm font-semibold text-yellow-400/88 bg-yellow-400/10 border border-yellow-400/22 px-8 py-2.5 rounded-full"
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.24) 50%, transparent 100%)",
            }}
            initial={{ x: "-115%" }}
            animate={{ x: "215%" }}
            transition={{ delay: 0.62, duration: 0.72, ease: "easeInOut" }}
          />
          New rewards unlocked ✦
        </motion.div>

        <p className="text-[10px] text-white/18 mt-0.5 font-medium">
          tap anywhere to dismiss
        </p>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// BADGE TOAST
// ═══════════════════════════════════════════════════════════════════════
const BadgeToast = ({ badge, onRemove }) => {
  const s = RARITY[badge.rarity] ?? RARITY.Common;

  return (
    <motion.div
      layout
      initial={{ x: 140, opacity: 0, scale: 0.88 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 140, opacity: 0, scale: 0.88, transition: { duration: 0.20 } }}
      transition={{ type: "spring", damping: 22, stiffness: 290 }}
      className={`relative overflow-hidden flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-gradient-to-r ${s.bg} border ${s.border} ${s.glow} backdrop-blur-md shadow-2xl cursor-pointer max-w-[285px] pointer-events-auto`}
      onClick={onRemove}
    >
      {/* Shimmer sweep on appear */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(108deg, transparent 0%, ${s.shimmer} 50%, transparent 100%)`,
        }}
        initial={{ x: "-115%" }}
        animate={{ x: "215%" }}
        transition={{ delay: 0.22, duration: 0.62, ease: "easeInOut" }}
      />

      {/* Legendary pulsing border */}
      {badge.rarity === "Legendary" && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: "1px solid rgba(245,158,11,0.65)" }}
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Badge icon — pops in */}
      <motion.span
        className="text-[38px] leading-none shrink-0 relative z-10"
        initial={{ scale: 0, rotate: -24 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.08, type: "spring", damping: 13, stiffness: 290 }}
      >
        {badge.icon}
      </motion.span>

      {/* Text */}
      <div className="relative z-10 min-w-0">
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-white/42 mb-0.5">
          Badge Earned · {badge.rarity}
        </p>
        <p className={`text-[13.5px] font-bold leading-tight truncate ${s.label}`}>
          {badge.title}
        </p>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// RANK-UP BANNER
// ═══════════════════════════════════════════════════════════════════════
const RankUpBanner = ({ league, eventKey, onDismiss }) => {
  const rc = RANK_STYLE[league] ?? { text: "text-white", glow: "rgba(255,255,255,0.4)" };

  return (
    <motion.div
      key={eventKey}
      className="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-auto cursor-pointer"
      initial={{ y: -110, opacity: 0, scale: 0.88 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -110, opacity: 0, scale: 0.88 }}
      transition={{ type: "spring", damping: 20, stiffness: 285 }}
      onClick={onDismiss}
    >
      <div className="relative overflow-hidden flex items-center gap-3.5 bg-[#0c0c0c]/96 border border-white/10 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md">
        {/* Shimmer sweep */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)",
          }}
          initial={{ x: "-115%" }}
          animate={{ x: "215%" }}
          transition={{ delay: 0.28, duration: 0.85, ease: "easeInOut" }}
        />

        {/* Pulsing trophy glow halo */}
        <div className="relative z-10 shrink-0">
          <motion.div
            className="absolute inset-0 rounded-full -z-10"
            style={{
              background: `radial-gradient(circle, ${rc.glow} 0%, transparent 75%)`,
            }}
            animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
          />
          <Trophy className="w-5 h-5 text-yellow-400" />
        </div>

        {/* Text */}
        <div className="relative z-10">
          <p className="text-[9px] uppercase tracking-[0.26em] font-bold text-white/38 mb-0.5">
            Rank Up!
          </p>
          <motion.p
            className={`text-[15px] font-black ${rc.text}`}
            style={{ textShadow: `0 0 18px ${rc.glow}` }}
            animate={{ opacity: [0.82, 1, 0.82] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {league}
          </motion.p>
        </div>

        {/* Particle sparks bursting from trophy */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 5) * Math.PI * 2;
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-yellow-400 pointer-events-none z-20"
              style={{ left: "18px", top: "50%" }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
              animate={{
                x: Math.cos(angle) * 22,
                y: Math.sin(angle) * 18,
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0],
              }}
              transition={{
                delay: 0.28 + i * 0.06,
                duration: 0.65,
                ease: "easeOut",
              }}
            />
          );
        })}
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN OVERLAY — mounted once globally in MainLayout
// ═══════════════════════════════════════════════════════════════════════
export default function GamificationOverlay() {
  const [xpEvent, setXpEvent]   = useState(null); // { key, amount }
  const [levelUp, setLevelUp]   = useState(null); // { key, level }
  const [badges, setBadges]     = useState([]);   // [{ id, title, icon, rarity }]
  const [rankUp, setRankUp]     = useState(null); // { key, league }

  // Rapid XP events within 90ms are accumulated into one display
  const xpAccRef   = useRef(0);
  const xpTimerRef = useRef(null);

  const handle = useCallback((ev) => {
    switch (ev.type) {
      case "xp": {
        xpAccRef.current += ev.amount;
        clearTimeout(xpTimerRef.current);
        xpTimerRef.current = setTimeout(() => {
          setXpEvent({ key: Date.now(), amount: xpAccRef.current });
          xpAccRef.current = 0;
          playXPGainSound();
        }, 90);
        break;
      }
      case "levelUp":
        setLevelUp({ key: Date.now(), level: ev.level });
        playLevelUpSound();
        break;
      case "badge": {
        const id = Date.now() + Math.random();
        setBadges((p) => [...p, { id, ...ev }]);
        playBadgeEarnedSound(ev.rarity || "Common");
        setTimeout(() => setBadges((p) => p.filter((b) => b.id !== id)), 4400);
        break;
      }
      case "rankUp":
        setRankUp({ key: Date.now(), league: ev.league });
        playRankChangeSound();
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => onEvent(handle), [handle]);

  // Cleanup accumulated XP timer on unmount
  useEffect(() => () => clearTimeout(xpTimerRef.current), []);

  // XP auto-dismiss (keyed so rapid events don't cancel each other)
  useEffect(() => {
    if (!xpEvent) return;
    const { key } = xpEvent;
    const t = setTimeout(
      () => setXpEvent((p) => (p?.key === key ? null : p)),
      2100,
    );
    return () => clearTimeout(t);
  }, [xpEvent?.key]);

  // Level-up auto-dismiss
  useEffect(() => {
    if (!levelUp) return;
    const k = levelUp.key;
    const t = setTimeout(
      () => setLevelUp((p) => (p?.key === k ? null : p)),
      4900,
    );
    return () => clearTimeout(t);
  }, [levelUp?.key]);

  // Rank-up auto-dismiss
  useEffect(() => {
    if (!rankUp) return;
    const k = rankUp.key;
    const t = setTimeout(
      () => setRankUp((p) => (p?.key === k ? null : p)),
      3300,
    );
    return () => clearTimeout(t);
  }, [rankUp?.key]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">

      {/* XP Float — hidden while level-up ceremony is active */}
      <AnimatePresence>
        {xpEvent && !levelUp && (
          <XPFloat amount={xpEvent.amount} eventKey={xpEvent.key} />
        )}
      </AnimatePresence>

      {/* Level-Up Ceremony — full-screen takeover */}
      <AnimatePresence>
        {levelUp && (
          <LevelUpCeremony
            key={levelUp.key}
            level={levelUp.level}
            onDismiss={() => setLevelUp(null)}
          />
        )}
      </AnimatePresence>

      {/* Badge Stack — bottom-right, stacks upward */}
      <div className="absolute bottom-6 right-6 flex flex-col-reverse gap-3 items-end">
        <AnimatePresence mode="popLayout">
          {badges.map((badge) => (
            <BadgeToast
              key={badge.id}
              badge={badge}
              onRemove={() =>
                setBadges((p) => p.filter((b) => b.id !== badge.id))
              }
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Rank-Up Banner — drops from top */}
      <AnimatePresence>
        {rankUp && (
          <RankUpBanner
            key={rankUp.key}
            league={rankUp.league}
            eventKey={rankUp.key}
            onDismiss={() => setRankUp(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
