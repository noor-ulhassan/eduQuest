import React from "react";

const WelcomeBanner = () => {
  return (
    <div className="flex gap-3 items-center">
      <img src={"/machine.webp"} alt="robo" width={120} height={120} />
      <h2 className="text-2xl p-4 border bg-zinc-200 rounded-lg rounded-bl-none">
        Welcome Back, Start Learning Something new...
      </h2>
    </div>
  );
};

export default WelcomeBanner;
