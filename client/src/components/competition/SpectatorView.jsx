import React from "react";
import { ArrowLeft, Eye, Timer, Trophy } from "lucide-react";

const SpectatorView = ({
  spectatorData,
  gameState,
  finalResults,
  leaderboard,
  timeRemaining,
  gameCategory,
  navigate,
}) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition text-sm"
          >
            <ArrowLeft size={16} /> Leave
          </button>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2">
            <Eye size={14} className="text-purple-400" />
            <span className="text-sm text-purple-400 font-semibold">
              Spectating
            </span>
          </div>
        </div>

        {/* Room Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-bold mb-1">
            {spectatorData?.topic ||
              (gameCategory === "programming"
                ? "Coding Challenge"
                : "General Quiz")}
          </h2>
          <p className="text-sm text-zinc-400">
            Hosted by {spectatorData?.hostName || "Unknown"} •{" "}
            {spectatorData?.difficulty || "medium"} difficulty
          </p>
        </div>

        {/* Timer */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-center gap-2">
          <Timer size={16} className="text-orange-400" />
          <span
            className={`font-mono font-bold text-xl ${timeRemaining < 30 ? "text-red-400" : "text-white"}`}
          >
            {Math.floor(timeRemaining / 60)}:
            {String(timeRemaining % 60).padStart(2, "0")}
          </span>
          <span className="text-zinc-500 text-sm ml-2">remaining</span>
        </div>

        {/* Live Leaderboard */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy size={14} className="text-yellow-400" /> Live Standings
          </h3>
          <div className="space-y-2">
            {leaderboard.length === 0 && (
              <p className="text-zinc-500 text-sm text-center py-4">
                Waiting for game to start...
              </p>
            )}
            {leaderboard.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  i === 0
                    ? "bg-yellow-500/10 border border-yellow-500/20"
                    : "bg-zinc-800/50"
                }`}
              >
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-xs ${
                    i === 0
                      ? "bg-yellow-500 text-black"
                      : i === 1
                        ? "bg-zinc-400 text-black"
                        : i === 2
                          ? "bg-orange-700 text-white"
                          : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {i + 1}
                </span>
                <img
                  src={p.avatarUrl || "/Avatar.png"}
                  className="w-8 h-8 rounded-full"
                  alt=""
                />
                <span className="flex-1 text-sm font-medium truncate">
                  {p.name}
                </span>
                <span className="font-bold text-orange-400">{p.score}</span>
              </div>
            ))}
          </div>
        </div>

        {gameState === "finished" && finalResults && (
          <div className="text-center">
            <Trophy size={36} className="text-yellow-400 mx-auto mb-2" />
            <h2 className="text-2xl font-bold">Game Over!</h2>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpectatorView;
