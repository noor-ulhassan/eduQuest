import React from "react";
import { Copy, Check } from "lucide-react";

const RoomCodeCard = ({ roomCode, copied, onCopyCode, onCopyLink }) => (
  <div
    className="relative rounded-2xl overflow-hidden"
    style={{ background: "linear-gradient(135deg,#0f0f0f,#111)", border: "1px solid #1e1e1e" }}
  >
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
    <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2.5">
          Competition Arena
        </p>
        <div className="flex items-center gap-1.5">
          {roomCode.split("").map((char, i) => (
            <div
              key={i}
              className="w-10 h-11 rounded-lg flex items-center justify-center font-mono text-xl font-black text-orange-400"
              style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.18)" }}
            >
              {char}
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onCopyCode}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#71717a" }}
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy Code"}
        </button>
        <button
          onClick={onCopyLink}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
          style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)" }}
        >
          <Copy size={14} className="text-orange-400" />
          Invite Link
        </button>
      </div>
    </div>
  </div>
);

export default RoomCodeCard;
