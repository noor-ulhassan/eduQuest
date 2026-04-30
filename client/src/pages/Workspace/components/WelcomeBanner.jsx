import React from "react";
import { FlipWords } from "@/components/ui/flip-words";
const WelcomeBanner = ({ className }) => {
  const words = ["The Jungle!", "Your Workspace!", "New Beginnings!"];
  return (
    <div
      className={`flex gap-4 items-center p-6 bg-[#111111] border border-white/10 rounded-2xl shadow-lg shadow-black/50 hover:cursor-pointer ${className}`}
    >
      <img
        src="/pika3.gif"
        alt="robo"
        width={100}
        height={100}
        className="shrink-0"
      />

      <div className="flex flex-col">
        <div className="text-3xl font-jersey text-white">
          Welcome To
          <FlipWords words={words} /> <br />
        </div>
        <p className="text-sm text-zinc-400 mt-2">
          Start Your Learning Journey here!
        </p>
      </div>
    </div>
  );
};

export default WelcomeBanner;
