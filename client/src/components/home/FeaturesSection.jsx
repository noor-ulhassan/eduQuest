import React from "react";
import { ThumbsUp, Medal } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="bg-[#171717] w-full py-16 px-4 sm:px-6 flex justify-center">
      {/* 
        Max-width constraint to match the hero content width.
        Grid with 2 columns on large screens, stack on smaller.
      */}
      <div className="max-w-[1200px] w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="bg-[#212121] rounded-2xl p-8 sm:p-10 flex flex-col border border-white/5 shadow-lg">
          {/* Icon Box */}
          <div className="w-12 h-12 rounded-lg bg-[#333333] flex items-center justify-center mb-8 border border-white/5 shadow-inner">
            <ThumbsUp className="w-5 h-5 text-gray-300" />
          </div>

          <h3 className="text-2xl sm:text-[28px] font-mono font-semibold text-white mb-4 tracking-tight">
            Get instant feedback
          </h3>

          <p className="text-[#a3a3a3] text-[15px] sm:text-base leading-[1.6] mb-12 max-w-[90%] font-sans">
            Solve kata with your coding style right in the browser and use test
            cases (TDD) to check it as you progress. Retrain with new, creative,
            and optimized approaches. Find all of the bugs in your programming
            practice.
          </p>

          {/* Placeholder for Image/Code snippet */}
          <div className="mt-auto w-full rounded-lg bg-[#1a1a1a]/50 border border-white/5 min-h-[250px] sm:min-h-[300px] flex items-center justify-center overflow-hidden relative">
            {/* i will enter later */}
            <span className="text-gray-600 font-mono text-sm ">
              <img src="/terminal.avif" alt="terminal" />
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#212121] rounded-2xl p-8 sm:p-10 flex flex-col border border-white/5 shadow-lg">
          {/* Icon Box */}
          <div className="w-12 h-12 rounded-lg bg-[#333333] flex items-center justify-center mb-8 border border-white/5 shadow-inner">
            <Medal className="w-5 h-5 text-gray-300" />
          </div>

          <h3 className="text-2xl sm:text-[28px] font-mono font-semibold text-white mb-4 tracking-tight">
            Earn ranks and honor
          </h3>

          <p className="text-[#a3a3a3] text-[15px] sm:text-base leading-[1.6] mb-8 max-w-[90%] font-sans">
            Kata code challenges are ranked from beginner to expert level. As
            you complete higher-ranked kata, you level up your profile and push
            your software development skills to your highest potential.
          </p>

          {/* Placeholder for Image/Badges graphic */}
          <div className="mt-auto w-full rounded-lg border-white/5 min-h-[200px] sm:min-h-[300px] flex items-center justify-center overflow-hidden relative">
            {/* i will enter later */}
            <span className="text-gray-600 font-mono text-sm ">
              <img src="/h2.jpg" height={900} width={800} alt="honor" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
