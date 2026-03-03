import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoiceSpeakerIndicator from "./VoiceSpeakerIndicator";

/**
 * VoiceControls — Floating mic toggle bar for competitions.
 *
 * Shows in every phase: lobby, playing, results.
 * Displays connected voice users count and mic on/off toggle.
 */
const VoiceControls = ({
  isInVoice,
  isMuted,
  voiceUsers,
  activeSpeakers,
  onJoin,
  onLeave,
  onToggleMute,
}) => {
  if (!isInVoice) {
    // Show a "Connect Audio" button
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={onJoin}
          className="h-12 px-5 rounded-full bg-zinc-900 border border-zinc-700 hover:border-green-500/50 hover:bg-zinc-800 text-zinc-300 hover:text-green-400 shadow-xl shadow-black/40 flex items-center gap-2.5 transition-all"
        >
          <Phone size={18} />
          <span className="text-sm font-semibold">Join Voice</span>
        </Button>
      </motion.div>
    );
  }

  // In voice — show controls
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="flex items-center gap-2 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-full px-3 py-2 shadow-2xl shadow-black/50">
        {/* Connected users avatars */}
        <div className="flex items-center gap-1 pr-2 border-r border-zinc-700">
          <Users size={14} className="text-zinc-500 mr-1" />
          <div className="flex -space-x-2">
            {voiceUsers.slice(0, 4).map((vu) => (
              <div key={vu.socketId} className="relative">
                <img
                  src={vu.avatarUrl || "/Avatar.png"}
                  alt={vu.name}
                  className={`w-7 h-7 rounded-full border-2 object-cover transition-all ${
                    activeSpeakers.has(vu.userId)
                      ? "border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                      : "border-zinc-800"
                  }`}
                  title={vu.name}
                />
                {activeSpeakers.has(vu.userId) && (
                  <VoiceSpeakerIndicator size="sm" />
                )}
              </div>
            ))}
            {voiceUsers.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                +{voiceUsers.length - 4}
              </div>
            )}
          </div>
        </div>

        {/* Mute toggle */}
        <button
          onClick={onToggleMute}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isMuted
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Leave voice */}
        <button
          onClick={onLeave}
          className="w-10 h-10 rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-all"
          title="Leave Voice"
        >
          <PhoneOff size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default VoiceControls;
