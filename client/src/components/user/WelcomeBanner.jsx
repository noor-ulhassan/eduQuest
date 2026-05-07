import { Zap, Trophy, Target } from "lucide-react";

const WelcomeBanner = () => {
  return (
    <div
      className="relative flex items-center gap-5 rounded-2xl 
      bg-[#111111] border border-white/10 p-6 shadow-lg shadow-black/50"
    >
      <div
        className="absolute -top-3 -right-3 flex items-center gap-1.5 
        rounded-full border border-white/10 bg-[#1a1a1a] px-3 py-1 
        text-xs font-bold text-zinc-300"
      >
        <Zap className="h-4 w-4 text-emerald-500" />
        +10 XP
      </div>

      <div
        className="flex items-center justify-center w-14 h-14 
      bg-red-600/20 rounded-xl shrink-0 border border-red-500/20"
      >
        <Target className="w-8 h-8 text-red-400" />
      </div>

      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
          Welcome back!!
          <Trophy className="h-5 w-5 text-yellow-500" />
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Ready to level up?{" "}
          <span className="font-semibold text-white">
            Start a new challenge today.
          </span>
        </p>
      </div>
    </div>
  );
};

export default WelcomeBanner;
