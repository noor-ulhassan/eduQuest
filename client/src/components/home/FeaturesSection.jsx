import React from "react";
import { Link } from "react-router-dom";
import { ThumbsUp, Medal, Swords } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="bg-[#171717] w-full pb-20 px-4 sm:px-6">
      {/* Section header */}
      <div className="max-w-[1200px] mx-auto pt-16 pb-10 text-center">
        <p className="text-orange-500 text-sm font-bold uppercase tracking-widest mb-3">
          What you get
        </p>
        <h2 className="text-metallic text-3xl sm:text-4xl font-bold tracking-tight">
          Code. Rank. Compete.
        </h2>
      </div>

      {/* Feature Cards */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 — Instant Feedback */}
        <div className="bg-[#212121] rounded-2xl p-8 flex flex-col border border-white/5 shadow-lg">
          <div className="w-12 h-12 rounded-lg bg-[#333333] flex items-center justify-center mb-8 border border-white/5">
            <ThumbsUp className="w-5 h-5 text-gray-300" />
          </div>
          <h3 className="text-2xl font-mono font-semibold text-metallic mb-4 tracking-tight">
            Instant feedback
          </h3>
          <p className="text-[#a3a3a3] text-[15px] leading-[1.6] mb-10 font-sans">
            Write code in the browser, run it against real test cases, and see
            exactly what breaks. Fix it, resubmit, done.
          </p>
          <div className="mt-auto w-full rounded-xl bg-[#1a1a1a] border border-white/5 min-h-[220px] sm:min-h-[260px] overflow-hidden flex items-center justify-center">
            <img
              src="/terminal.avif"
              alt="Code editor preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Card 2 — Rank Up */}
        <div className="bg-[#212121] rounded-2xl p-8 flex flex-col border border-white/5 shadow-lg">
          <div className="w-12 h-12 rounded-lg bg-[#333333] flex items-center justify-center mb-8 border border-white/5">
            <Medal className="w-5 h-5 text-gray-300" />
          </div>
          <h3 className="text-2xl font-mono font-semibold text-metallic mb-4 tracking-tight">
            Rank up. Stand out.
          </h3>
          <p className="text-[#a3a3a3] text-[15px] leading-[1.6] mb-10 font-sans">
            Challenges are ranked from beginner to expert. Finish harder ones,
            move up the ladder. Bronze, Silver, Gold, Grandmaster.
          </p>
          <div className="mt-auto w-full rounded-xl border border-white/5 min-h-[220px] sm:min-h-[260px] overflow-hidden flex items-center justify-center">
            <img
              src="/h2.jpg"
              alt="Rank badges"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Card 3 — Compete */}
        <div className="bg-[#212121] rounded-2xl p-8 flex flex-col border border-white/5 shadow-lg md:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-lg bg-[#333333] flex items-center justify-center mb-8 border border-white/5">
            <Swords className="w-5 h-5 text-gray-300" />
          </div>
          <h3 className="text-2xl font-mono font-semibold text-metallic mb-4 tracking-tight">
            Compete. Dominate.
          </h3>
          <p className="text-[#a3a3a3] text-[15px] leading-[1.6] mb-10 font-sans">
            Match against another developer, same problem, same clock. First one
            to pass all tests wins. Simple.
          </p>
          {/* Live match preview */}
          <div className="mt-auto w-full rounded-xl bg-[#1a1a1a] border border-white/10 p-5 min-h-[220px] sm:min-h-[260px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  Live Match
                </span>
                <span className="text-metallic font-mono font-bold text-sm bg-white/10 px-3 py-1 rounded-full">
                  03:42
                </span>
              </div>
              <p className="text-zinc-500 text-xs font-mono mb-5 truncate">
                Challenge: Two Sum — Arrays
              </p>
              <div className="space-y-3">
                {[
                  { name: "You", progress: 75, color: "bg-orange-500" },
                  { name: "Opponent", progress: 45, color: "bg-blue-500" },
                ].map((p) => (
                  <div key={p.name}>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                      <span>{p.name}</span>
                      <span className="font-mono">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div
                        className={`${p.color} h-2 rounded-full`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <span className="text-lg">🏆</span>
              <span>You&apos;re ahead — close it out.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
    </section>
  );
};

export default FeaturesSection;
