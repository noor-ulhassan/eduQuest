import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserStats = ({
  username = "arishaaa",
  level = 2,
  totalXP = 100,
  rank = "Bronze",
  badges = 1,
  dayStreak = 3,
}) => {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Stat items with icon, color, and label
  const stats = [
    {
      label: "Total XP",
      value: totalXP,
      icon: "⭐",
      bg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Rank",
      value: rank,
      icon: "🏆",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Badges",
      value: badges,
      icon: "🎖️",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Day streak",
      value: dayStreak,
      icon: "🔥",
      bg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Username & Level */}
      <div className="flex items-center gap-3 mb-6">
        <Avatar className="h-12 w-12 rounded-lg">
          <AvatarImage
            src="/Avatar.png"
            alt={`${username}'s Avatar`}
            className="rounded-lg object-cover"
          />
          <AvatarFallback className="bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-sm font-semibold">
            {getInitials(username)}
          </AvatarFallback>
        </Avatar>

        <div>
          <h3 className="font-semibold text-gray-800">{username}</h3>
          <div className="mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              Level {level}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-3 rounded-lg ${stat.bg} transition-transform hover:scale-[1.02]`}
          >
            <div className={`p-2 rounded-lg ${stat.bg} ${stat.iconColor}`}>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <div>
              <p className="font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserStats;
