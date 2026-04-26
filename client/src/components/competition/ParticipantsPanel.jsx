import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Crown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ParticipantsPanel = ({ room, userId }) => (
  <div className="rounded-2xl overflow-hidden" style={{ background: "#0c0c0c", border: "1px solid #1a1a1a" }}>
    <div className="px-5 py-4 border-b border-zinc-900/80 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Users size={15} className="text-zinc-600" />
        <span className="text-sm font-semibold text-zinc-200">Participants</span>
      </div>
      <span
        className="px-2.5 py-0.5 rounded-full text-xs font-bold"
        style={{ background: "rgba(249,115,22,0.08)", color: "#f97316", border: "1px solid rgba(249,115,22,0.18)" }}
      >
        {room?.players?.length || 0}<span className="text-zinc-700 font-normal">/20</span>
      </span>
    </div>
    <div className="p-3 space-y-2">
      <AnimatePresence>
        {room?.players?.map((player) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-3 p-3 rounded-xl transition-all"
            style={{
              background: player.id === room.hostId ? "rgba(234,179,8,0.05)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${player.id === room.hostId ? "rgba(234,179,8,0.12)" : "#1a1a1a"}`,
            }}
          >
            <div className="relative shrink-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={player.avatarUrl || "/Avatar.png"} alt={player.name} />
                <AvatarFallback className="bg-zinc-800 text-zinc-500 text-xs">
                  {player.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {player.id === room.hostId && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg">
                  <Crown size={8} className="text-black" fill="currentColor" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-200 truncate">
                {player.name}
                {player.id === userId && (
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1 rounded ml-1">YOU</span>
                )}
              </p>
              <p
                className="text-[10px] font-medium mt-0.5"
                style={{ color: player.id === room.hostId ? "#ca8a04" : "#3f3f46" }}
              >
                {player.id === room.hostId ? "Host" : "Player"}
              </p>
            </div>
          </motion.div>
        ))}
        {Array.from({ length: Math.max(0, 2 - (room?.players?.length || 0)) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center gap-3 p-3 rounded-xl min-h-[56px]"
            style={{ border: "1px dashed #1e1e1e" }}
          >
            <div className="w-9 h-9 rounded-full shrink-0" style={{ border: "1px dashed #2a2a2a" }} />
            <span className="text-xs text-zinc-700">Waiting for player...</span>
          </div>
        ))}
      </AnimatePresence>
    </div>
  </div>
);

export default ParticipantsPanel;
