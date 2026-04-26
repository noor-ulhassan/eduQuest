import React from "react";
import { ArrowLeft } from "lucide-react";

const LobbyHeader = ({ isHost, onLeave }) => (
  <header className="flex items-center justify-between">
    <button
      onClick={onLeave}
      className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-900"
    >
      <ArrowLeft size={16} /> Exit Lobby
    </button>
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Live
      </span>
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">
        {isHost ? "Host" : "Player"}
      </span>
    </div>
  </header>
);

export default LobbyHeader;
