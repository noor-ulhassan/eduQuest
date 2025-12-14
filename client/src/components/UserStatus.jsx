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
// client/src/components/UserStatus.jsx
import React, { useState, useEffect } from "react";

function UserStatus() {
  // Fallback data in case API fails
  const [userData, setUserData] = useState({
    email: "noor@gmail.com",
    totalRewards: 20,
    dailyStreak: 20,
    badges: 20,
    level: 2,
    avatar: "/alex_walk.gif",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/v1/user/me");
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        // Keep fallback data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Show loading state while fetching
  if (loading) {
    return (
      <div className="p-4 border-4 rounded-2xl animate-pulse">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="h-6 bg-gray-300 w-32 rounded"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 w-10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-4 rounded-2xl">
      {/* User Info */}
      <div className="flex gap-3 items-center">
        <img
          src={userData.avatar || "/alex_walk.gif"}
          alt="User"
          width={70}
          height={70}
        />
        <h2 className="font-jersey text-2xl">
          {userData.email || "user@example.com"}
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Total Rewards */}
        <div className="flex items-center gap-3 w-full">
          <img src="/star.png" alt="Star" height={35} width={35} />
          <div className="flex-1">
            <h2 className="text-2xl font-jersey">{userData.totalRewards}</h2>
            <h2 className="text-sm font-jersey text-gray-800">Total Rewards</h2>
          </div>
        </div>

        {/* Daily Streak */}
        <div className="flex items-center gap-3 w-full">
          <img src="/fire.png" alt="Fire" height={35} width={35} />
          <div className="flex-1">
            <h2 className="text-2xl font-jersey">{userData.dailyStreak}</h2>
            <h2 className="text-sm font-jersey text-gray-800">Daily Streak</h2>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-3 w-full">
          <img src="/badge.png" alt="Badge" height={35} width={35} />
          <div className="flex-1">
            <h2 className="text-2xl font-jersey">{userData.badges}</h2>
            <h2 className="text-sm font-jersey text-gray-800">Badges</h2>
          </div>
        </div>

        {/* Level */}
        <div className="flex items-center gap-3 w-full">
          <img src="/crown.png" alt="Level" height={35} width={35} />
          <div className="flex-1">
            <h2 className="text-2xl font-jersey">Level {userData.level}</h2>
            <h2 className="text-sm font-jersey text-gray-800">Level</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserStatus;
