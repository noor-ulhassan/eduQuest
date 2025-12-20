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

// export default WelcomeBanner;import React from "react";
import { Sparkles, Trophy } from "lucide-react";

const WelcomeBanner = () => {
  return (
    <div className="relative flex items-center gap-5 rounded-2xl border-1 border-black/80 bg-zinc-900 border border-zinc-800
 p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      
      {/* Floating XP badge */}
      <div className="absolute -top-3 -right-3 flex items-center gap-1 rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
        <Sparkles className="h-4 w-4 text-yellow-400" />
        +10 XP
      </div>

      {/* Illustration */}
      <img
        src="/machine.webp"
        alt="robo"
        width={90}
        height={90}
        className="shrink-0 drop-shadow-md"
      />

      {/* Text */}
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          Welcome back!!
          <Trophy className="h-5 w-5 text-yellow-500" />
        </h2>

        <p className="mt-1 text-sm text-zinc-600"> 
          Ready to level up? {" "} 
          <span className="font-semibold text-black">
            Start a new challenge today.
          </span>
        </p>
      </div>
    </div>
  );
};

export default WelcomeBanner;
