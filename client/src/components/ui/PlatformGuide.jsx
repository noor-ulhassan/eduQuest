import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Lightbulb,
  Trophy,
  Users,
  BrainCircuit,
  HeartPulse,
  Info,
} from "lucide-react";
import { guideData } from "../../data/guideData";

const iconMap = {
  tip: <Lightbulb size={20} className="text-yellow-500" />,
  competition: <Trophy size={20} className="text-orange-500" />,
  motivation: <HeartPulse size={20} className="text-red-500" />,
  community: <Users size={20} className="text-blue-500" />,
  study: <BrainCircuit size={20} className="text-purple-500" />,
  wellness: <HeartPulse size={20} className="text-pink-500" />,
  meta: <Info size={20} className="text-indigo-500" />,
};

const PlatformGuide = () => {
  const [currentTip, setCurrentTip] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  const timers = useRef({
    mute: null,
    automation: null,
    hideBubble: null,
  });

  const startMuteCooldown = useCallback((duration = 120000) => {
    // 2 minutes cooldown
    setIsMuted(true);
    setIsVisible(false);
    const expiry = Date.now() + duration;
    localStorage.setItem("eduQuest_guide_mute", expiry.toString());

    if (timers.current.mute) clearTimeout(timers.current.mute);
    timers.current.mute = setTimeout(() => {
      setIsMuted(false);
      localStorage.removeItem("eduQuest_guide_mute");
    }, duration);
  }, []);

  useEffect(() => {
    const savedMute = localStorage.getItem("eduQuest_guide_mute");
    if (savedMute && Date.now() < parseInt(savedMute)) {
      const remaining = parseInt(savedMute) - Date.now();
      startMuteCooldown(remaining);
    }
  }, [startMuteCooldown]);

  const triggerTip = useCallback(() => {
    if (isMuted || isVisible) return;

    const pick = guideData[Math.floor(Math.random() * guideData.length)];
    setCurrentTip(pick);
    setIsVisible(true);

    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }

    if (timers.current.hideBubble) clearTimeout(timers.current.hideBubble);
    timers.current.hideBubble = setTimeout(() => {
      setIsVisible(false);
      startMuteCooldown(300000); // 5 min default cooldown after showing
    }, 8000); // Read time
  }, [isMuted, isVisible, startMuteCooldown]);

  useEffect(() => {
    audioRef.current = new Audio("/pop.mp3");
    // Trigger every 2-4 minutes if not muted
    const nextInterval =
      Math.floor(Math.random() * (240000 - 120000 + 1)) + 120000;
    timers.current.automation = setInterval(triggerTip, nextInterval);

    return () => {
      clearInterval(timers.current.automation);
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, [triggerTip]);

  const handleManualClick = () => {
    if (timers.current.hideBubble) clearTimeout(timers.current.hideBubble);

    // Always show a new tip when clicked manually
    const pick = guideData[Math.floor(Math.random() * guideData.length)];
    setCurrentTip(pick);
    setIsVisible(true);
    setIsMuted(false); // Unmute if they clicked it

    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }

    timers.current.hideBubble = setTimeout(() => {
      setIsVisible(false);
      startMuteCooldown(300000);
    }, 8000);
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    if (timers.current.hideBubble) clearTimeout(timers.current.hideBubble);
    setIsVisible(false);
    startMuteCooldown(600000); // Mute for 10 mins if manually dismissed
  };

  return (
    <div className="fixed bottom-6 right-6 z-[120] flex flex-col items-end">
      {/* Speech Bubble / Tip Box */}
      <AnimatePresence>
        {isVisible && currentTip && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mb-4 mr-2 bg-white px-5 py-4 rounded-2xl shadow-2xl relative border-2 border-indigo-100 max-w-[280px]"
          >
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 transition-colors p-1"
            >
              <X size={14} />
            </button>

            <div className="flex items-start gap-3 mt-1">
              <div className="bg-zinc-50 p-2 rounded-full shadow-inner border border-zinc-100 flex-shrink-0">
                {iconMap[currentTip.type] || iconMap.tip}
              </div>
              <p className="text-zinc-800 text-sm font-semibold leading-relaxed">
                {currentTip.message}
              </p>
            </div>

            {/* Speech bubble tail matching the border */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b-2 border-r-2 border-indigo-100 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot Avatar - Breathing Animation */}
      <motion.button
        onClick={handleManualClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="group relative flex items-center justify-center bg-indigo-50 w-16 h-16 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] border-4 border-white hover:border-indigo-200 transition-colors duration-300"
      >
        <img
          src="/bmo1.gif"
          alt="Guide Mascot"
          className="w-full h-full object-cover rounded-full"
        />

        {/* Zzz Animation when muted/sleeping */}
        <AnimatePresence>
          {isMuted && !isVisible && (
            <motion.div className="absolute -top-8 right-2 flex gap-1 pointer-events-none">
              {[1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], y: -20, x: i * 4 }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.6,
                  }}
                  className="text-indigo-400 font-bold text-sm select-none"
                >
                  z
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default PlatformGuide;
