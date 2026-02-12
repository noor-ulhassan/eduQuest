import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  Twitter,
  Sparkles,
  Heart,
  BadgeCheck,
} from "lucide-react";
import { hypeData } from "../../data/hypeData";

const MascotTweet = () => {
  const [currentHype, setCurrentHype] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [cloudVisible, setCloudVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  const timers = useRef({
    mute: null,
    cloudExpiry: null,
    automation: null,
  });

  const startMuteCooldown = useCallback((duration = 300000) => {
    setIsMuted(true);
    setCloudVisible(false);
    const expiry = Date.now() + duration;
    localStorage.setItem("eduQuest_homie_mute", expiry.toString());
    if (timers.current.mute) clearTimeout(timers.current.mute);
    timers.current.mute = setTimeout(() => {
      setIsMuted(false);
      localStorage.removeItem("eduQuest_homie_mute");
    }, duration);
  }, []);

  useEffect(() => {
    const savedMute = localStorage.getItem("eduQuest_homie_mute");
    if (savedMute && Date.now() < parseInt(savedMute)) {
      const remaining = parseInt(savedMute) - Date.now();
      startMuteCooldown(remaining);
    }
  }, [startMuteCooldown]);

  const triggerCloud = useCallback(() => {
    if (isMuted || isVisible || cloudVisible) return;
    const pick = hypeData[Math.floor(Math.random() * hypeData.length)];
    setCurrentHype(pick);
    setCloudVisible(true);
    if (timers.current.cloudExpiry) clearTimeout(timers.current.cloudExpiry);
    timers.current.cloudExpiry = setTimeout(() => {
      if (!isVisible) startMuteCooldown();
    }, 7000);
  }, [isMuted, isVisible, cloudVisible, startMuteCooldown]);

  useEffect(() => {
    audioRef.current = new Audio("/pop.mp3");
    const nextInterval =
      Math.floor(Math.random() * (90000 - 45000 + 1)) + 45000;
    timers.current.automation = setInterval(triggerCloud, nextInterval);
    return () => {
      clearInterval(timers.current.automation);
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, [triggerCloud]);

  const handleOpenMessage = () => {
    if (isVisible) return;
    if (!currentHype || isMuted) {
      const pick = hypeData[Math.floor(Math.random() * hypeData.length)];
      setCurrentHype(pick);
    }
    if (timers.current.cloudExpiry) clearTimeout(timers.current.cloudExpiry);
    setCloudVisible(false);
    setIsVisible(true);
    audioRef.current.play().catch(() => {});
    setTimeout(() => {
      setIsVisible(false);
      startMuteCooldown();
    }, 9000);
  };

  const handleManualDismissCloud = (e) => {
    e.stopPropagation();
    if (timers.current.cloudExpiry) clearTimeout(timers.current.cloudExpiry);
    startMuteCooldown();
  };

  return (
    <>
      <div className="fixed bottom-8 left-8 z-[120] flex flex-col items-center">
        {/* Zzz ANIMATION - Muted state */}
        <AnimatePresence>
          {isMuted && !isVisible && (
            <motion.div className="absolute -top-14 flex gap-1 pointer-events-none">
              {[1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  animate={{ y: [-5, -35], opacity: [0, 1, 0], x: [0, 12] }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    delay: i * 0.8,
                  }}
                  className="text-indigo-400 font-bold text-2xl select-none"
                >
                  Z
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CLOUD NOTIFICATION - "Homie has something to say..." */}
        <AnimatePresence>
          {cloudVisible && !isMuted && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-4 bg-zinc-900 text-white px-5 py-2.5 rounded-2xl shadow-xl relative border border-zinc-800"
            >
              <div className="flex items-center gap-4">
                <p className="text-[13px] font-semibold tracking-tight">
                  Homie has something to say...
                </p>
                <button
                  onClick={handleManualDismissCloud}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={14} className="text-zinc-400" />
                </button>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-zinc-900 border-r border-b border-zinc-800 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* MASCOT BUTTON - Contracted state */}
        <motion.button
          onClick={handleOpenMessage}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          animate={!isMuted ? { y: [0, -6, 0] } : {}}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="group flex items-center bg-white p-1.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-zinc-100 hover:border-indigo-100 transition-all duration-300"
        >
          {/* Circular Avatar Wrapper */}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-50 flex-shrink-0 border-2 border-white shadow-sm">
            <img
              src="/bmo1.gif"
              alt="mascot"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Hover Message - Background matches avatar bg (indigo-50) */}
          <div className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out">
            <div className="bg-indigo-50 h-10 ml-2 rounded-full flex items-center px-4">
              <span className="text-xs font-black text-indigo-600 whitespace-nowrap tracking-tight">
                Homie has something to say...
              </span>
            </div>
          </div>
        </motion.button>
      </div>

      {/* EXPANDED TWEET BOX - The Message */}
      <AnimatePresence>
        {isVisible && currentHype && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="fixed bottom-32 left-8 z-[110]"
          >
            <div className="relative bg-white w-[340px] rounded-[2rem] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.15)] border border-zinc-100">
              <button
                onClick={() => {
                  setIsVisible(false);
                  startMuteCooldown();
                }}
                className="absolute top-6 right-6 text-zinc-300 hover:text-zinc-900 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-100 bg-zinc-50 shadow-inner">
                  <img
                    src={currentHype.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-zinc-900 text-base truncate leading-none">
                      {currentHype.username}
                    </span>
                    <BadgeCheck
                      size={20}
                      className="text-white fill-blue-500 flex-shrink-0"
                    />
                  </div>
                  <span className="text-zinc-400 text-xs font-medium tracking-tight">
                    {currentHype.handle}
                  </span>
                </div>
              </div>

              <p className="text-zinc-800 font-bold leading-[1.4] mb-5 text-[1.15rem] tracking-tight">
                "{currentHype.message}"
              </p>

              <div className="flex items-center gap-5 pt-2 border-t border-zinc-100">
                <Heart
                  size={18}
                  className="text-zinc-200 hover:text-red-500 transition-colors cursor-pointer"
                />
              </div>
            </div>
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-white -mt-[1px] ml-10 drop-shadow-sm" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MascotTweet;
