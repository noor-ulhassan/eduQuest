import React from "react";
import { motion } from "framer-motion";
import { Crown, Trophy, ArrowLeft, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PodiumScreen = ({ leaderboard, userId, isHost, onHome }) => {
  const sorted = [...leaderboard].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const second = sorted[1];
  const third = sorted[2];
  const rest = sorted.slice(3);
  const isWinner = winner?.id === userId;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 font-sans selection:bg-orange-500/30 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl w-full space-y-8"
      >
        <div className="text-center space-y-2">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent"
          >
            {isWinner ? "🏆 Victory!" : "Competition Ended"}
          </motion.h1>
          <p className="text-zinc-400 text-lg">Final standings</p>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-3 md:gap-6 pt-8 pb-4">
          {second && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-2">
                <img
                  src={second.avatarUrl || "/Avatar.png"}
                  alt={second.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-3 border-zinc-300 shadow-lg object-cover"
                />
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-zinc-300 text-black rounded-full flex items-center justify-center text-xs font-black shadow-md">2</span>
              </div>
              <span className="text-sm font-semibold text-zinc-300 truncate max-w-[80px] mb-1">{second.name}</span>
              <div className="w-24 md:w-28 bg-gradient-to-t from-zinc-700 to-zinc-600 rounded-t-xl flex flex-col items-center justify-end h-[100px] md:h-[120px] border-t-4 border-zinc-400">
                <span className="text-lg font-bold text-zinc-200 mb-3">{second.score}</span>
              </div>
            </motion.div>
          )}

          {winner && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center -mt-4"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-2"
              >
                <img
                  src={winner.avatarUrl || "/Avatar.png"}
                  alt={winner.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)] object-cover"
                />
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <Crown size={28} className="text-yellow-400 drop-shadow-lg" fill="currentColor" />
                </div>
              </motion.div>
              <span className="text-base font-bold text-yellow-300 truncate max-w-[100px] mb-1">{winner.name}</span>
              <div className="w-28 md:w-32 bg-gradient-to-t from-yellow-700/80 to-yellow-600/60 rounded-t-xl flex flex-col items-center justify-end h-[140px] md:h-[170px] border-t-4 border-yellow-500 shadow-xl">
                <Trophy size={24} className="text-yellow-400 mb-1" />
                <span className="text-2xl font-black text-yellow-200 mb-3">{winner.score}</span>
              </div>
            </motion.div>
          )}

          {third && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-2">
                <img
                  src={third.avatarUrl || "/Avatar.png"}
                  alt={third.name}
                  className="w-14 h-14 md:w-18 md:h-18 rounded-full border-3 border-orange-700 shadow-lg object-cover"
                />
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-orange-700 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md">3</span>
              </div>
              <span className="text-sm font-semibold text-orange-300 truncate max-w-[80px] mb-1">{third.name}</span>
              <div className="w-24 md:w-28 bg-gradient-to-t from-orange-900/60 to-orange-800/40 rounded-t-xl flex flex-col items-center justify-end h-[80px] md:h-[100px] border-t-4 border-orange-700">
                <span className="text-lg font-bold text-orange-300 mb-3">{third.score}</span>
              </div>
            </motion.div>
          )}
        </div>

        {rest.length > 0 && (
          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
              {rest.map((p, i) => (
                <div
                  key={p.id}
                  className={`p-3 flex items-center gap-3 border-b border-zinc-800/50 last:border-0 ${p.id === userId ? "bg-orange-500/5" : ""}`}
                >
                  <span className="w-6 h-6 rounded bg-zinc-800 text-zinc-500 flex items-center justify-center text-xs font-bold">
                    {i + 4}
                  </span>
                  <img src={p.avatarUrl || "/Avatar.png"} className="w-8 h-8 rounded-full object-cover" alt="" />
                  <span className="flex-1 text-sm font-medium text-zinc-300 truncate">
                    {p.name}
                    {p.id === userId && (
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1 rounded ml-1">YOU</span>
                    )}
                  </span>
                  <span className="font-mono font-bold text-orange-400 text-sm">{p.score} XP</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex gap-4 justify-center pt-4">
          <Button
            variant="outline"
            onClick={onHome}
            className="gap-2 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white h-12 px-6"
          >
            <ArrowLeft size={16} /> Return Home
          </Button>
          {isHost && (
            <Button
              onClick={() => window.location.reload()}
              className="gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white h-12 px-8 shadow-lg shadow-orange-900/20"
            >
              <Play size={16} fill="currentColor" /> Play Again
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PodiumScreen;
