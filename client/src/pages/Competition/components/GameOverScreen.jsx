import React from "react";
import { motion } from "framer-motion";
import { Timer, RotateCcw, Home, Play } from "lucide-react";
import Lottie from "lottie-react";

// ─── Rank badge ───────────────────────────────────────────────────────────────
const RankBadge = ({ rank }) => {
  const base = "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0";
  if (rank === 0)
    return (
      <div
        className={base}
        style={{
          background: "linear-gradient(135deg, #fde68a, #f59e0b, #ea580c)",
          color: "#1a0500",
          boxShadow: "0 0 14px rgba(245,158,11,0.5)",
        }}
      >
        1
      </div>
    );
  if (rank === 1)
    return (
      <div
        className={base}
        style={{ background: "linear-gradient(135deg, #9ca3af, #e5e7eb, #9ca3af)", color: "#111" }}
      >
        2
      </div>
    );
  if (rank === 2)
    return (
      <div
        className={base}
        style={{ background: "linear-gradient(135deg, #92400e, #d97706, #92400e)", color: "#fde68a" }}
      >
        3
      </div>
    );
  return (
    <div className={`${base} bg-zinc-900 border border-zinc-800 text-zinc-500`}>{rank + 1}</div>
  );
};

// ─── Individual player row ────────────────────────────────────────────────────
const PlayerRow = ({ player, rank, userId, totalQuestions, maxScore, delay }) => {
  const isMe = player.id === userId;
  const isFirst = rank === 0;
  const pct = maxScore > 0 ? (player.score / maxScore) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.28, ease: "easeOut" }}
      className="relative flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50 last:border-0 overflow-hidden"
    >
      {/* Score proportion bar */}
      <div
        className="absolute left-0 top-0 bottom-0 pointer-events-none"
        style={{
          width: `${pct}%`,
          background: isFirst
            ? "linear-gradient(90deg, rgba(249,115,22,0.11), transparent)"
            : "linear-gradient(90deg, rgba(255,255,255,0.03), transparent)",
        }}
      />

      {/* Left accent */}
      {isFirst && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange-500"
          style={{ boxShadow: "0 0 10px rgba(249,115,22,0.9)" }}
        />
      )}
      {!isFirst && isMe && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-orange-500/35" />
      )}

      <RankBadge rank={rank} />

      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={player.avatarUrl || "/Avatar.png"}
          alt=""
          className={`w-9 h-9 rounded-lg object-cover border ${
            isFirst
              ? "border-orange-500/60"
              : isMe
                ? "border-orange-500/30"
                : "border-zinc-800"
          }`}
        />
        {player.eliminated && (
          <div className="absolute inset-0 rounded-lg bg-zinc-950/80 flex items-center justify-center text-[10px]">
            💀
          </div>
        )}
      </div>

      {/* Name + sub-stats */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-sm font-bold truncate ${
              isFirst ? "text-metallic-orange" : "text-metallic"
            }`}
          >
            {player.name}
          </span>
          {isMe && (
            <span className="shrink-0 text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/15 border border-orange-500/25 text-orange-400 leading-none">
              YOU
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-600 font-medium">
          <span>
            <strong className="text-zinc-400 font-bold">
              {player.correctAnswers || 0}
            </strong>
            /{totalQuestions || player.currentQuestion || 0} correct
          </span>
          {player.timeTaken != null && (
            <>
              <span className="text-zinc-800">·</span>
              <span className="font-mono flex items-center gap-0.5">
                <Timer size={8} className="text-zinc-700" />
                {Math.floor(player.timeTaken / 60)}:
                {String(player.timeTaken % 60).padStart(2, "0")}
              </span>
            </>
          )}
          {player.eliminated && (
            <>
              <span className="text-zinc-800">·</span>
              <span className="text-red-500 font-bold">Eliminated</span>
            </>
          )}
          {!player.eliminated && !player.finished && (
            <>
              <span className="text-zinc-800">·</span>
              <span className="text-red-500 font-bold">DNF</span>
            </>
          )}
          {player.perfectScore && (
            <>
              <span className="text-zinc-800">·</span>
              <span className="text-amber-400 font-bold">Perfect</span>
            </>
          )}
        </div>
      </div>

      {/* XP */}
      <div className="text-right shrink-0 pl-1">
        <span className="text-sm font-black text-metallic-orange block">
          {player.score}
        </span>
        <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-wider block">
          XP
        </span>
      </div>
    </motion.div>
  );
};

// ─── Team player row ──────────────────────────────────────────────────────────
const TeamPlayerRow = ({ player, rank, userId, totalQuestions, color, delay }) => {
  const isMe = player.id === userId;
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.24, ease: "easeOut" }}
      className={`relative flex items-center gap-2.5 px-3 py-2.5 border-b border-zinc-800/40 last:border-0 overflow-hidden ${
        isMe
          ? color === "blue"
            ? "bg-blue-500/8"
            : "bg-red-500/8"
          : ""
      }`}
    >
      {isMe && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-[2.5px] ${
            color === "blue" ? "bg-blue-500" : "bg-red-500"
          }`}
        />
      )}
      <span className="text-xs font-bold text-zinc-600 w-4 text-center shrink-0">
        {rank + 1}
      </span>
      <div className="relative shrink-0">
        <img
          src={player.avatarUrl || "/Avatar.png"}
          alt=""
          className={`w-8 h-8 rounded-lg object-cover border ${
            isMe
              ? color === "blue"
                ? "border-blue-500/50"
                : "border-red-500/50"
              : "border-zinc-800"
          }`}
        />
        {player.eliminated && (
          <div className="absolute inset-0 rounded-lg bg-zinc-950/80 flex items-center justify-center text-[9px]">
            💀
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span
            className={`text-xs font-bold truncate ${
              isMe ? "text-metallic-orange" : "text-metallic"
            }`}
          >
            {player.name}
          </span>
          {isMe && (
            <span className="shrink-0 text-[7px] font-black uppercase px-1 py-0.5 rounded bg-white/8 border border-white/10 text-white/50">
              YOU
            </span>
          )}
        </div>
        <div className="text-[9px] text-zinc-600 mt-0.5">
          <strong className="text-zinc-500">{player.correctAnswers || 0}</strong>/
          {totalQuestions || 0}
          {player.eliminated && (
            <span className="text-red-500 ml-1">· Eliminated</span>
          )}
          {player.perfectScore && (
            <span className="text-amber-400 ml-1">· Perfect</span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className="text-xs font-black text-metallic-orange">{player.score}</span>
        <span className="text-[7px] text-zinc-700 ml-0.5 uppercase font-bold">xp</span>
      </div>
    </motion.div>
  );
};

// ─── Shared action bar ────────────────────────────────────────────────────────
const ActionBar = ({ onHome, onPlayAgain, onRequestRematch, rematchVotes, rowCount }) => {
  const baseDelay = 0.35 + rowCount * 0.06;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: baseDelay, duration: 0.3 }}
      className="space-y-3"
    >
      {onRequestRematch && (
        <div className="border border-zinc-800/60 bg-zinc-900/40 rounded-xl p-3.5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <RotateCcw size={12} className="text-orange-500" /> Rematch
            </p>
            {rematchVotes?.voteCount > 0 ? (
              <p className="text-[10px] text-zinc-500 mt-0.5">
                <strong className="text-orange-400">{rematchVotes.voteCount}</strong>/
                {rematchVotes.totalPlayers} voted
                {rematchVotes.voterNames?.length > 0 &&
                  ` — ${rematchVotes.voterNames.join(", ")}`}
              </p>
            ) : (
              <p className="text-[10px] text-zinc-600 mt-0.5">
                Challenge your rivals to another round
              </p>
            )}
          </div>
          <button
            onClick={onRequestRematch}
            className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 text-zinc-300 hover:text-white transition-colors"
          >
            Request
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onHome}
          className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <Home size={15} /> Home
        </button>
        {onPlayAgain && (
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20"
          >
            <Play size={15} fill="currentColor" /> Play Again
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
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

  // ── Team mode ──────────────────────────────────────────────────────────────
  if (currentGameMode === "team" && teamScores && playerTeam) {
    const winningTeam =
      teamScores[0] > teamScores[1] ? 0 : teamScores[1] > teamScores[0] ? 1 : null;
    const myTeam = playerTeam?.[userId];
    const iWon = winningTeam !== null && winningTeam === myTeam;
    const isTeamDraw = winningTeam === null;

    const blueTeam = finalResults
      .filter((p) => playerTeam[p.id] === 0)
      .sort((a, b) => b.score - a.score);
    const redTeam = finalResults
      .filter((p) => playerTeam[p.id] === 1)
      .sort((a, b) => b.score - a.score);

    const lottieSrc = isTeamDraw
      ? "/lottie/sad.json"
      : iWon
        ? "/lottie/victory.json"
        : "/lottie/defeat.json";

    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl w-full relative z-10 py-8 space-y-6"
        >
          {/* Outcome header */}
          <div className="flex flex-col items-center gap-2">
            <motion.div
              initial={{ scale: 0.75, opacity: 0, y: -8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
            >
              <Lottie
                path={lottieSrc}
                loop={false}
                autoplay
                style={{ width: 140, height: 140 }}
                className="pointer-events-none"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.3 }}
              className={`text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none text-center ${
                isTeamDraw
                  ? "text-metallic"
                  : winningTeam === 0
                    ? "text-blue-300"
                    : "text-red-300"
              }`}
            >
              {isTeamDraw
                ? "Draw"
                : winningTeam === 0
                  ? "Blue Wins"
                  : "Red Wins"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.26 }}
              className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-bold"
            >
              Team Battle · Final Standings
            </motion.p>
          </div>

          {/* Team score totals */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.3 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { label: "Blue", score: teamScores[0], idx: 0, accent: "blue" },
              { label: "Red", score: teamScores[1], idx: 1, accent: "red" },
            ].map(({ label, score, idx, accent }) => {
              const isWin = winningTeam === idx;
              return (
                <div
                  key={accent}
                  className={`relative overflow-hidden rounded-xl border p-4 text-center ${
                    isWin
                      ? accent === "blue"
                        ? "bg-blue-500/10 border-blue-500/40"
                        : "bg-red-500/10 border-red-500/40"
                      : "bg-zinc-900/60 border-zinc-800/70"
                  }`}
                >
                  {isWin && (
                    <div
                      className={`absolute top-0 inset-x-0 h-[2px] ${
                        accent === "blue" ? "bg-blue-500" : "bg-red-500"
                      }`}
                      style={{
                        boxShadow:
                          accent === "blue"
                            ? "0 0 8px rgba(59,130,246,0.8)"
                            : "0 0 8px rgba(239,68,68,0.8)",
                      }}
                    />
                  )}
                  <p
                    className={`text-[10px] font-black uppercase tracking-wider mb-1 ${
                      accent === "blue" ? "text-blue-400" : "text-red-400"
                    }`}
                  >
                    {label}
                  </p>
                  <p
                    className={`text-3xl font-black ${
                      isWin ? "text-metallic-orange" : "text-zinc-500"
                    }`}
                  >
                    {score}
                    <span className="text-xs font-bold ml-1 text-zinc-600 normal-case tracking-normal">
                      XP
                    </span>
                  </p>
                  {isWin && (
                    <span
                      className={`inline-block mt-1.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                        accent === "blue"
                          ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                          : "bg-red-500/15 border-red-500/30 text-red-400"
                      }`}
                    >
                      Winner
                    </span>
                  )}
                </div>
              );
            })}
          </motion.div>

          {/* Team columns */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {[
              { team: blueTeam, label: "Blue", color: "blue", isWin: winningTeam === 0 },
              { team: redTeam, label: "Red", color: "red", isWin: winningTeam === 1 },
            ].map(({ team, label, color, isWin }) => (
              <div
                key={color}
                className={`bg-zinc-900/60 rounded-xl overflow-hidden border ${
                  isWin
                    ? color === "blue"
                      ? "border-blue-500/35"
                      : "border-red-500/35"
                    : "border-zinc-800/70"
                }`}
              >
                <div
                  className={`px-3 py-2 border-b border-zinc-800/60 flex items-center justify-between ${
                    isWin
                      ? color === "blue"
                        ? "bg-blue-500/10"
                        : "bg-red-500/10"
                      : "bg-zinc-900/50"
                  }`}
                >
                  <p
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      color === "blue" ? "text-blue-400" : "text-red-400"
                    }`}
                  >
                    {label}
                  </p>
                  {isWin && (
                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/8 border border-white/10 text-white/60">
                      Winner
                    </span>
                  )}
                </div>
                <div>
                  {team.map((p, i) => (
                    <TeamPlayerRow
                      key={p.id}
                      player={p}
                      rank={i}
                      userId={userId}
                      totalQuestions={totalQuestions}
                      color={color}
                      delay={0.32 + i * 0.05}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>

          <ActionBar
            onHome={onHome}
            onPlayAgain={onPlayAgain}
            onRequestRematch={onRequestRematch}
            rematchVotes={rematchVotes}
            rowCount={Math.max(blueTeam.length, redTeam.length)}
          />
        </motion.div>
      </div>
    );
  }

  // ── Individual mode ────────────────────────────────────────────────────────
  const myRankIndex = finalResults.findIndex((p) => p.id === userId);
  const iWon = myRankIndex === 0 && !isDraw;
  const maxScore = finalResults[0]?.score || 1;

  const lottieSrc = isDraw
    ? "/lottie/sad.json"
    : iWon
      ? "/lottie/victory.json"
      : "/lottie/defeat.json";

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle atmospheric wash — winner only */}
      {iWon && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-orange-700/5 rounded-full blur-[200px] pointer-events-none" />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl w-full relative z-10 py-8 space-y-6"
      >
        {/* Outcome header */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ scale: 0.75, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.08 }}
          >
            <Lottie
              path={lottieSrc}
              loop={false}
              autoplay
              style={{ width: 160, height: 160 }}
              className="pointer-events-none"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className={`text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none text-center ${
              iWon ? "text-metallic-orange" : "text-metallic"
            }`}
          >
            {isDraw ? "Draw" : iWon ? "Victory" : "Defeat"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-bold"
          >
            {currentGameMode?.toUpperCase() || "MATCH"} · FINAL STANDINGS
          </motion.p>
        </div>

        {/* Standings table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.3 }}
          className="bg-zinc-900/60 border border-zinc-800/70 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/70 bg-zinc-900/80">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600">
              Standings
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600">
              XP
            </span>
          </div>

          {finalResults.map((player, i) => (
            <PlayerRow
              key={player.id}
              player={player}
              rank={i}
              userId={userId}
              totalQuestions={totalQuestions}
              maxScore={maxScore}
              delay={0.3 + i * 0.06}
            />
          ))}
        </motion.div>

        <ActionBar
          onHome={onHome}
          onPlayAgain={onPlayAgain}
          onRequestRematch={onRequestRematch}
          rematchVotes={rematchVotes}
          rowCount={finalResults.length}
        />
      </motion.div>
    </div>
  );
};

export default GameOverScreen;
