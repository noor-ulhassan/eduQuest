import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skull, Flag } from "lucide-react";

const GameEventsFeed = ({ gameEvents }) => {
  if (!gameEvents?.length) return null;
  return (
    <div className="px-2 pt-2 pb-1 border-b border-zinc-800 space-y-1">
      <AnimatePresence>
        {gameEvents.map((ev) => {
          const eliminated = ev.type === "eliminated";
          return (
            <motion.div
              key={ev.time}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className={`relative overflow-hidden text-[10px] pl-2.5 pr-2 py-1.5 rounded-md flex items-center gap-1.5 font-semibold ${
                eliminated
                  ? "bg-red-500/10 text-red-300"
                  : "bg-emerald-500/10 text-emerald-300"
              }`}
            >
              <span
                className={`absolute left-0 top-0 bottom-0 w-[2px] ${
                  eliminated ? "bg-red-500" : "bg-emerald-500"
                }`}
              />
              {eliminated ? (
                <Skull size={11} className="shrink-0 text-red-400" />
              ) : (
                <Flag size={11} className="shrink-0 text-emerald-400" fill="currentColor" />
              )}
              <span className="truncate">
                <span className="font-bold">{ev.name}</span>
                <span className="opacity-70 font-medium">
                  {eliminated ? " eliminated" : " finished"}
                </span>
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default GameEventsFeed;
