import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Trophy, ChevronRight } from "lucide-react";
import { useGlobalLeaderboard } from "@/features/leaderboard/useLeaderboard";
import { cn } from "@/lib/utils";

const METALLIC_ORANGE = {
  background:
    "linear-gradient(135deg, #fb923c 0%, #fcd34d 28%, #c2410c 52%, #fbbf24 76%, #f97316 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

const RankBadge = ({ rank }) => {
  if (rank === 1)
    return (
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-black text-black text-[10px] shadow-[0_0_8px_rgba(234,179,8,0.4)] shrink-0">
        1
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-500 flex items-center justify-center font-black text-black text-[10px] shrink-0">
        2
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-700 flex items-center justify-center font-black text-black text-[10px] shrink-0">
        3
      </div>
    );
  return (
    <span className="text-zinc-600 font-bold text-xs w-6 text-center shrink-0">
      #{rank}
    </span>
  );
};

const RowSkeleton = () => (
  <div className="h-10 rounded-xl animate-pulse bg-white/[0.02] border border-white/[0.03]" />
);

const LeaderboardPreview = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);

  const { data: leaderboardData, isLoading } = useGlobalLeaderboard();
  const entries = isLoading ? null : (leaderboardData?.data?.data?.slice(0, 5) ?? []);

  return (
    <div className="bg-[#1a1730] rounded-[2rem] p-6 border border-zinc-700 shadow-sm w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-orange-400" />
          <h4 className="font-bold text-white text-base">Top Players</h4>
        </div>
        <button
          onClick={() => navigate("/leaderboard")}
          className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-orange-400 transition-colors"
        >
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {entries === null ? (
          [...Array(5)].map((_, i) => <RowSkeleton key={i} />)
        ) : entries.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center py-4">
            No rankings yet
          </p>
        ) : (
          entries.map((entry, idx) => {
            const rank = idx + 1;
            const isMe =
              currentUser &&
              entry._id?.toString() === currentUser._id?.toString();
            return (
              <div
                key={entry._id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl transition-all",
                  isMe
                    ? "bg-orange-500/[0.06] border border-orange-500/20"
                    : "border border-transparent",
                )}
              >
                <RankBadge rank={rank} />
                <img
                  src={
                    entry.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry._id}`
                  }
                  alt="avatar"
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                />
                <span
                  className={cn(
                    "flex-1 text-[12px] font-bold truncate",
                    isMe ? "text-orange-400" : "text-zinc-200",
                  )}
                >
                  {entry.username || entry.name}
                </span>
                <span
                  className="text-[11px] font-black tabular-nums shrink-0"
                  style={METALLIC_ORANGE}
                >
                  {(entry.xp ?? 0).toLocaleString()} XP
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LeaderboardPreview;
