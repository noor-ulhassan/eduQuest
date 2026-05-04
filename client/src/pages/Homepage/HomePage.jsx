import React, { useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useScroll, useTransform } from "framer-motion";
import HeroSection from "../../components/home/HeroSection";
import FeaturesSection from "../../components/home/FeaturesSection";
import UserStats from "@/components/user/UserStatus";
import Streak from "../../components/home/streak";
import DraggableCards from "../../components/home/draggableCards";
import CompetitionStats from "@/components/home/CompetitionStats";
import DailyQuests from "@/components/home/DailyQuests";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const QUOTES = [
  {
    quote: "No cap, consistency hits different fr. Show up daily or stay mid.",
    name: "The Daily Grind",
    title: "Mindset",
  },
  {
    quote: "Main character energy means solving what others choose to skip.",
    name: "EduQuest Dev",
    title: "Challenge Accepted",
  },
  {
    quote: "Skill issue? Touch grass. Then come back and touch code.",
    name: "Reality Check",
    title: "Debugging Life",
  },
  {
    quote:
      "Built different means literally built through 1000 problems, no shortcuts.",
    name: "Hustle Mode",
    title: "XP Farm",
  },
  {
    quote:
      "The algorithm doesn't care about your excuses, bestie. It only sees results.",
    name: "Code Truth",
    title: "Brutal Honesty",
  },
  {
    quote:
      "Slay the bug, not the vibe. Your code should go full send every time.",
    name: "Debug Mode",
    title: "Dev Life",
  },
  {
    quote:
      "Lowkey grinding > loudly quitting. Let the leaderboard do the talking.",
    name: "Silent Achiever",
    title: "The Long Game",
  },
  {
    quote: "Your future self is literally waiting for you to start rn. No cap.",
    name: "Time Capsule",
    title: "Future You",
  },
  {
    quote: "We don't gatekeep knowledge here — we gatekeep mediocrity. Period.",
    name: "EduQuest",
    title: "Community Code",
  },
  {
    quote: "Being mid is temporary, skill is forever. Just keep shipping fr.",
    name: "Growth Arc",
    title: "Dev Wisdom",
  },
];

const HomePage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const greeting = useMemo(getGreeting, []);
  const firstName = user?.name?.split(" ")[0] || "there";

  const geminiRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: geminiRef,
    offset: ["start start", "end start"],
  });
  const pathLengths = [
    useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]),
    useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]),
    useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]),
    useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]),
    useTransform(scrollYProgress, [0, 0.8], [0, 1.2]),
  ];

  return (
    <div className={`min-h-screen ${user ? "dark bg-[#0f0f0f]" : "bg-white"}`}>
      {user ? (
        <main className="relative flex-grow w-full pb-12 sm:pb-16 overflow-hidden">
          {/* Aceternity animated dot-glow background */}
          <DottedGlowBackground
            color="rgba(255,255,255,0.45)"
            glowColor="rgba(63,72,239,0.95)"
            gap={28}
            radius={1.5}
            opacity={0.55}
            speedMin={0.3}
            speedMax={0.9}
            speedScale={0.85}
          />
          {/* Radial glow — top-centre */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(63,72,239,0.14) 0%, transparent 70%)",
            }}
          />
          {/* Greeting */}
          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-4 pb-1">
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-metallic
             mb-5 ml-32"
            >
              {greeting},{" "}
              <span className="text-metallic-orange font-extrabold">
                {firstName}
              </span>
            </h1>
          </div>

          {/* Stats + Cards */}
          <div className="relative z-10 max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12 px-4 sm:px-6 mt-3">
            <div className="w-full lg:w-auto flex flex-col gap-6 items-center lg:items-end">
              <div className="w-full max-w-[340px] space-y-4">
                <UserStats />
                <Streak />
              </div>
            </div>

            <div className="w-full lg:w-auto flex justify-center lg:justify-start overflow-x-hidden">
              <DraggableCards />
            </div>
          </div>

          {/* Daily & Weekly Quests */}
          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 mt-8">
            <DailyQuests />
          </div>

          {/* Competition Stats */}
          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 mt-10 sm:mt-14 dark:text-zinc-100">
            <CompetitionStats />
          </div>

          {/* Hall of Fame */}
          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 mt-10 sm:mt-12 mb-4">
            <div className="bg-gradient-to-br from-[#0d0b1a] to-[#1a1730] rounded-3xl p-8 sm:p-12 border border-[#2d2755] flex flex-col items-center justify-center text-center shadow-2xl">
              <div className="w-16 h-16 bg-[#3F48EF]/20 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-[#3F48EF]/10">
                <span className="text-[#3F48EF] font-bold text-2xl tracking-widest">
                  EQ
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                EduQuest Hall of Fame
              </h2>
              <p className="text-zinc-400 mb-8 max-w-lg text-sm sm:text-base">
                Ready to see where you stand? Compete with learners worldwide,
                earn XP, and climb the ranks to become a Grandmaster.
              </p>
              <button
                onClick={() => navigate("/leaderboard")}
                className="bg-[#3F48EF] hover:bg-[#343cc4] text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-[#3F48EF]/25 flex items-center gap-2 active:scale-95"
              >
                View Global Leaderboard
              </button>
            </div>
          </div>
        </main>
      ) : (
        <>
          <HeroSection />

          {/* MacBook Scroll — product showcase */}
          <div className="bg-[#171717] overflow-hidden">
            <MacbookScroll
              title={
                <span className="text-white font-inter font-bold text-3xl md:text-4xl leading-snug">
                  Code. Test. Submit.{" "}
                  <span className="text-orange-400">All in the browser.</span>
                </span>
              }
              src="/terminal.avif"
              showGradient={false}
            />
          </div>

          {/* Google Gemini Effect — scroll-driven path animation */}
          <div
            ref={geminiRef}
            className="h-[400vh] bg-[#171717] relative overflow-clip"
          >
            <GoogleGeminiEffect
              pathLengths={pathLengths}
              className=""
              titleClassName="font-inter text-metallic text-xl md:text-6xl"
              descriptionClassName="font-inter text-metallic text-sm md:text-2xl"
              title="Stop Watching. Start Building."
              description="EduQuest turns passive study into active mastery. Escape the 10-hour tutorial trap and build real-world skills through an immersive, interactive coding environment. Compete on global leaderboards, get live feedback, and prove your expertise."
              buttonText="Start for Free →"
              onButtonClick={() => navigate("/signup")}
            />
          </div>

          {/* Features */}
          <div className="bg-[#171717]">
            <FeaturesSection />
          </div>
          {/* Infinite Moving Cards — Gen-Z motivational quotes */}
          <div className="dark bg-[#0f0f0f] py-14 overflow-hidden">
            <p className="text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-8">
              What the grind sounds like
            </p>
            <InfiniteMovingCards items={QUOTES} direction="left" speed="slow" />
          </div>

          {/* Sticky Scroll Reveal — deep feature showcase */}
          <div className="bg-[#0f0f0f] py-20 px-4 sm:px-8">
            <div className="max-w-5xl mx-auto mb-12 text-center">
              <p className="text-[10px] font-inter font-bold uppercase tracking-widest text-metallic-orange mb-3">How It Works</p>
              <h2 className="text-3xl sm:text-4xl font-inter font-bold text-metallic leading-tight">
                From zero to leaderboard.<br />
                <span className="text-metallic-orange">One problem at a time.</span>
              </h2>
            </div>
            <div className="max-w-5xl mx-auto">
              <StickyScroll
                content={[
                  {
                    title: "Pick your weapon.",
                    description: "Choose from 9 languages — Python, JavaScript, Java, C, C++, TypeScript, React, HTML, CSS. Every environment is pre-configured. No setup. No npm install. Just code.",
                    badge: "Step 01 — Environment",
                    content: (
                      <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
                        {["Python","JavaScript","Java","C++","TypeScript","React"].map((lang, i) => (
                          <div key={lang} className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-white/5 border border-white/8">
                            <span className="font-inter text-sm font-semibold text-metallic">{lang}</span>
                            <span className="text-[10px] font-inter text-metallic-orange uppercase tracking-widest">{i < 3 ? "Available" : "+ More"}</span>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                  {
                    title: "Solve. Not watch.",
                    description: "Real challenges. Real test cases. The editor runs your code against hidden inputs and tells you exactly what failed. Fix it. Resubmit. Repeat. That's how you actually improve.",
                    badge: "Step 02 — Practice",
                    content: (
                      <div className="flex flex-col justify-center h-full p-6 gap-4">
                        <div className="bg-black/40 rounded-lg p-4 font-mono text-xs text-green-400 border border-green-500/20">
                          <p className="text-zinc-500 mb-1">{"// Your solution"}</p>
                          <p>{"def two_sum(nums, target):"}</p>
                          <p className="pl-4">{"seen = {}"}</p>
                          <p className="pl-4">{"for i, n in enumerate(nums):"}</p>
                          <p className="pl-8 text-orange-400">{"..."}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-inter">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          <span className="text-green-400 font-semibold">3/3 test cases passed</span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Rank up. Stand out.",
                    description: "Every solved challenge earns XP. XP builds rank. Rank unlocks harder problems. The ladder goes: Bronze → Silver → Gold → Grandmaster. Each tier is a proof of skill, not time spent.",
                    badge: "Step 03 — Rank",
                    content: (
                      <div className="flex flex-col justify-center h-full p-6 gap-4">
                        {[["Grandmaster","#f97316","95%"],["Gold","#eab308","72%"],["Silver","#94a3b8","48%"],["Bronze","#b45309","25%"]].map(([tier, color, w]) => (
                          <div key={tier}>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs font-inter font-bold" style={{ color }}>{tier}</span>
                              <span className="text-xs font-inter text-zinc-500">{w}</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full" style={{ width: w, background: color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                  {
                    title: "Compete. Dominate.",
                    description: "Enter a live room with a code and face another developer head-to-head. Same problem, same timer. First to pass all test cases wins. Voice chat included. No excuses.",
                    badge: "Step 04 — Compete",
                    content: (
                      <div className="flex flex-col justify-center h-full p-6 gap-5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-inter text-zinc-400">Live Match</span>
                          <span className="flex items-center gap-1.5 text-xs font-inter font-bold text-orange-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                            04:12
                          </span>
                        </div>
                        {[["You",75,"bg-orange-500"],["Opponent",43,"bg-blue-500"]].map(([name, pct, cls]) => (
                          <div key={name}>
                            <div className="flex justify-between text-xs font-inter mb-1">
                              <span className="text-metallic">{name}</span>
                              <span className="text-zinc-500">{pct}%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2">
                              <div className={`${cls} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        ))}
                        <p className="text-[10px] font-inter text-metallic-orange uppercase tracking-widest">You&apos;re ahead — close it out.</p>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
