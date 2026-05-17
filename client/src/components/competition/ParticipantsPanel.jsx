import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Crown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const WaitingDots = () => (
  <span className="flex items-center gap-1">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1 h-1 rounded-full inline-block"
        style={{ background: "#3f3f46" }}
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.22, ease: "easeInOut" }}
      />
    ))}
  </span>
);

const ParticipantsPanel = ({ room, userId }) => (
  <div className="rounded-2xl overflow-hidden" style={{ background: "#0c0c0c", border: "1px solid #1a1a1a" }}>
    <div className="px-5 py-4 border-b border-zinc-900/80 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Users size={15} className="text-zinc-500" />
        <span className="text-sm font-semibold text-metallic">Participants</span>
      </div>
      <span
        className="px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums"
        style={{
          background: "rgba(249,115,22,0.1)",
          border: "1px solid rgba(249,115,22,0.22)",
          boxShadow: "0 0 10px rgba(249,115,22,0.1)",
        }}
      >
        <span className="text-metallic-orange">{room?.players?.length || 0}</span>
        <span className="text-zinc-600 font-normal">/20</span>
      </span>
    </div>

    <div className="p-3 space-y-2">
      <AnimatePresence>
        {room?.players?.map((player) => {
          const isHost = player.id === room.hostId;
          const isYou  = player.id === userId;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{
                background: isHost ? "rgba(234,179,8,0.05)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isHost ? "rgba(234,179,8,0.14)" : "#1a1a1a"}`,
              }}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="rounded-full"
                  style={{
                    background: isHost
                      ? "linear-gradient(135deg, #eab308, #f59e0b)"
                      : player.ready
                        ? "linear-gradient(135deg, #22c55e, #16a34a)"
                        : "transparent",
                    boxShadow: isHost
                      ? "0 0 14px rgba(234,179,8,0.35)"
                      : player.ready
                        ? "0 0 10px rgba(34,197,94,0.3)"
                        : "none",
                    padding: isHost || player.ready ? "2px" : "0",
                  }}
                >
                  <Avatar className="h-9 w-9 block">
                    <AvatarImage src={player.avatarUrl || "/Avatar.png"} alt={player.name} />
                    <AvatarFallback className="bg-zinc-800 text-zinc-500 text-xs">
                      {player.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {isHost && (
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "#eab308", boxShadow: "0 0 8px rgba(234,179,8,0.6)" }}
                  >
                    <Crown size={8} className="text-black" fill="currentColor" />
                  </div>
                )}
                {!isHost && player.ready && (
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-zinc-950 flex items-center justify-center"
                    style={{ background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }}
                  >
                    <span className="text-[8px] font-black text-white">✓</span>
                  </div>
                )}
              </div>

              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-metallic truncate flex items-center gap-1.5">
                  {player.name}
                  {isYou && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(255,255,255,0.06)", color: "#71717a" }}
                    >
                      YOU
                    </span>
                  )}
                </p>
                <p className="text-[10px] font-medium mt-0.5">
                  {isHost ? (
                    <span style={{ color: "#ca8a04" }}>Host</span>
                  ) : player.ready ? (
                    <span className="text-green-500">Ready ✓</span>
                  ) : (
                    <span className="text-zinc-600">Waiting</span>
                  )}
                </p>
              </div>

              {/* Level + Win % */}
              <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(249,115,22,0.08)",
                    border: "1px solid rgba(249,115,22,0.16)",
                  }}
                >
                  <span className="text-metallic-orange">Lvl {player.level || 1}</span>
                </span>
                <span className="text-[10px] text-zinc-600 font-medium">
                  {player.winPercentage || 0}% Win
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Empty slots */}
        {Array.from({ length: Math.max(0, 2 - (room?.players?.length || 0)) }).map((_, i) => (
          <motion.div
            key={`empty-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-3 rounded-xl min-h-[56px]"
            style={{ border: "1px dashed #222" }}
          >
            <div
              className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center"
              style={{ border: "1px dashed #2a2a2a" }}
            >
              <Users size={12} className="text-zinc-700" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-700">Waiting for player</span>
              <WaitingDots />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  </div>
);

export default ParticipantsPanel;
