import React from "react";

function UserStatus() {
  return (
    <div className="p-4 border-4 rounded-2xl">
      {/* User Info */}
      <div className="flex gap-3 items-center">
        <img src="/alex_walk.gif" alt="walking_user" width={70} height={70} />
        <h2 className="font-jersey text-2xl">noor@gmail.com</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex items-center gap-3 w-full">
          <img src="/star.png" alt="star" height={35} width={35} />
          <div className="flex-1">
            <h2 className="text-2xl font-jersey">20</h2>
            <h2 className="text-sm font-jersey text-gray-800">Total Rewards</h2>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full">
          <img src="/star.png" alt="star" height={35} width={35} />
          <div className="flex-1">
            <h2 className="text-2xl font-jersey">20</h2>
            <h2 className="text-sm font-jersey text-gray-800">Total Rewards</h2>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full">
          <img src="/fire.png" alt="fire" height={35} width={35} />
          <div className="flex-1">
            <h2 className="text-2xl font-jersey font-bold">20</h2>
            <h2 className="text-sm font-jersey text-gray-800">Daily Streak</h2>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full">
          <img src="/badge.png" alt="badge" height={35} width={35} />
          <div className="flex-1">
            <h2 className="text-2xl font-jersey font-bold">20</h2>
            <h2 className="text-sm font-jersey text-gray-800">Total Rewards</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserStatus;
