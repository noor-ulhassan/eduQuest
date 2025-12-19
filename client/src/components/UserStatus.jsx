// import React from "react";

// function UserStatus() {
//   return (
//     <div className="p-4 border-4 rounded-2xl">
//       {/* User Info */}
//       <div className="flex gap-3 items-center">
//         <img src="/alex_walk.gif" alt="walking_user" width={70} height={70} />
//         <h2 className="font-jersey text-2xl">noor@gmail.com</h2>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-2 gap-4 mt-4">
//         <div className="flex items-center gap-3 w-full">
//           <img src="/star.png" alt="star" height={35} width={35} />
//           <div className="flex-1">
//             <h2 className="text-2xl font-jersey">20</h2>
//             <h2 className="text-sm font-jersey text-gray-800">Total Rewards</h2>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 w-full">
//           <img src="/star.png" alt="star" height={35} width={35} />
//           <div className="flex-1">
//             <h2 className="text-2xl font-jersey">20</h2>
//             <h2 className="text-sm font-jersey text-gray-800">Total Rewards</h2>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 w-full">
//           <img src="/fire.png" alt="fire" height={35} width={35} />
//           <div className="flex-1">
//             <h2 className="text-2xl font-jersey font-bold">20</h2>
//             <h2 className="text-sm font-jersey text-gray-800">Daily Streak</h2>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 w-full">
//           <img src="/badge.png" alt="badge" height={35} width={35} />
//           <div className="flex-1">
//             <h2 className="text-2xl font-jersey font-bold">20</h2>
//             <h2 className="text-sm font-jersey text-gray-800">Total Rewards</h2>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default UserStatus;
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const UserStats = () => {
  const user = useSelector((state) => state.auth.user);

  const username = user?.username || "Guest";
  const name = user?.name || "Guest User";
  const level = user?.level || 1;
  const totalXP = user?.totalXP || 0;
  const rank = user?.rank || "Bronze";
  const badges = user?.badges || 0;
  const dayStreak = user?.dayStreak || 0;
  const avatarUrl = user?.avatarUrl || "/Avatar.png";


  const [animatedXP, setAnimatedXP] = useState(0);
  const [animatedBadges, setAnimatedBadges] = useState(0);
  const [animatedStreak, setAnimatedStreak] = useState(0);

  useEffect(() => {
    const duration = 1000; 
    const stepTime = 30;
    const steps = Math.ceil(duration / stepTime);

    const xpStep = totalXP / steps;
    const badgesStep = badges / steps;
    const streakStep = dayStreak / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setAnimatedXP(Math.min(totalXP, Math.floor(xpStep * currentStep)));
      setAnimatedBadges(Math.min(badges, Math.floor(badgesStep * currentStep)));
      setAnimatedStreak(Math.min(dayStreak, Math.floor(streakStep * currentStep)));

      if (currentStep >= steps) clearInterval(interval);
    }, stepTime);

    return () => clearInterval(interval);
  }, [totalXP, badges, dayStreak]);

  const stats = [
    {
      label: "Total XP",
      value: animatedXP,
      icon: "/star.png",
      bg: "bg-yellow-900",
      glow: "shadow-yellow-500/50",
    },
    {
      label: "Rank",
      value: rank,
      icon: "/level_1.png",
      bg: "bg-gray-800",
      glow: "shadow-yellow-500/50",
    },
    {
      label: "Badges",
      value: animatedBadges,
      icon: "/badge.png",
      bg: "bg-gray-800",
      glow: "shadow-blue-500/50",
    },
    {
      label: "Day Streak",
      value: animatedStreak,
      icon: "/fire.png",
      bg: "bg-gray-800",
      glow: "shadow-orange-500/50",
    },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800
 rounded-2xl p-6 shadow-2xl max-w-md mx-auto text-white">

      <div className="flex items-center gap-4 mb-6 relative">
       
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-pink-500 via-yellow-500 to-yellow-400 blur-xl animate-pulse"></div>
          <img
            src={avatarUrl}
            alt={`${name}'s Avatar`}
            className="w-20 h-20 rounded-full border-2 border-gray-800 relative z-10 object-cover"
          />
          <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 border-2 border-gray-900 rounded-full animate-pulse"></span>
        </div>
        <div>
          <h3 className="text-lg font-bold">{name}</h3>
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-600 text-white">
              Level {level}
            </span>
          </div>
          <div className="mt-2 h-2 w-40 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-2 bg-yellow-500 w-3/4 animate-pulse"></div> 
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-3 rounded-lg ${stat.bg} hover:scale-[1.05] transition-transform shadow-lg ${stat.glow} relative`}
          >
            <div className="w-10 h-10 flex items-center justify-center relative">
              <img src={stat.icon} alt={stat.label} className="w-full h-full" />
             
              <div className="absolute inset-0 pointer-events-none">
                <span className="block w-1 h-1 bg-white rounded-full animate-ping absolute top-0 left-0"></span>
                <span className="block w-1 h-1 bg-white rounded-full animate-ping absolute bottom-0 right-0"></span>
              </div>
            </div>
            <div>
              <p className="font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-300">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserStats;
