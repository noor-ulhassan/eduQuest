import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const GameEventsFeed = ({ gameEvents }) => {
  if (!gameEvents?.length) return null;
  return (
    <div className="px-2 pt-2 pb-1 border-b border-zinc-800 space-y-1">
      <AnimatePresence>
        {gameEvents.map((ev) => (
          <motion.div
            key={ev.time}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className={`text-[10px] px-2 py-1 rounded flex items-center gap-1.5 ${
              ev.type === "eliminated"
                ? "bg-red-500/10 text-red-400"
                : "bg-green-500/10 text-green-400"
            }`}
          >
            {ev.type === "eliminated" ? "💀" : "🏁"} {ev.name}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GameEventsFeed;
