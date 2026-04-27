import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const JoinRequestsPanel = ({ pendingRequests, onApprove, onDeny }) => {
  if (!pendingRequests.length) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.18)" }}
      >
        <div className="px-5 py-3.5 border-b border-orange-500/10 flex items-center gap-2">
          <span className="text-base">🔔</span>
          <span className="text-sm font-semibold text-orange-400">Pending Requests</span>
          <span className="ml-auto w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold flex items-center justify-center">
            {pendingRequests.length}
          </span>
        </div>
        <div className="p-4 space-y-2">
          {pendingRequests.map((req) => (
            <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-900 bg-zinc-950/60">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={req.avatarUrl || "/Avatar.png"} alt={req.name} />
                <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                  {req.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm font-medium text-zinc-200 truncate">{req.name}</span>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApprove(req.id)}
                  className="h-7 text-xs border-green-500/30 text-green-400 hover:bg-green-500/15 px-3"
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDeny(req.id)}
                  className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/15 px-3"
                >
                  Deny
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default JoinRequestsPanel;
