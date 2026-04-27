import React from "react";
import { motion } from "framer-motion";
import { Trophy, Target, Home, Eye, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VoiceSpeakerIndicator from "./VoiceSpeakerIndicator";

const ResultsScreen = ({
  finishData,
  isEliminated,
  currentGameMode,
  teamScores,
  playerTeam,
  userId,
  leaderboard,
  activeSpeakers,
  onHome,
  onSpectate,
}) => {
  const accuracy =
    finishData.totalQuestions > 0
      ? Math.round((finishData.correctAnswers / finishData.totalQuestions) * 100)
      : 0;
  const minutes = Math.floor((finishData.timeTaken || 0) / 60);
  const seconds = (finishData.timeTaken || 0) % 60;

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-6 relative overflow-hidden bg-zinc-950">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isEliminated ? (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-red-800/10 rounded-full blur-[100px]" />
          </>
        ) : (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
          </>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full relative z-10 space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          {isEliminated ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-red-500/20 to-red-800/20 border-2 border-red-500/40"
              >
                <span className="text-4xl">💀</span>
              </motion.div>
              <h1 className="text-3xl font-bold text-red-400">Eliminated!</h1>
              <p className="text-zinc-400 mt-1 text-sm">You answered incorrectly in Survival mode</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-2 border-orange-500/30">
                {finishData.rank === 1 ? (
                  <Trophy size={40} className="text-yellow-400" />
                ) : (
                  <Target size={40} className="text-orange-400" />
                )}
              </div>
              <h1 className="text-3xl font-bold">
                {finishData.rank === 1 ? "🏆 1st Place!" : `#${finishData.rank} Place`}
              </h1>
              <p className="text-zinc-400 mt-1 text-sm">Challenge Complete</p>
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-zinc-900/60 border-zinc-800 p-4 text-center">
            <div className={`text-2xl font-bold ${isEliminated ? "text-red-400" : "text-orange-400"}`}>
              {finishData.score}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1">Total XP</div>
          </Card>
          <Card className="bg-zinc-900/60 border-zinc-800 p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1">Accuracy</div>
          </Card>
          {!isEliminated && (
            <Card className="bg-zinc-900/60 border-zinc-800 p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {minutes}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1">Time Taken</div>
            </Card>
          )}
          <Card className="bg-zinc-900/60 border-zinc-800 p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {finishData.correctAnswers}/{finishData.totalQuestions}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1">Correct</div>
          </Card>
        </div>

        {/* Mode callout */}
        {currentGameMode === "team" && teamScores ? (
          (() => {
            const myTeam = playerTeam?.[userId];
            const winningTeam = teamScores[0] > teamScores[1] ? 0 : teamScores[1] > teamScores[0] ? 1 : null;
            const iWon = winningTeam === myTeam;
            const isDraw = winningTeam === null;
            return (
              <div className={`bg-gradient-to-r ${iWon ? "from-green-500/10 to-emerald-500/10 border-green-500/20" : isDraw ? "from-zinc-700/20 to-zinc-600/20 border-zinc-600/30" : "from-red-500/10 to-red-800/10 border-red-500/20"} border rounded-xl p-4`}>
                <p className="text-sm font-bold text-white mb-2">🤝 Team Battle Result</p>
                <div className="flex gap-3">
                  <div className={`flex-1 text-center p-2 rounded-lg ${myTeam === 0 ? "bg-blue-500/20 border border-blue-500/30" : "bg-zinc-800"}`}>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold">🔵 Team Blue</p>
                    <p className="text-lg font-black text-blue-400">{teamScores[0]}</p>
                    {winningTeam === 0 && <p className="text-[10px] text-green-400 font-bold">WINNER</p>}
                  </div>
                  <div className={`flex-1 text-center p-2 rounded-lg ${myTeam === 1 ? "bg-red-500/20 border border-red-500/30" : "bg-zinc-800"}`}>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold">🔴 Team Red</p>
                    <p className="text-lg font-black text-red-400">{teamScores[1]}</p>
                    {winningTeam === 1 && <p className="text-[10px] text-green-400 font-bold">WINNER</p>}
                  </div>
                </div>
                <p className="text-xs text-center mt-2 text-zinc-400">
                  {isDraw ? "It's a draw!" : iWon ? "Your team won! 🎉" : "Better luck next time!"}
                </p>
              </div>
            );
          })()
        ) : isEliminated ? (
          <div className="bg-gradient-to-r from-red-500/10 to-red-800/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <span className="text-xl shrink-0">💀</span>
            <div>
              <p className="text-sm font-semibold text-white">Survival Mode</p>
              <p className="text-xs text-zinc-400">Lowest scorer each round is eliminated. Better luck next time!</p>
            </div>
          </div>
        ) : (
          <div className={`bg-gradient-to-r ${currentGameMode === "blitz" ? "from-yellow-500/10 to-orange-500/10 border-yellow-500/20" : "from-orange-500/10 to-yellow-500/10 border-orange-500/20"} border rounded-xl p-4 flex items-center gap-3`}>
            <Zap size={20} className={`shrink-0 ${currentGameMode === "blitz" ? "text-yellow-400" : "text-orange-400"}`} />
            <div>
              <p className="text-sm font-semibold text-white">
                {currentGameMode === "blitz" ? "Blitz Mode — 3× Speed Bonus" : "Speed Bonus Applied"}
              </p>
              <p className="text-xs text-zinc-400">Faster answers earned you extra XP per question!</p>
            </div>
          </div>
        )}

        {/* Live Standings */}
        <Card className="bg-zinc-900/50 border-zinc-800 p-0 overflow-hidden">
          <div className="p-3 border-b border-zinc-800 bg-zinc-900/50">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Trophy size={12} className="text-yellow-400" /> Live Standings
            </h3>
          </div>
          <div className="p-2 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
            {leaderboard.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-2 p-2 rounded-lg text-sm ${p.id === userId ? "bg-orange-500/10 border border-orange-500/20" : ""}`}
              >
                <span className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-zinc-300 text-black" : i === 2 ? "bg-orange-700 text-white" : "bg-zinc-800 text-zinc-500"}`}>
                  {i + 1}
                </span>
                <span className={`flex-1 truncate flex items-center ${p.id === userId ? "text-orange-400 font-medium" : "text-zinc-300"}`}>
                  {p.name} {p.id === userId && "(You)"}
                  {activeSpeakers.has(p.id) && <VoiceSpeakerIndicator inline />}
                </span>
                <span className="text-xs text-zinc-500">
                  {p.eliminated ? "💀" : p.finished ? "✓" : `Q${p.currentQuestion}`}
                </span>
                <span className="text-xs font-bold text-orange-400">{p.score}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onHome}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl"
          >
            <Home size={16} className="mr-2" /> Go Home
          </Button>
          <Button
            onClick={onSpectate}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-pink-600 hover:opacity-90 text-white font-semibold rounded-xl"
          >
            <Eye size={16} className="mr-2" /> Spectate
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsScreen;
