import React, { useState, useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  playVSScreenSound,
  playCountdownTickSound,
  playCountdownGoSound,
} from "@/lib/sound";

/**
 * VSScreen — Animated "VS" screen with 3-2-1-GO countdown.
 *
 * Props:
 *  - players: Array of { name, avatarUrl }
 *  - onComplete: () => void — called after countdown finishes
 *  - settings: { topic, difficulty, challengeMode }
 */
const VSScreen = ({ players = [], onComplete, settings }) => {
  const [phase, setPhase] = useState("vs"); // "vs" | 3 | 2 | 1 | "go"
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    playVSScreenSound();

    const timers = [];
    timers.push(setTimeout(() => { setPhase(3); playCountdownTickSound(); }, 1500));
    timers.push(setTimeout(() => { setPhase(2); playCountdownTickSound(); }, 2500));
    timers.push(setTimeout(() => { setPhase(1); playCountdownTickSound(); }, 3500));
    timers.push(
      setTimeout(() => {
        setPhase("go");
        playCountdownGoSound();
      }, 4500),
    );
    timers.push(setTimeout(() => onCompleteRef.current?.(), 5200));

    return () => timers.forEach(clearTimeout);
  }, []); // Run once on mount only

  // Split players into two sides
  const left = players.slice(0, Math.ceil(players.length / 2));
  const right = players.slice(Math.ceil(players.length / 2));

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center overflow-hidden">
      {/* Animated background beams */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.15)_0%,_transparent_50%)]" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-orange-500/20"
          animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-orange-500/10"
          animate={{ scale: [1, 3], opacity: [0.2, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.5,
          }}
        />
      </div>

      {/* Player Sides */}
      <div className="absolute inset-0 flex items-center justify-between px-8 md:px-20">
        {/* Left Side */}
        <motion.div
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="flex flex-col items-center gap-4"
        >
          {left.map((p, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
              className="flex flex-col items-center gap-2"
            >
              <div className="relative">
                <img
                  src={p.avatarUrl || "/Avatar.png"}
                  alt={p.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-3 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] object-cover"
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-blue-400"
                  animate={{ scale: [1, 1.2], opacity: [0.6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <span className="text-sm font-semibold text-blue-300 truncate max-w-[100px]">
                {p.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="flex flex-col items-center gap-4"
        >
          {right.map((p, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
              className="flex flex-col items-center gap-2"
            >
              <div className="relative">
                <img
                  src={p.avatarUrl || "/Avatar.png"}
                  alt={p.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-3 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] object-cover"
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-red-400"
                  animate={{ scale: [1, 1.2], opacity: [0.6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <span className="text-sm font-semibold text-red-300 truncate max-w-[100px]">
                {p.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Center Phase Display */}
      <AnimatePresence mode="wait">
        {phase === "vs" && (
          <motion.div
            key="vs"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative z-10 flex flex-col items-center"
          >
            <span className="text-8xl md:text-9xl font-black bg-gradient-to-b from-orange-400 to-red-600 bg-clip-text text-transparent drop-shadow-2xl tracking-tighter">
              VS
            </span>
            {settings?.topic && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-zinc-400 text-sm mt-4 uppercase tracking-widest font-bold"
              >
                {settings.topic}
              </motion.p>
            )}
          </motion.div>
        )}

        {typeof phase === "number" && (
          <motion.span
            key={phase}
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10 text-[12rem] md:text-[16rem] font-black text-white/90 leading-none"
            style={{ textShadow: "0 0 80px rgba(249,115,22,0.5)" }}
          >
            {phase}
          </motion.span>
        )}

        {phase === "go" && (
          <motion.span
            key="go"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.4, 1] }}
            exit={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 text-7xl md:text-9xl font-black text-green-400 uppercase"
            style={{ textShadow: "0 0 60px rgba(34,197,94,0.6)" }}
          >
            GO!
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VSScreen;
