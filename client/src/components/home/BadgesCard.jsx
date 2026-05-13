import React from "react";
import { useSelector } from "react-redux";
import { Award, Lock, Sparkles } from "lucide-react";

const getRarityConfig = (rarity) => {
  switch (rarity) {
    case "Legendary":
      return {
        color: "text-amber-500 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-500/10",
        ring: "ring-amber-400/30",
      };
    case "Epic":
      return {
        color: "text-purple-500 dark:text-purple-400",
        bg: "bg-purple-50 dark:bg-purple-500/10",
        ring: "ring-purple-400/30",
      };
    case "Rare":
      return {
        color: "text-blue-500 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-500/10",
        ring: "ring-blue-400/30",
      };
    default: // Common
      return {
        color: "text-emerald-500 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        ring: "ring-emerald-400/30",
      };
  }
};

const BadgesCard = () => {
  const user = useSelector((state) => state.auth.user);
  const earnedBadges = user?.badges || [];

  // Create exactly 4 slots to match AchievementsCard grid perfectly
  const totalSlots = 4;
  const slots = Array.from({ length: totalSlots }, (_, index) => {
    if (index < earnedBadges.length) {
      return {
        isEarned: true,
        ...earnedBadges[index],
      };
    }
    return {
      isEarned: false,
      title: "Mystery Badge",
    };
  });

  return (
    <div className="bg-white dark:bg-[#1a1730] rounded-[2rem] p-6 border border-zinc-300 dark:border-zinc-700 border-b-4 shadow-sm w-full">
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-bold text-zinc-900 dark:text-white text-base">
          Earned Badges
        </h4>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          {earnedBadges.length} {earnedBadges.length === 1 ? "Badge" : "Badges"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {slots.map((slot, i) => {
          if (slot.isEarned) {
            const config = getRarityConfig(slot.rarity || "Common");
            return (
              <div
                key={slot._id || i}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105 ${config.bg} ring-2 ${config.ring}`}
                >
                  {slot.icon ? (
                    <img
                      src={slot.icon}
                      alt={slot.title}
                      className="w-7 h-7 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <Sparkles
                    className={`w-6 h-6 ${config.color} ${slot.icon ? "hidden" : "flex"}`}
                  />
                </div>
                <p className="text-xs font-bold truncate w-full px-1 text-zinc-800 dark:text-zinc-200">
                  {slot.title}
                </p>
                <span
                  className={`mt-0.5 text-[9px] font-bold uppercase tracking-wider ${config.color}`}
                >
                  {slot.rarity || "Common"}
                </span>
              </div>
            );
          }

          // Locked / Mystery placeholder slot
          return (
            <div
              key={i}
              className="flex flex-col items-center text-center group opacity-60 cursor-not-allowed"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2.5 bg-zinc-50 dark:bg-white/5 border border-dashed border-zinc-200 dark:border-white/10">
                <Lock className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
              </div>
              <p className="text-xs font-bold truncate w-full px-1 text-zinc-400 dark:text-zinc-500">
                {slot.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgesCard;
