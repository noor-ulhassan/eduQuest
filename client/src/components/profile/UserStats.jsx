
// import React from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// const UserStats = ({
//   username = "arishaaa",
//   level = 2,
//   totalXP = 100,
//   rank = "Bronze",
//   badges = 1,
//   dayStreak = 3,
// }) => {
//   return (
//     <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
//       {/* Username & Level */}
//       <div className="flex items-center gap-3 mb-5">
//         <Avatar className="h-10 w-10 rounded-md">
//           <AvatarImage
//             src="/client/public/Profile Avatar.png"
//             alt={`${username}'s Avatar`}
//             className="rounded-md object-cover"
//           />
//           <AvatarFallback className="bg-purple-100 text-purple-700 rounded-md flex items-center justify-center text-sm font-semibold">
//             {username.charAt(0).toUpperCase()}
//           </AvatarFallback>
//         </Avatar>
//         <div>
//           <h3 className="font-semibold text-gray-800">{username}</h3>
//           <div className="flex items-center gap-1.5 mt-0.5">
//             <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
//               Level {level}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Stats Grid - 2x2 */}
//       <div className="grid grid-cols-2 gap-4">
//         {/* Total XP */}
//         <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50">
//           <div className="bg-yellow-100 p-2 rounded-lg">
//             <span className="text-yellow-600 text-lg">⭐</span>
//           </div>
//           <div>
//             <p className="font-bold text-gray-800">{totalXP}</p>
//             <p className="text-xs text-gray-500">Total XP</p>
//           </div>
//         </div>

//         {/* Rank */}
//         <div className="flex items-center gap-3 p-2 rounded-lg bg-orange-50">
//           <div className="bg-orange-100 p-2 rounded-lg">
//             <span className="text-orange-600 text-lg">🏆</span>
//           </div>
//           <div>
//             <p className="font-bold text-gray-800">{rank}</p>
//             <p className="text-xs text-gray-500">Rank</p>
//           </div>
//         </div>

//         {/* Badges */}
//         <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
//           <div className="bg-blue-100 p-2 rounded-lg">
//             <span className="text-blue-600 text-lg">🎖️</span>
//           </div>
//           <div>
//             <p className="font-bold text-gray-800">{badges}</p>
//             <p className="text-xs text-gray-500">Badges</p>
//           </div>
//         </div>

//         {/* Day Streak */}
//         <div className="flex items-center gap-3 p-2 rounded-lg bg-red-50">
//           <div className="bg-red-100 p-2 rounded-lg">
//             <span className="text-red-600 text-lg">🔥</span>
//           </div>
//           <div>
//             <p className="font-bold text-gray-800">{dayStreak}</p>
//             <p className="text-xs text-gray-500">Day streak</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserStats;
// src/components/profile/UserStats.jsx
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const UserStats = ({
  username = "arishaaa",
  level = 2,
  totalXP = 100,
  rank = "Bronze",
  badges = 1,
  dayStreak = 3,
}) => {
  // Helper for consistent initials
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Username & Level */}
      <div className="flex items-center gap-3 mb-5">
        <Avatar className="h-10 w-10 rounded-md">
          <AvatarImage
            src="/client/public/Profile Avatar.png"
            alt={`${username}'s Avatar`}
            className="rounded-md object-cover"
          />
          <AvatarFallback className="bg-purple-100 text-purple-700 rounded-md flex items-center justify-center text-sm font-semibold">
            {getInitials(username)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-gray-800">{username}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
              Level {level}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total XP */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <span className="text-yellow-600 text-lg">⭐</span>
          </div>
          <div>
            <p className="font-bold text-gray-800">{totalXP}</p>
            <p className="text-xs text-gray-500">Total XP</p>
          </div>
        </div>

        {/* Rank */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-orange-50">
          <div className="bg-orange-100 p-2 rounded-lg">
            <span className="text-orange-600 text-lg">🏆</span>
          </div>
          <div>
            <p className="font-bold text-gray-800">{rank}</p>
            <p className="text-xs text-gray-500">Rank</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
          <div className="bg-blue-100 p-2 rounded-lg">
            <span className="text-blue-600 text-lg">🎖️</span>
          </div>
          <div>
            <p className="font-bold text-gray-800">{badges}</p>
            <p className="text-xs text-gray-500">Badges</p>
          </div>
        </div>

        {/* Day Streak */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-red-50">
          <div className="bg-red-100 p-2 rounded-lg">
            <span className="text-red-600 text-lg">🔥</span>
          </div>
          <div>
            <p className="font-bold text-gray-800">{dayStreak}</p>
            <p className="text-xs text-gray-500">Day streak</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;