import React from "react";
import { Copy, Check, Link2 } from "lucide-react";
import { motion } from "framer-motion";

const RoomCodeCard = ({ roomCode, copied, onCopyCode, onCopyLink }) => (
  <div
    className="relative rounded-2xl overflow-hidden"
    style={{
      background: "linear-gradient(135deg, #0f0f0f, #111)",
      border: "1px solid #1e1e1e",
    }}
  >
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

    <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-5">
      <div className="flex-1 min-w-0">
        <p className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-3.5">
          <span className="inline-block w-4 h-px bg-gradient-to-r from-transparent to-orange-500/50" />
          Room Code
          <span className="inline-block w-4 h-px bg-gradient-to-l from-transparent to-orange-500/50" />
        </p>
        <div className="flex items-center gap-2">
          {roomCode.split("").map((char, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10, scale: 0.75 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 320, damping: 20 }}
              className="w-11 h-12 rounded-xl flex items-center justify-center font-mono text-2xl font-black select-all"
              style={{
                background: "linear-gradient(180deg, rgba(249,115,22,0.16) 0%, rgba(249,115,22,0.06) 100%)",
                border: "1px solid rgba(249,115,22,0.28)",
                boxShadow:
                  "0 1px 0 rgba(0,0,0,0.7) inset, 0 -1px 0 rgba(249,115,22,0.15) inset, 0 0 18px rgba(249,115,22,0.1)",
              }}
            >
              <span className="text-metallic-orange" style={{ textShadow: "0 0 14px rgba(249,115,22,0.65)" }}>{char}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 shrink-0">
        <button
          onClick={onCopyCode}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 hover:text-zinc-200 hover:border-zinc-600"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#71717a",
          }}
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy Code"}
        </button>
        <button
          onClick={onCopyLink}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 hover:bg-orange-500/20"
          style={{
            background: "rgba(249,115,22,0.14)",
            border: "1px solid rgba(249,115,22,0.3)",
            boxShadow: "0 0 20px rgba(249,115,22,0.1)",
          }}
        >
          <Link2 size={14} className="text-orange-400" />
          <span className="text-metallic">Invite Link</span>
        </button>
      </div>
    </div>
  </div>
);

export default RoomCodeCard;
