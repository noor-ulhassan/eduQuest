import React from "react";

function UserStatus() {
  return (
    <div className="p-10 mt-10">
      <div className="flex gap-3 items-center">
        <img src="/alex_walk.gif" alt="walking_user" width={70} height={70} />
        <h2 className="font-bold tex-2xl">noor@gmail.com</h2>
      </div>
      <div className="grid drid-cols-2 gap-5">
        <div className="flex items-center gap-5">
          <img src="/star.png" alt="star" height={35} width={35} />
          <div className="flex gap-3 items-center">
            <h2 className="text-2xl font-xl font-bold">20</h2>
            <h2 className="font-xl text-gray-800">Total Rewards</h2>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <img src="/star.png" alt="star" height={35} width={35} />
          <div className="flex gap-3 items-center">
            <h2 className="text-2xl font-xl font-bold">20</h2>
            <h2 className="font-xl text-gray-800">Total Rewards</h2>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <img src="/fire.png" alt="star" height={35} width={35} />
          <div className="flex gap-3 items-center">
            <h2 className="text-2xl font-xl font-bold">20</h2>
            <h2 className="font-xl text-gray-800">Total Rewards</h2>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <img src="/badge.png" alt="star" height={35} width={35} />
          <div className="flex gap-3 items-center">
            <h2 className="text-2xl font-xl font-bold">20</h2>
            <h2 className="font-xl text-gray-800">Total Rewards</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserStatus;
