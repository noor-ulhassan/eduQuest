import React from "react";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

const LobbyHeader = ({ isHost, onLeave, isMusicMuted, onToggleMusic }) => (
  <header className="flex items-center justify-between pb-5 border-b border-zinc-900/60">
    <button
      onClick={onLeave}
      className="flex items-center gap-2 text-metallic hover:text-metallic-orange text-sm font-bold transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-900/80"
    >
      <ArrowLeft size={16} /> Exit Lobby
    </button>

    <div className="hidden sm:flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-3">
        <motion.img
          src="/swords-silver.png"
          alt="sword"
          height={30}
          width={30}
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
        />
        <div className="flex flex-col items-center">
          <span className="text-2xl font-black tracking-tight text-metallic leading-none">
            Competition Arena
          </span>
          <span className="text-[10px] text-zinc-600 font-medium tracking-[0.22em] uppercase mt-1">
            May the best player win
          </span>
        </div>
        <motion.img
          src="/swords-silver.png"
          alt="sword"
          height={30}
          width={30}
          style={{ transform: "scaleX(-1)" }}
          animate={{ rotate: [4, -4, 4] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
        />
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={onToggleMusic}
        title={isMusicMuted ? "Unmute music" : "Mute music"}
        className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-500 hover:text-white transition-colors"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {isMusicMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
      <span
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
        style={{
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.25)",
          color: "#4ade80",
          boxShadow: "0 0 14px rgba(34,197,94,0.18)",
        }}
      >
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        />
        Live
      </span>
      <span
        className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
        style={{
          background: isHost ? "rgba(234,179,8,0.1)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${isHost ? "rgba(234,179,8,0.3)" : "rgba(255,255,255,0.08)"}`,
          color: isHost ? "#fbbf24" : "#71717a",
          boxShadow: isHost ? "0 0 10px rgba(234,179,8,0.12)" : "none",
        }}
      >
        {isHost ? "Host" : "Player"}
      </span>
    </div>
  </header>
);

export default LobbyHeader;
