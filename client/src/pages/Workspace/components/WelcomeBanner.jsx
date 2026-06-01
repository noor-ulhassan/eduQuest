import React from "react";
import { FlipWords } from "@/components/ui/flip-words";

const WelcomeBanner = ({ className }) => {
  const words = ["The Jungle!", "Your Workspace!", "New Beginnings!"];
  return (
    <div
      className={`relative flex items-center p-7 bg-[#111111] border border-white/10 rounded-2xl shadow-lg shadow-black/50 overflow-hidden ${className}`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-500/60 rounded-l-2xl" />
      <div className="flex flex-col pl-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400/60 mb-2">
          eduQuest Workspace
        </p>
        <div className="flex items-baseline font-space-grotesk font-bold text-[2rem] leading-tight">
          <span className="text-metallic">Welcome To</span>
          <FlipWords words={words} className="text-metallic" />
        </div>
        <p className="text-[13px] text-zinc-500 mt-2 font-space-grotesk tracking-wide">
          Start your learning journey here.
        </p>
      </div>
    </div>
  );
};

export default WelcomeBanner;
