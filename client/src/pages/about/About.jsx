
import React from "react";
import AboutFooter from "./AboutFooter.jsx";

const AboutPage = () => {
  return (
    <div className="bg-[#0b0f1a] text-white overflow-hidden">
        <section className="relative text-center space-y-6 mt-20 px-4">

         <h1 className="text-4xl md:text-6xl font-jersey tracking-tight leading-tight mb-8">
             Welcome to <span className="text-yellow-400">EduQuest</span>
          </h1>

          <p className="text-gray-300 max-w-2xl mx-auto">
           A learning platform where progress feels like gameplay,
             complete quests, earn XP, and level up your skills.
          </p>
       </section>
      {/* hero section */}
      <section className="relative z-0 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* left side */}
          <div className="relative">
            <div className="rounded-xl overflow-hidden shadow-2xl bg-[#0f172a]">
              <div className="bg-[#e9f8c6] p-3 flex gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="w-3 h-3 rounded-full bg-gray-400" />
              </div>
              <img
                src="/Mario.gif"
                alt="Pixel-style learning game interface"
                className="w-full min-h-[320px] object-cover bg-[#bbf770]"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <img
              src="/creatures.gif"
              alt="Pixel character floating"
              className="
                absolute -bottom-16 -right-6
                w-40 md:w-56 lg:w-64
                pointer-events-none
                animate-[float_4s_ease-in-out_infinite]
              "
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {/* right side */}
          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-jersey tracking-tight leading-tight mb-8">
              Learn like you're playing a game
            </h2>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl mb-6">
              EduQuest turns learning into an interactive pixel adventure.
              Build, retry, and level up, just like in a retro game.
            </p>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl">
              Complete challenges, earn XP, and watch your skills grow visually.
              Learning shouldn’t feel boring, it should feel rewarding.
            </p>
          </div>
        </div>
      </section>

      {/* mission section */}
      <section className="relative z-0 py-24 px-6 md:px-12 bg-[#0a0f1a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* left side */}
          <div className="relative lg:pr-10">
            <h2 className="text-4xl md:text-5xl font-jersey tracking-tight leading-tight mb-6">
              Mission & How EduQuest Works
            </h2>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-4">
              Our mission is to make learning fun and rewarding. Every module is
              a mini-quest with immediate feedback.
            </p>
            <ul className="text-gray-400 list-disc list-inside space-y-2">
              <li>XP-based progression system</li>
              <li>Level-ups and achievements</li>
              <li>Interactive coding challenges</li>
              <li>Mini-games embedded directly</li>
            </ul>
          </div>

          {/* right side */}
          <div className="relative">
            <div className="rounded-xl overflow-hidden shadow-2xl bg-[#1a1a2e]">
              <div className="bg-[#e9f8c6] p-3 flex gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="w-3 h-3 rounded-full bg-gray-400" />
              </div>
              <img
                src="/coin.gif"
                alt="Pixel-style mission game preview"
                className="w-full min-h-[300px] object-cover bg-[#bbf770]"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <img
              src="/rocket.gif"
              alt="Pixel character floating"
              className="absolute -bottom-12 -right-6 w-36 md:w-52 lg:w-64 pointer-events-none animate-[float_4s_ease-in-out_infinite]"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </div>
      </section>

     {/* dev team section */}
<section className="relative z-0 py-24 px-6 md:px-12 bg-[#0b0f1a]">
  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

    {/* LEFT SIDE */}
    <div className="relative">
      <h2 className="text-4xl md:text-5xl font-jersey tracking-wide mb-6 text-[#f8f8f2]">
        Meet the Dev Team
      </h2>

      <p className="text-[#b8b8c8] text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
        A pixel-powered squad of specialists. Each dev plays a role to keep
        EduQuest fast, fun, and battle-ready.
      </p>

      {/* Pixel avatars */}
      <div className="flex gap-6">
        {[
          { src: "/avatar1.jfif", role: "i dont know" },
          { src: "/avatar2.jfif", role: "i dont know" },
          { src: "/avatar3.jfif", role: "i donut know" },
        ].map((dev, i) => (
          <div
            key={i}
            className="bg-[#1a1a2e] border-4 border-[#3a3a5e] p-3 text-center 
                       shadow-[6px_6px_0_#000] animate-[float_3s_ease-in-out_infinite]"
          >
            <img
              src={dev.src}
              alt={dev.role}
              className="w-24 md:w-28 mx-auto mb-2"
              style={{ imageRendering: "pixelated" }}
            />
            <span className="text-sm text-[#ffd86b] font-jersey tracking-wide">
              {dev.role}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* RIGHT SIDE */}
    <div className="relative">
      <div
        className="bg-[#1a1a2e] border-2 rounded-2xl border-[#ffd86b] p-8 text-center
                   shadow-[8px_8px_0_#000]"
      >
        <img
          src="/chest.gif"
          alt="Reward Chest"
          className="w-28 mx-auto mb-6 animate-[float_4s_ease-in-out_infinite]"
          style={{ imageRendering: "pixelated" }}
        />

        <h3 className="text-[#ffd86b] font-jersey text-3xl mb-4 tracking-wide">
          Our Philosophy
        </h3>

        <p className="text-[#b8b8c8] text-lg leading-relaxed max-w-md mx-auto">
          Learning should feel like progress. Every quest grants XP, instant
          feedback, and visible growth, no grind, just momentum.
        </p>
      </div>
    </div>

  </div>
</section>

      <AboutFooter />
    </div>
  );
};

export default AboutPage;
