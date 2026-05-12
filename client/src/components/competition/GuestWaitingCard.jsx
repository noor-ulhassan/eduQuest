import React from "react";
import { Swords, Code, BookOpen, CheckCircle2 } from "lucide-react";

const GuestWaitingCard = ({ settings, isReady, onToggleReady, readyCount, totalPlayers }) => (
  <div className="rounded-2xl overflow-hidden" style={{ background: "#0c0c0c", border: "1px solid #1a1a1a" }}>
    <div className="p-6 text-center space-y-5">
      <div className="relative w-14 h-14 mx-auto">
        <div className="absolute inset-0 rounded-full" style={{ border: "2px solid #1e1e1e" }} />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 animate-spin" />
        <div
          className="absolute inset-[5px] rounded-full flex items-center justify-center"
          style={{ background: "rgba(249,115,22,0.07)" }}
        >
          <Swords size={18} className="text-orange-500" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-white mb-1">Preparing Battle</h3>
        <p className="text-xs text-zinc-600 leading-relaxed">Host is configuring the match. Stand by.</p>
      </div>
      <div
        className="rounded-xl p-4 space-y-3 text-left"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #1e1e1e" }}
      >
        {[
          {
            label: "Mode",
            value: (
              <span className="flex items-center gap-1.5 font-semibold text-zinc-300 capitalize">
                {settings.category === "programming"
                  ? <Code size={11} className="text-orange-500" />
                  : <BookOpen size={11} className="text-blue-500" />}
                {settings.category}
              </span>
            ),
          },
          {
            label: "Challenge",
            value: (
              <span
                className="font-semibold capitalize px-2 py-0.5 rounded-md text-orange-400 text-[11px]"
                style={{ background: "rgba(249,115,22,0.1)" }}
              >
                {settings.challengeMode}
              </span>
            ),
          },
          {
            label: "Game Mode",
            value: <span className="font-semibold text-zinc-300 capitalize text-[11px]">{settings.gameMode}</span>,
          },
        ].map(({ label, value }, i, arr) => (
          <div key={label}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-600">{label}</span>
              {value}
            </div>
            {i < arr.length - 1 && <div className="mt-3 h-px bg-zinc-900" />}
          </div>
        ))}
      </div>

      {/* G-04: Ready system */}
      <div className="space-y-2">
        {readyCount !== undefined && totalPlayers > 0 && (
          <p className="text-[11px] text-zinc-600">{readyCount}/{totalPlayers} ready</p>
        )}
        <button
          onClick={onToggleReady}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            isReady
              ? "bg-green-500/15 border border-green-500/30 text-green-400"
              : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
          }`}
        >
          <CheckCircle2 size={15} className={isReady ? "text-green-400" : "text-zinc-600"} />
          {isReady ? "Ready ✓" : "Mark as Ready"}
        </button>
      </div>
    </div>
  </div>
);

export default GuestWaitingCard;
