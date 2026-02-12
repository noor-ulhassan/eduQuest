import React from "react";
import { FlipWords } from "@/components/ui/flip-words";
const WelcomeBanner = ({ className }) => {
  const words = ["The Jungle!", "Your Workspace!", "New Beginnings!"];
  return (
    <div
      className={`flex gap-4 items-center p-4 bg-zinc-100 rounded-lg shadow-lg mt-2 hover:cursor-pointer shadow-yellow-200 ${className}`}
    >
      <img src="/pika3.gif" alt="robo" width={100} height={100} />

      <div className="flex flex-col">
        <div className="text-3xl mx-auto font-jersey text-neutral-600 dark:text-neutral-400">
          Welcome To
          <FlipWords words={words} /> <br />
        </div>
        <p className="text-sm text-zinc-700 mt-2">
          Start Your Learning Journey here!
        </p>
      </div>
    </div>
  );
};

export default WelcomeBanner;
