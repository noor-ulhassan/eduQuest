import React, { useEffect, useState, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  fireBanner,
  subscribeBanner,
  PRIORITY,
} from "@/lib/feedbackOrchestrator";
import { playStreakSound, playLeadChangeSound } from "@/lib/sound";

// Mapping of activity event type → banner config (tone, sound, priority)
const BIG_TYPES = {
  firstBlood: { tone: "red", priority: PRIORITY.HIGH, duration: 1900 },
  leadTaken: { tone: "yellow", priority: PRIORITY.HIGH, duration: 1900 },
  streak3: { tone: "orange", priority: PRIORITY.MEDIUM, duration: 1500 },
  streak5: { tone: "orange", priority: PRIORITY.HIGH, duration: 2000 },
  streak7: { tone: "purple", priority: PRIORITY.HIGH, duration: 2200 },
};

const TONE = {
  yellow: "from-amber-400 via-yellow-400 to-amber-500 text-black",
  orange: "from-orange-500 via-red-500 to-orange-600 text-white",
  purple: "from-violet-500 via-purple-600 to-fuchsia-600 text-white",
  red: "from-rose-500 via-red-600 to-rose-700 text-white",
};

const BigMomentBanner = ({ events = [] }) => {
  const [active, setActive] = useState(null);
  const seenIdsRef = useRef(new Set());

  // 1. Subscribe to the orchestrator's banner channel (single source of truth)
  useEffect(() => subscribeBanner(setActive), []);

  // 2. Watch activity events and FIRE banners through the orchestrator
  useEffect(() => {
    for (const evt of events) {
      const cfg = BIG_TYPES[evt.type];
      if (!cfg) continue;
      if (seenIdsRef.current.has(evt.id)) continue;
      seenIdsRef.current.add(evt.id);

      // Side-effect: matching sound, gated by the orchestrator's sound channel
      if (evt.type === "leadTaken") playLeadChangeSound();
      else if (evt.type === "streak5") playStreakSound(5);
      else if (evt.type === "streak7") playStreakSound(7);
      else if (evt.type === "streak3") playStreakSound(3);
      else if (evt.type === "firstBlood") playLeadChangeSound();

      fireBanner({
        id: evt.id,
        type: evt.type,
        icon: evt.icon,
        text: evt.text,
        tone: cfg.tone,
        priority: cfg.priority,
        duration: cfg.duration,
      });
    }
  }, [events]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: -24, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className={`px-5 py-2.5 rounded-full bg-gradient-to-r ${
              TONE[active.tone] || TONE.orange
            } shadow-2xl flex items-center gap-2 font-black text-sm tracking-wide`}
          >
            <span className="text-lg leading-none">{active.icon}</span>
            <span className="uppercase">{active.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BigMomentBanner;
