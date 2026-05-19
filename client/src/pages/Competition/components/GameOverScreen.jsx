import React from "react";
import { motion } from "framer-motion";
import { Trophy, Timer, Swords, RotateCcw, Home, Play } from "lucide-react";

const TeamColumn = ({
  players,
  label,
  color,
  userId,
  isWinner,
  totalQuestions,
}) => (
  <div
    className={`bg-[#0c0c0c]/90 backdrop-blur-xl rounded-2xl overflow-hidden border transition-all ${
      isWinner
        ? color === "blue"
          ? "border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
          : "border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
        : "border-zinc-800/80"
    }`}
  >
    <div
      className={`px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between ${
        isWinner
          ? color === "blue"
            ? "bg-blue-500/15"
            : "bg-red-500/15"
          : "bg-zinc-900/60"
      }`}
    >
      <p
        className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
          color === "blue" ? "text-blue-400" : "text-red-400"
        }`}
      >
        {label}
      </p>
      {isWinner && (
        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-white/10 text-white tracking-widest border border-white/10">
          Winner
        </span>
      )}
    </div>
    <div className="divide-y divide-zinc-800/50">
      {players.map((p, i) => (
        <div
          key={p.id}
          className={`flex items-center gap-2 sm:gap-3 px-3 py-3 transition-colors relative ${
            p.id === userId
              ? color === "blue"
                ? "bg-blue-500/10"
                : "bg-red-500/10"
              : "hover:bg-zinc-900/40"
          }`}
        >
          {p.id === userId && (
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${
                color === "blue"
                  ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]"
                  : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]"
              }`}
            />
          )}
          <span className="text-xs font-bold text-zinc-500 w-4 text-center shrink-0">
            {i + 1}
          </span>
          <div className="relative shrink-0">
            <img
              src={p.avatarUrl || "/Avatar.png"}
              alt=""
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border ${
                p.id === userId
                  ? color === "blue"
                    ? "border-blue-500"
                    : "border-red-500"
                  : "border-zinc-700"
              }`}
            />
            {p.eliminated && (
              <div className="absolute inset-0 bg-red-950/80 backdrop-blur-[1px] rounded-xl flex items-center justify-center text-[10px]">
                💀
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold text-zinc-200 truncate flex items-center gap-1.5">
              {p.name}
              {p.id === userId && (
                <span className="text-[8px] bg-white/10 border border-white/10 text-white px-1 py-0.2 rounded uppercase font-black tracking-wider shrink-0">
                  You
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5 font-medium">
              <span>
                <strong className="text-zinc-400 font-bold">
                  {p.correctAnswers || 0}
                </strong>
                /{totalQuestions || p.currentQuestion || 0} correct
              </span>
              {p.eliminated ? (
                <span className="text-red-400 font-bold shrink-0">
                  💀 Eliminated
                </span>
              ) : !p.finished ? (
                <span className="text-red-400 font-bold shrink-0">DNF</span>
              ) : p.perfectScore ? (
                <span className="text-amber-400 font-bold shrink-0">
                  ✨ Perfect
                </span>
              ) : null}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs sm:text-sm font-black text-orange-400 block">
              +{p.score}
            </span>
            <span className="text-[8px] text-zinc-500 font-bold uppercase block -mt-0.5">
              XP
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const GameOverScreen = ({
  finalResults,
  isDraw,
  userId,
  onHome,
  onPlayAgain,
  currentGameMode,
  teamScores,
  playerTeam,
  totalQuestions,
  rematchVotes,
  onRequestRematch,
}) => {
  // ─── Team Battle result screen (PUBG Premium Aesthetics) ───────────────────────────
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
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-orange-500/30 font-sans">
        {/* Dynamic PUBG Atmospheric Ambient Backgrounds */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-600/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[400px] bg-red-800/5 rounded-full blur-[150px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-xl sm:max-w-2xl w-full space-y-6 sm:space-y-8 relative z-10 my-auto py-8"
        >
          {/* Top Banner Asset (Victory / Defeat) */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 15 }}
            className="relative flex justify-center pt-2 pb-4"
          >
            {/* Ambient Backlight Glow behind illustration */}
            <div
              className={`absolute inset-0 w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-full blur-3xl opacity-30 pointer-events-none ${
                iWon ? "bg-orange-500" : isDraw ? "bg-zinc-500" : "bg-red-600"
              }`}
            />
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative z-10"
            >
              <img
                src={iWon ? "/victory.png" : "/defeat.png"}
                alt={iWon ? "Victory" : "Defeat"}
                className={`w-64 sm:w-80 h-auto object-contain filter ${
                  iWon
                    ? "drop-shadow-[0_12px_30px_rgba(234,88,12,0.5)]"
                    : "drop-shadow-[0_12px_30px_rgba(220,38,38,0.5)]"
                }`}
              />
            </motion.div>
          </motion.div>

          {/* Heading Vibe */}
          <div className="text-center space-y-1 relative z-10">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-tight">
              {isDraw ? (
                <span className="bg-gradient-to-r from-zinc-300 via-zinc-400 to-zinc-500 bg-clip-text text-transparent">
                  🤝 Match Draw!
                </span>
              ) : winningTeam === 0 ? (
                <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(59,130,246,0.3)]">
                  🔵 Blue Squad Victory!
                </span>
              ) : (
                <span className="bg-gradient-to-r from-red-400 via-red-500 to-rose-400 bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(239,68,68,0.3)]">
                  🔴 Red Squad Victory!
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 uppercase tracking-widest font-bold">
              TEAM BATTLE ARENA • SQUAD STANDINGS
            </p>
            {!isDraw && (
              <p
                className={`text-xs font-bold mt-1.5 ${
                  iWon ? "text-orange-400" : "text-zinc-500"
                }`}
              >
                {iWon
                  ? "Your squad dominated the battlefield! 🎉"
                  : "Your squad was defeated. Better luck next time!"}
              </p>
            )}
          </div>

          {/* Team Score Totals Header */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Blue Team Score Card */}
            <div
              className={`rounded-2xl border p-4 text-center relative overflow-hidden transition-all ${
                winningTeam === 0
                  ? "bg-blue-500/10 border-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.1)]"
                  : "bg-[#0c0c0c]/80 border-zinc-800/80 backdrop-blur-md"
              }`}
            >
              {winningTeam === 0 && (
                <div className="absolute top-0 inset-x-0 h-1 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]" />
              )}
              <p className="text-xs uppercase font-black tracking-wider text-blue-400 mb-1">
                🔵 Blue Squad
              </p>
              <p
                className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  winningTeam === 0 ? "text-blue-300" : "text-zinc-400"
                }`}
              >
                {teamScores[0]}
                <span className="text-xs font-bold ml-1 text-zinc-500 uppercase tracking-normal">
                  XP
                </span>
              </p>
              {winningTeam === 0 && (
                <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Winner ✓
                </span>
              )}
            </div>

            {/* Red Team Score Card */}
            <div
              className={`rounded-2xl border p-4 text-center relative overflow-hidden transition-all ${
                winningTeam === 1
                  ? "bg-red-500/10 border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.1)]"
                  : "bg-[#0c0c0c]/80 border-zinc-800/80 backdrop-blur-md"
              }`}
            >
              {winningTeam === 1 && (
                <div className="absolute top-0 inset-x-0 h-1 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]" />
              )}
              <p className="text-xs uppercase font-black tracking-wider text-red-400 mb-1">
                🔴 Red Squad
              </p>
              <p
                className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  winningTeam === 1 ? "text-red-300" : "text-zinc-400"
                }`}
              >
                {teamScores[1]}
                <span className="text-xs font-bold ml-1 text-zinc-500 uppercase tracking-normal">
                  XP
                </span>
              </p>
              {winningTeam === 1 && (
                <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  Winner ✓
                </span>
              )}
            </div>
          </div>

          {/* Players Grouped by Squad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TeamColumn
              players={blueTeam}
              label="Blue Squad"
              color="blue"
              userId={userId}
              isWinner={winningTeam === 0}
              totalQuestions={totalQuestions}
            />
            <TeamColumn
              players={redTeam}
              label="Red Squad"
              color="red"
              userId={userId}
              isWinner={winningTeam === 1}
              totalQuestions={totalQuestions}
            />
          </div>

          {/* Rematch & Actions */}
          {onRequestRematch && (
            <div className="bg-[#0c0c0c]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="text-center sm:text-left">
                <p className="text-sm font-black text-zinc-200 flex items-center justify-center sm:justify-start gap-2">
                  <RotateCcw size={16} className="text-orange-500" />
                  <span>Arena Rematch</span>
                </p>
                {rematchVotes?.voteCount > 0 ? (
                  <p className="text-xs text-zinc-500 mt-1 font-medium">
                    <strong className="text-orange-400 font-bold">
                      {rematchVotes.voteCount}
                    </strong>
                    /{rematchVotes.totalPlayers} squad members voted
                    {rematchVotes.voterNames?.length > 0 &&
                      ` (${rematchVotes.voterNames.join(", ")})`}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500 mt-1 font-medium">
                    Challenge your rivals to another tactical round
                  </p>
                )}
              </div>
              <button
                onClick={onRequestRematch}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white transition flex items-center justify-center gap-2 shrink-0 shadow-lg"
              >
                🔄 Request Rematch
              </button>
            </div>
          )}

          {/* Core Controls */}
          <div className="flex gap-3 sm:gap-4 pt-1">
            <button
              onClick={onHome}
              className="flex-1 py-3.5 bg-[#0c0c0c]/80 hover:bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-xs sm:text-sm text-zinc-300 hover:text-white transition flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm"
            >
              <Home size={16} className="text-zinc-500" /> Return to Base
            </button>
            <button
              onClick={onPlayAgain}
              className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 rounded-xl font-bold text-xs sm:text-sm text-white transition flex items-center justify-center gap-2 shadow-xl shadow-orange-500/15"
            >
              <Play size={16} fill="currentColor" /> Play Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Individual mode result screen (PUBG Premium Aesthetics) ───────────────────────
  const myRankIndex = finalResults.findIndex((p) => p.id === userId);
  const iWon = myRankIndex === 0 && !isDraw; // Rank 1 takes Victory, unless it's a draw

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-orange-500/30 font-sans">
      {/* Dynamic PUBG Atmospheric Ambient Backgrounds */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[400px] bg-red-800/5 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-xl sm:max-w-2xl w-full space-y-6 sm:space-y-8 relative z-10 my-auto py-8"
      >
        {/* Top Banner Asset (Victory / Defeat) */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 15 }}
          className="relative flex justify-center pt-2 pb-4"
        >
          {/* Ambient Backlight Glow behind illustration */}
          <div
            className={`absolute inset-0 w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-full blur-3xl opacity-30 pointer-events-none ${
              isDraw ? "bg-zinc-400" : iWon ? "bg-orange-500" : "bg-red-600"
            }`}
          />
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="relative z-10"
          >
            {isDraw ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <span className="text-8xl leading-none select-none">🤝</span>
              </div>
            ) : (
              <img
                src={iWon ? "/victory.png" : "/defeat.png"}
                alt={iWon ? "Victory" : "Defeat"}
                className={`w-64 sm:w-80 h-auto object-contain filter ${
                  iWon
                    ? "drop-shadow-[0_12px_30px_rgba(234,88,12,0.5)]"
                    : "drop-shadow-[0_12px_30px_rgba(220,38,38,0.5)]"
                }`}
              />
            )}
          </motion.div>
        </motion.div>

        {/* Heading Vibe */}
        <div className="text-center space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-tight">
            {isDraw ? (
              <span className="bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-200 bg-clip-text text-transparent">
                It&apos;s a Draw!
              </span>
            ) : iWon ? (
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent ml-20 filter drop-shadow-[0_2px_10px_rgba(251,146,60,0.3)]">
                Winner Winner Chicken Dinner!
              </span>
            ) : (
              <span className="bg-gradient-to-r from-zinc-300 via-zinc-400 to-zinc-500 bg-clip-text text-transparent">
                Better Luck Next Time
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 uppercase tracking-widest font-bold ml-8">
            {currentGameMode
              ? `${currentGameMode.toUpperCase()} ARENA`
              : "MATCH"}{" "}
            • FINAL STANDINGS
          </p>
        </div>

        {/* Standings Scorecard (Tactical Glassmorphism Table) */}
        <div className="bg-[#0c0c0c]/90 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="w-8 sm:w-10 text-center shrink-0">Rank</span>
              <span>Combatant</span>
            </div>
            <span>Reward</span>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-zinc-800/50">
            {finalResults.map((player, i) => {
              const isMe = player.id === userId;
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between px-4 py-3 sm:py-3.5 transition-all relative ${
                    isMe
                      ? "bg-gradient-to-r from-orange-500/15 via-orange-500/5 to-transparent"
                      : "hover:bg-zinc-900/40"
                  }`}
                >
                  {/* Active Accent Bar for Current User */}
                  {isMe && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]" />
                  )}

                  {/* Left side: Rank + Avatar + Info */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 pr-2">
                    {/* Rank Badge */}
                    <div className="w-8 sm:w-10 flex justify-center shrink-0">
                      {i === 0 ? (
                        <span className="w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 text-black font-black text-xs sm:text-sm shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                          1
                        </span>
                      ) : i === 1 ? (
                        <span className="w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-500 text-black font-black text-xs sm:text-sm">
                          2
                        </span>
                      ) : i === 2 ? (
                        <span className="w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-700 via-orange-800 to-amber-950 text-amber-200 border border-amber-600/30 font-black text-xs sm:text-sm">
                          3
                        </span>
                      ) : (
                        <span className="w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800/80 text-zinc-500 font-bold text-xs sm:text-sm">
                          {i + 1}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={player.avatarUrl || "/Avatar.png"}
                        alt=""
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border ${
                          i === 0
                            ? "border-amber-500"
                            : isMe
                              ? "border-orange-500"
                              : "border-zinc-700"
                        }`}
                      />
                      {player.eliminated && (
                        <div className="absolute inset-0 bg-red-950/80 backdrop-blur-[1px] rounded-xl flex items-center justify-center text-xs">
                          💀
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-zinc-200 truncate flex items-center gap-1.5">
                        {player.name}
                        {isMe && (
                          <span className="px-1.5 py-0.2 rounded bg-orange-500/20 border border-orange-500/30 text-orange-400 font-black text-[8px] uppercase tracking-wider shrink-0">
                            You
                          </span>
                        )}
                      </p>

                      {/* PUBG Combat Sub-stats */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] text-zinc-500 mt-0.5 font-medium">
                        <span>
                          <strong className="text-zinc-400 font-bold">
                            {player.correctAnswers || 0}
                          </strong>
                          /{totalQuestions || player.currentQuestion || 0}{" "}
                          correct
                        </span>

                        {player.timeTaken != null && (
                          <>
                            <span className="w-0.5 h-0.5 rounded-full bg-zinc-700 shrink-0" />
                            <span className="flex items-center gap-1 shrink-0 font-mono">
                              <Timer size={10} className="text-zinc-600" />
                              {Math.floor(player.timeTaken / 60)}:
                              {String(player.timeTaken % 60).padStart(2, "0")}
                            </span>
                          </>
                        )}

                        {player.eliminated ? (
                          <>
                            <span className="w-0.5 h-0.5 rounded-full bg-zinc-700 shrink-0" />
                            <span className="text-red-400 font-bold tracking-tight shrink-0">
                              💀 Eliminated
                            </span>
                          </>
                        ) : !player.finished ? (
                          <>
                            <span className="w-0.5 h-0.5 rounded-full bg-zinc-700 shrink-0" />
                            <span className="text-red-400 font-bold tracking-tight shrink-0">
                              DNF
                            </span>
                          </>
                        ) : player.perfectScore ? (
                          <>
                            <span className="w-0.5 h-0.5 rounded-full bg-zinc-700 shrink-0" />
                            <span className="text-amber-400 font-bold tracking-tight shrink-0">
                              ✨ Perfect
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Reward XP */}
                  <div className="text-right shrink-0 pl-2">
                    <span className="font-black text-sm sm:text-base text-orange-400 block">
                      {player.score}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block -mt-0.5">
                      XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rematch & Actions */}
        {onRequestRematch && (
          <div className="bg-[#0c0c0c]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="text-center sm:text-left">
              <p className="text-sm font-black text-zinc-200 flex items-center justify-center sm:justify-start gap-2">
                <RotateCcw size={16} className="text-orange-500" />
                <span>Arena Rematch</span>
              </p>
              {rematchVotes?.voteCount > 0 ? (
                <p className="text-xs text-zinc-500 mt-1 font-medium">
                  <strong className="text-orange-400 font-bold">
                    {rematchVotes.voteCount}
                  </strong>
                  /{rematchVotes.totalPlayers} combatants voted
                  {rematchVotes.voterNames?.length > 0 &&
                    ` (${rematchVotes.voterNames.join(", ")})`}
                </p>
              ) : (
                <p className="text-xs text-zinc-500 mt-1 font-medium">
                  Challenge your rivals to another high-stakes round
                </p>
              )}
            </div>
            <button
              onClick={onRequestRematch}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white transition flex items-center justify-center gap-2 shrink-0 shadow-lg"
            >
              🔄 Request Rematch
            </button>
          </div>
        )}

        {/* Core Controls */}
        <div className="flex gap-3 sm:gap-4 pt-1">
          <button
            onClick={onHome}
            className="flex-1 py-3.5 bg-[#0c0c0c]/80 hover:bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-xs sm:text-sm text-zinc-300 hover:text-white transition flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm"
          >
            <Home size={16} className="text-zinc-500" /> Return to Base
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 rounded-xl font-bold text-xs sm:text-sm text-white transition flex items-center justify-center gap-2 shadow-xl shadow-orange-500/15"
          >
            <Play size={16} fill="currentColor" /> Play Again
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GameOverScreen;
