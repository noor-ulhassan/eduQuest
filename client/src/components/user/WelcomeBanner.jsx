// import React from "react";

// const WelcomeBanner = () => {
//   return (
//     <div className="flex gap-3 items-center">
//       <img src={"/machine.webp"} alt="robo" width={120} height={120} />
//       <h2 className="text-2xl p-4 border bg-zinc-200 rounded-lg rounded-bl-none">
//         Welcome Back, Start Learning Something new...
//       </h2>
//     </div>
//   );
// };

import { Zap, Trophy, Target } from "lucide-react";

const WelcomeBanner = () => {
  return (
    <div
      className="relative flex items-center gap-5 rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm"
    >
      <div className="absolute -top-3 -right-3 flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-bold text-zinc-900 shadow-sm">
        <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        +10 XP
      </div>

      <div className="flex items-center justify-center w-14 h-14 bg-indigo-50 rounded-xl shrink-0">
        <Target className="w-8 h-8 text-indigo-500" />
      </div>

      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-zinc-900">
          Welcome back!!
          <Trophy className="h-5 w-5 text-yellow-500" />
        </h2>

        <p className="mt-1 text-sm text-zinc-600">
          Ready to level up?{" "}
          <span className="font-semibold text-zinc-900">
            Start a new challenge today.
          </span>
        </p>
      </div>
    </div>
  );
};

export default WelcomeBanner;
