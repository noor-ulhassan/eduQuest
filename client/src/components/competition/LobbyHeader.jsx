import React from "react";
import { ArrowLeft, Volume2, VolumeX, Swords } from "lucide-react";

const LobbyHeader = ({ isHost, onLeave, isMusicMuted, onToggleMusic }) => (
  <header className="flex items-center justify-between">
    <button
      onClick={onLeave}
      className="flex items-center gap-2 text-metallic hover:text-metallic-orange text-sm font-bold transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-900/80"
    >
      <ArrowLeft size={16} /> Exit Lobby
    </button>

    <div className="hidden sm:flex items-center gap-2.5">
      <img src="/swords-silver.png" alt="sword" height={28} width={28} />
      <span className="text-2xl font-black tracking-tight text-metallic">
        Competition Arena
      </span>
      <img src="/swords-silver.png" alt="sword" height={28} width={28} />
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
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
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
