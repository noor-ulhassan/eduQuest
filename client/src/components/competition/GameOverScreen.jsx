import React from "react";
import { motion } from "framer-motion";
import { Trophy, Timer, Swords } from "lucide-react";

const TeamColumn = ({ players, label, color, userId, isWinner }) => (
  <div
    className={`bg-zinc-900 rounded-2xl overflow-hidden border ${
      isWinner
        ? color === "blue"
          ? "border-blue-500/40"
          : "border-red-500/40"
        : "border-zinc-800"
    }`}
  >
    <div
      className={`px-3 py-2 border-b border-zinc-800 ${
        isWinner
          ? color === "blue"
            ? "bg-blue-500/10"
            : "bg-red-500/10"
          : ""
      }`}
    >
      <p
        className={`text-xs font-bold uppercase ${
          color === "blue" ? "text-blue-400" : "text-red-400"
        }`}
      >
        {label}
      </p>
    </div>
    {players.map((p, i) => (
      <div
        key={p.id}
        className={`flex items-center gap-2 px-3 py-2 border-b border-zinc-800/50 last:border-0 ${
          p.id === userId
            ? color === "blue"
              ? "bg-blue-500/5"
              : "bg-red-500/5"
            : ""
        }`}
      >
        <span className="text-xs text-zinc-500 w-4 shrink-0">{i + 1}</span>
        <img
          src={p.avatarUrl || "/Avatar.png"}
          alt=""
          className="w-7 h-7 rounded-full object-cover shrink-0"
        />
        <span className="flex-1 text-xs text-zinc-300 truncate">
          {p.name}
          {p.id === userId && (
            <span className="text-zinc-500 ml-1">(You)</span>
          )}
        </span>
        <span className="text-xs font-bold text-orange-400 shrink-0">
          {p.score}
        </span>
      </div>
    ))}
  </div>
);

const GameOverScreen = ({
  finalResults,
  userId,
  onHome,
  onPlayAgain,
  currentGameMode,
  teamScores,
  playerTeam,
}) => {
  // ─── Team Battle result screen ───────────────────────────
  if (currentGameMode === "team" && teamScores && playerTeam) {
    const winningTeam =
      teamScores[0] > teamScores[1]
        ? 0
        : teamScores[1] > teamScores[0]
          ? 1
          : null;
    const myTeam = playerTeam?.[userId];
    const iWon = winningTeam !== null && winningTeam === myTeam;
    const isDraw = winningTeam === null;
    const blueTeam = finalResults
      .filter((p) => playerTeam[p.id] === 0)
      .sort((a, b) => b.score - a.score);
    const redTeam = finalResults
      .filter((p) => playerTeam[p.id] === 1)
      .sort((a, b) => b.score - a.score);

    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <Swords size={48} className="mx-auto mb-4 text-orange-400" />
            <h1 className="text-3xl font-bold">Team Battle Over!</h1>
            <p
              className={`text-2xl font-black mt-2 ${
                isDraw
                  ? "text-zinc-300"
                  : winningTeam === 0
                    ? "text-blue-400"
                    : "text-red-400"
              }`}
            >
              {isDraw
                ? "🤝 Draw!"
                : winningTeam === 0
                  ? "🔵 Blue Team Wins!"
                  : "🔴 Red Team Wins!"}
            </p>
            {!isDraw && (
              <p
                className={`text-sm mt-1 font-semibold ${
                  iWon ? "text-green-400" : "text-zinc-500"
                }`}
              >
                {iWon ? "Your team won! 🎉" : "Better luck next time!"}
              </p>
            )}
          </div>

          {/* Team score totals */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`rounded-2xl border p-4 text-center ${
                winningTeam === 0
                  ? "bg-blue-500/10 border-blue-500/40"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <p className="text-xs uppercase font-bold text-blue-400 mb-1">
                🔵 Blue Team
              </p>
              <p
                className={`text-3xl font-black ${
                  winningTeam === 0 ? "text-blue-300" : "text-zinc-400"
                }`}
              >
                {teamScores[0]}
                <span className="text-sm font-normal ml-1 text-zinc-500">
                  XP
                </span>
              </p>
              {winningTeam === 0 && (
                <p className="text-[10px] text-green-400 font-bold mt-1">
                  WINNER ✓
                </p>
              )}
            </div>
            <div
              className={`rounded-2xl border p-4 text-center ${
                winningTeam === 1
                  ? "bg-red-500/10 border-red-500/40"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <p className="text-xs uppercase font-bold text-red-400 mb-1">
                🔴 Red Team
              </p>
              <p
                className={`text-3xl font-black ${
                  winningTeam === 1 ? "text-red-300" : "text-zinc-400"
                }`}
              >
                {teamScores[1]}
                <span className="text-sm font-normal ml-1 text-zinc-500">
                  XP
                </span>
              </p>
              {winningTeam === 1 && (
                <p className="text-[10px] text-green-400 font-bold mt-1">
                  WINNER ✓
                </p>
              )}
            </div>
          </div>

          {/* Players grouped by team */}
          <div className="grid grid-cols-2 gap-3">
            <TeamColumn
              players={blueTeam}
              label="🔵 Blue"
              color="blue"
              userId={userId}
              isWinner={winningTeam === 0}
            />
            <TeamColumn
              players={redTeam}
              label="🔴 Red"
              color="red"
              userId={userId}
              isWinner={winningTeam === 1}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onHome}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition"
            >
              Home
            </button>
            <button
              onClick={onPlayAgain}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-semibold transition"
            >
              Play Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Individual mode result screen ───────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full space-y-6"
      >
        <div className="text-center">
          <Trophy size={48} className="text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Game Over!</h1>
          <p className="text-zinc-400 mt-1">Final Standings</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {finalResults.map((player, i) => (
            <div
              key={player.id}
              className={`flex items-center gap-4 p-4 border-b border-zinc-800 last:border-0 ${i === 0 ? "bg-yellow-500/5" : ""} ${player.id === userId ? "ring-1 ring-orange-500/30" : ""}`}
            >
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-zinc-400 text-black" : i === 2 ? "bg-orange-700 text-white" : "bg-zinc-800 text-zinc-400"}`}
              >
                {i + 1}
              </span>
              <img
                src={player.avatarUrl || "/Avatar.png"}
                alt={player.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {player.name}
                  {player.id === userId && (
                    <span className="text-xs text-orange-400 ml-2">(You)</span>
                  )}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                  <span>
                    {player.correctAnswers || 0}/{player.currentQuestion}{" "}
                    correct
                  </span>
                  {player.timeTaken != null && (
                    <>
                      <span className="w-0.5 h-0.5 rounded-full bg-zinc-700" />
                      <span className="flex items-center gap-1">
                        <Timer size={10} />
                        {Math.floor(player.timeTaken / 60)}:
                        {String(player.timeTaken % 60).padStart(2, "0")}
                      </span>
                    </>
                  )}
                  {!player.finished && (
                    <span className="text-red-400">DNF</span>
                  )}
                </div>
              </div>
              <span className="font-bold text-lg text-orange-400">
                {player.score}{" "}
                <span className="text-xs text-zinc-500 font-normal">XP</span>
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onHome}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition"
          >
            Home
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-semibold transition"
          >
            Play Again
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GameOverScreen;
