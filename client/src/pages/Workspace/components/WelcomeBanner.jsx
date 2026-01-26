import React from "react";

const WelcomeBanner = ({ className }) => {
  return (
    <div
      className={`flex gap-4 items-center p-4 bg-zinc-100 rounded-lg shadow-lg mt-2 hover:cursor-pointer shadow-yellow-200 ${className}`}
    >
      <img src="/pika3.gif" alt="robo" width={100} height={100} />

      <div className="flex flex-col">
        <h2 className="text-2xl font-jersey">Welcome to your Workspace!</h2>
        <p className="mt-1">Learn, create and explore your favorite courses</p>
      </div>
    </div>
  );
};

export default WelcomeBanner;
