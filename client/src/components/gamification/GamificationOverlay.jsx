import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import Lottie from "lottie-react";
import { onEvent } from "@/lib/gamificationBus";
import {
  playLevelUpSound,
  playBadgeEarnedSound,
  playRankChangeSound,
  playXPGainSound,
} from "@/lib/sound";
import confetti from "canvas-confetti";

const RARITY = {
  Common: {
    bg: "from-zinc-600 to-zinc-800",
    border: "border-zinc-400/70",
    label: "text-zinc-100",
    glow: "shadow-[0_0_20px_rgba(200,200,200,0.25)]",
    shimmer: "rgba(255,255,255,0.35)",
  },
  Rare: {
    bg: "from-blue-500 to-blue-900",
    border: "border-blue-300/80",
    label: "text-blue-50",
    glow: "shadow-[0_0_40px_rgba(59,130,246,0.8),0_0_80px_rgba(59,130,246,0.3)]",
    shimmer: "rgba(147,197,253,0.45)",
  },
  Epic: {
    bg: "from-purple-500 to-purple-900",
    border: "border-purple-300/80",
    label: "text-purple-50",
    glow: "shadow-[0_0_40px_rgba(168,85,247,0.8),0_0_80px_rgba(168,85,247,0.35)]",
    shimmer: "rgba(216,180,254,0.45)",
  },
  Legendary: {
    bg: "from-amber-400 to-orange-800",
    border: "border-amber-300/90",
    label: "text-amber-50",
    glow: "shadow-[0_0_50px_rgba(245,158,11,0.9),0_0_100px_rgba(245,158,11,0.4)]",
    shimmer: "rgba(253,230,138,0.5)",
  },
};

const RANK_STYLE = {
  Novice: { text: "text-zinc-300", glow: "rgba(161,161,170,0.7)" },
  Bronze: { text: "text-amber-500", glow: "rgba(217,119,6,0.8)" },
  Silver: { text: "text-slate-200", glow: "rgba(203,213,225,0.8)" },
  Gold: { text: "text-yellow-300", glow: "rgba(250,204,21,0.85)" },
  Platinum: { text: "text-cyan-200", glow: "rgba(103,232,249,0.85)" },
  Diamond: { text: "text-blue-300", glow: "rgba(96,165,250,0.85)" },
  Master: { text: "text-purple-300", glow: "rgba(192,132,252,0.85)" },
  Grandmaster: { text: "text-red-300", glow: "rgba(248,113,113,0.9)" },
};


// Precomputed spark positions — radially spread from center
const SPARKS = [
  { tx: -64, ty: -14 }, { tx: 66, ty: -10 },
  { tx: -50, ty: 38 },  { tx: 52, ty: 34 },
  { tx: -80, ty:  8 },  { tx: 82, ty: 12 },
  { tx: -20, ty: -58 }, { tx: 22, ty: -56 },
  { tx:  -4, ty:  64 }, { tx:  8, ty:  66 },
];

const XPFloat = ({ amount, eventKey }) => (
  <motion.div
    key={eventKey}
    className="absolute bottom-[32%] left-0 right-0 flex justify-center pointer-events-none"
    // Outer: fade in/out + slow upward drift
    initial={{ opacity: 0, y: 0 }}
    animate={{ opacity: [0, 1, 1, 0], y: [0, 0, -22, -92] }}
    transition={{ duration: 2.1, times: [0, 0.06, 0.60, 1], ease: "easeIn" }}
  >
    {/* Inner: slam physics — drops from above with squish/stretch bounce */}
    <motion.div
      className="relative flex flex-col items-center select-none"
      initial={{ y: -54, scaleY: 1.38, scaleX: 0.76 }}
      animate={{ y: 0, scaleY: [null, 0.80, 1.10, 0.97, 1], scaleX: [null, 1.16, 0.94, 1.02, 1] }}
      transition={{ duration: 0.38, times: [0, 0.26, 0.56, 0.80, 1], ease: "easeOut" }}
    >
      {/* Radial spark burst */}
      {SPARKS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width:  i % 2 === 0 ? 4 : 3,
            height: i % 2 === 0 ? 4 : 9,
            top: "46%", left: "50%",
            marginLeft: i % 2 === 0 ? -2 : -1.5,
            marginTop:  i % 2 === 0 ? -2 : -4.5,
            background: i % 3 === 0
              ? "linear-gradient(to bottom, #fde68a, #f97316)"
              : i % 3 === 1
              ? "linear-gradient(to bottom, #fb923c, #dc2626)"
              : "#fcd34d",
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: s.tx, y: s.ty, opacity: 0, scale: 0.15 }}
          transition={{ delay: 0.04 + i * 0.011, duration: 0.52, ease: "easeOut" }}
        />
      ))}

      {/* Shockwave ring — expands from the number on impact */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          inset: "-14px",
          borderRadius: "10px",
          border: "1.5px solid rgba(249,115,22,0.7)",
          boxShadow: "0 0 14px rgba(251,146,60,0.45)",
        }}
        initial={{ scale: 0.55, opacity: 0.9 }}
        animate={{ scale: 2.8, opacity: 0 }}
        transition={{ delay: 0.04, duration: 0.62, ease: "easeOut" }}
      />

      {/* Number row */}
      <div className="relative flex items-end gap-2 px-2">
        {/* + prefix — large but subordinate */}
        <span
          className="text-[34px] font-black text-metallic-orange leading-none mb-3"
          style={{ letterSpacing: "-0.02em" }}
        >
          +
        </span>

        {/* Hero number — the centerpiece */}
        <div className="relative overflow-hidden">
          {/* Diagonal light sweep on impact */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(110deg, transparent 18%, rgba(255,255,255,0.48) 50%, transparent 82%)",
            }}
            initial={{ x: "-130%" }}
            animate={{ x: "200%" }}
            transition={{ delay: 0.07, duration: 0.27, ease: "easeIn" }}
          />
          <span
            className="relative text-[84px] font-black text-metallic-orange leading-none"
            style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em" }}
          >
            {amount}
          </span>
        </div>

        {/* XP label — stacked, offset into the baseline */}
        <div className="mb-[18px] flex flex-col items-start gap-[3px]">
          <span className="text-[14px] font-black text-metallic tracking-[0.30em] uppercase leading-none">
            XP
          </span>
          <span className="text-[8px] font-bold text-white/28 tracking-[0.20em] uppercase leading-none">
            EARNED
          </span>
        </div>
      </div>

      {/* Impact underline — sweeps in from center */}
      <motion.div
        className="rounded-full"
        style={{
          height: 3,
          width: "86%",
          background:
            "linear-gradient(90deg, transparent, #fb923c 22%, #fde68a 50%, #fb923c 78%, transparent)",
          boxShadow: "0 0 10px rgba(251,146,60,0.65)",
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [0, 1, 0.45] }}
        transition={{ delay: 0.06, duration: 0.30, times: [0, 0.32, 1] }}
      />
    </motion.div>
  </motion.div>
);

const LevelUpCeremony = ({ level, onDismiss }) => {
  useEffect(() => {
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
      confetti({ particleCount: 60, angle: 58, spread: 54, startVelocity: 60, origin: { x: 0.06, y: 0.52 }, colors: ["#FFD700", "#FFA500", "#FF6B35"], ticks: 80, scalar: 0.8, zIndex: 10000 });
      confetti({ particleCount: 60, angle: 122, spread: 54, startVelocity: 60, origin: { x: 0.94, y: 0.52 }, colors: ["#FFD700", "#FFA500", "#FF6B35"], ticks: 80, scalar: 0.8, zIndex: 10000 });
    }, 490);

    return () => { clearTimeout(t1); clearTimeout(t2); };
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
      {/* White screen flash */}
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />

      {/* Dark radial backdrop */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(251,191,36,0.18) 0%, rgba(0,0,0,0.93) 65%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28, delay: 0.06 }}
      />

      {/* Main content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-2 select-none"
        initial={{ scale: 0.7, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.75, opacity: 0, y: -20 }}
        transition={{ type: "spring", damping: 18, stiffness: 280, delay: 0.08 }}
      >
        {/* LEVEL UP label */}
        <motion.p
          className="text-[13px] font-black uppercase text-yellow-300 text-center"
          style={{ textShadow: "0 0 20px rgba(250,204,21,0.8), 0 0 40px rgba(250,204,21,0.4)", textIndent: "0.55em" }}
          initial={{ opacity: 0, letterSpacing: "0.15em" }}
          animate={{ opacity: 1, letterSpacing: "0.55em" }}
          transition={{ delay: 0.22, duration: 0.38 }}
        >
          Level Up!
        </motion.p>

        {/* Lottie animation with level number overlay */}
        <div className="relative flex items-center justify-center -my-2">
          <Lottie
            path="/lottie/level%20up.json"
            loop={false}
            autoplay
            style={{ width: 340, height: 340 }}
          />
          <motion.p
            className="absolute font-black text-white leading-none pointer-events-none"
            style={{
              fontSize: 88,
              textShadow: "0 0 50px rgba(251,191,36,1), 0 0 100px rgba(251,191,36,0.6), 0 0 180px rgba(251,191,36,0.3)",
            }}
            initial={{ scale: 2, opacity: 0, filter: "blur(16px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", damping: 20, stiffness: 320, delay: 0.35 }}
          >
            {level}
          </motion.p>
        </div>

        {/* XP fill bar */}
        <motion.div
          className="w-52"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="h-[6px] w-full bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #FBBF24, #F59E0B, #F97316, #EF4444)",
                boxShadow: "0 0 20px rgba(249,115,22,0.9), 0 0 40px rgba(249,115,22,0.4)",
              }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.52, duration: 0.88, ease: [0.34, 1.56, 0.64, 1] }}
            />
          </div>
        </motion.div>

        {/* New rewards badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", damping: 18, stiffness: 280 }}
          className="relative overflow-hidden text-sm font-bold text-metallic-orange bg-yellow-400/20 border border-yellow-400/50 px-8 py-2.5 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.3)]"
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)" }}
            initial={{ x: "-115%" }}
            animate={{ x: "215%" }}
            transition={{ delay: 0.65, duration: 0.72, ease: "easeInOut" }}
          />
          New rewards unlocked ✦
        </motion.div>

        <p className="text-[10px] text-white/55 mt-0.5 font-medium tracking-wide">
          tap anywhere to dismiss
        </p>
      </motion.div>
    </motion.div>
  );
};

const BadgeToast = ({ badge, onRemove }) => {
  const s = RARITY[badge.rarity] ?? RARITY.Common;

  return (
    <motion.div
      initial={{ x: 140, opacity: 0, scale: 0.88 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 140, opacity: 0, scale: 0.88, transition: { duration: 0.2 } }}
      transition={{ type: "spring", damping: 22, stiffness: 290 }}
      className={`absolute bottom-6 right-6 overflow-hidden flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-gradient-to-r ${s.bg} border ${s.border} ${s.glow} backdrop-blur-md shadow-2xl cursor-pointer max-w-[285px] pointer-events-auto`}
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
          style={{ border: "2px solid rgba(245,158,11,0.85)", boxShadow: "0 0 15px rgba(245,158,11,0.4)" }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Badge icon — pops in */}
      <motion.span
        className="text-[38px] leading-none shrink-0 relative z-10 flex items-center justify-center"
        style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.4))", width: 44, height: 44 }}
        initial={{ scale: 0, rotate: -24 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          delay: 0.08,
          type: "spring",
          damping: 13,
          stiffness: 290,
        }}
      >
        {badge.icon}
      </motion.span>

      {/* Text */}
      <div className="relative z-10 min-w-0">
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-white/65 mb-0.5">
          Badge Earned · {badge.rarity}
        </p>
        <p
          className={`text-[13.5px] font-bold leading-tight truncate ${s.label}`}
        >
          {badge.title}
        </p>
      </div>
    </motion.div>
  );
};

const RankUpBanner = ({ league, eventKey, onDismiss }) => {
  const rc = RANK_STYLE[league] ?? {
    text: "text-white",
    glow: "rgba(255,255,255,0.4)",
  };

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
      <div className="relative overflow-hidden flex items-center gap-3.5 bg-[#0c0c0c] border border-white/20 px-5 py-3.5 rounded-2xl shadow-[0_0_40px_rgba(250,204,21,0.2),0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-md">
        {/* Shimmer sweep */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
          }}
          initial={{ x: "-115%" }}
          animate={{ x: "215%" }}
          transition={{ delay: 0.28, duration: 0.85, ease: "easeInOut" }}
        />

        {/* Pulsing trophy glow halo */}
        <div className="relative z-10 shrink-0 flex items-center justify-center" style={{ width: 24, height: 24 }}>
          <motion.div
            className="absolute inset-[-8px] rounded-full -z-10"
            style={{
              background: `radial-gradient(circle, ${rc.glow} 0%, transparent 75%)`,
            }}
            animate={{ scale: [0.8, 1.8, 0.8], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
          />
          <Trophy className="w-5 h-5 text-yellow-300" style={{ filter: "drop-shadow(0 0 6px rgba(250,204,21,0.8))" }} />
        </div>

        {/* Text */}
        <div className="relative z-10">
          <p className="text-[9px] uppercase tracking-[0.26em] font-bold text-white/60 mb-0.5">
            Rank Up!
          </p>
          <motion.p
            className={`text-[15px] font-black ${rc.text}`}
            style={{ textShadow: `0 0 25px ${rc.glow}, 0 0 50px ${rc.glow}` }}
            animate={{ opacity: [0.88, 1, 0.88] }}
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
              className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300 pointer-events-none z-20"
              style={{
                left: "32px",
                top: "50%",
                marginTop: -3,
                boxShadow: "0 0 6px rgba(250,204,21,0.9)",
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
              animate={{
                x: Math.cos(angle) * 28,
                y: Math.sin(angle) * 24,
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0],
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

// How long each event stays visible before auto-advancing (ms)
const DURATION = { xp: 1900, levelUp: 5500, badge: 4200, rankUp: 3500 };

function soundFor(ev) {
  switch (ev.type) {
    case "xp":    playXPGainSound(); break;
    case "levelUp": playLevelUpSound(); break;
    case "badge": playBadgeEarnedSound(ev.rarity || "Common"); break;
    case "rankUp": playRankChangeSound(); break;
  }
}

export default function GamificationOverlay() {
  const [activeEvent, setActiveEvent] = useState(null);

  const queueRef    = useRef([]);   // pending events
  const runningRef  = useRef(false); // true while queue is being drained
  const autoTimer   = useRef(null);
  const startTimer  = useRef(null);
  const xpAccRef    = useRef(0);
  const xpTimer     = useRef(null);

  // advanceRef always holds the latest closure so setTimeout callbacks never go stale
  const advanceRef = useRef(null);
  advanceRef.current = () => {
    clearTimeout(autoTimer.current);
    if (queueRef.current.length === 0) {
      runningRef.current = false;
      setActiveEvent(null);
      return;
    }
    const next = queueRef.current.shift();
    setActiveEvent(next);
    soundFor(next);
    autoTimer.current = setTimeout(() => advanceRef.current(), DURATION[next.type] ?? 3500);
  };

  const handle = useCallback((ev) => {
    switch (ev.type) {
      case "xp": {
        // Accumulate rapid XP bursts, then unshift so XP always shows BEFORE
        // the level-up it triggered (both arrive on the same socket event).
        xpAccRef.current += ev.amount;
        clearTimeout(xpTimer.current);
        xpTimer.current = setTimeout(() => {
          queueRef.current.unshift({ type: "xp", amount: xpAccRef.current, key: Date.now() });
          xpAccRef.current = 0;
          if (!runningRef.current) {
            runningRef.current = true;
            // Small delay so any same-tick events finish queuing first
            startTimer.current = setTimeout(() => advanceRef.current(), 80);
          }
        }, 0);
        break;
      }
      case "levelUp":
        queueRef.current.push({ type: "levelUp", level: ev.level, key: Date.now() });
        if (!runningRef.current) {
          runningRef.current = true;
          startTimer.current = setTimeout(() => advanceRef.current(), 80);
        }
        break;
      case "badge":
        queueRef.current.push({ type: "badge", ...ev, key: Date.now() + Math.random() });
        if (!runningRef.current) {
          runningRef.current = true;
          startTimer.current = setTimeout(() => advanceRef.current(), 80);
        }
        break;
      case "rankUp":
        queueRef.current.push({ type: "rankUp", league: ev.league, key: Date.now() });
        if (!runningRef.current) {
          runningRef.current = true;
          startTimer.current = setTimeout(() => advanceRef.current(), 80);
        }
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => onEvent(handle), [handle]);
  useEffect(() => () => {
    clearTimeout(autoTimer.current);
    clearTimeout(startTimer.current);
    clearTimeout(xpTimer.current);
  }, []);

  const dismiss = useCallback(() => advanceRef.current(), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {activeEvent?.type === "xp" && (
          <XPFloat key={activeEvent.key} amount={activeEvent.amount} eventKey={activeEvent.key} />
        )}
        {activeEvent?.type === "levelUp" && (
          <LevelUpCeremony key={activeEvent.key} level={activeEvent.level} onDismiss={dismiss} />
        )}
        {activeEvent?.type === "badge" && (
          <BadgeToast key={activeEvent.key} badge={activeEvent} onRemove={dismiss} />
        )}
        {activeEvent?.type === "rankUp" && (
          <RankUpBanner key={activeEvent.key} league={activeEvent.league} eventKey={activeEvent.key} onDismiss={dismiss} />
        )}
      </AnimatePresence>
    </div>
  );
}
