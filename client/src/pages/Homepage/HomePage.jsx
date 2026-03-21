import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import HeroSection from "../../components/home/HeroSection";
import FeaturesSection from "../../components/home/FeaturesSection";
import UserStats from "@/components/user/UserStatus";

import Streak from "../../components/home/streak";
import ExplorePremium from "../../components/home/explorePremium";
import TopCommunityPosts from "../../components/social/TopCommunityPosts";
import DraggableCards from "../../components/home/draggableCards";
import ExploreMore from "@/components/user/ExploreMore";
import { Highlighter } from "@/components/ui/highlighter";
import LiveCompetitions from "../../components/home/LiveCompetitions";
import CompetitionStats from "../../components/home/CompetitionStats";

const HomePage = () => {
  const { user } = useSelector((state) => state.auth);

  const audioRef = useRef(null);

  useEffect(() => {
    if (user && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.log("Autoplay blocked until user interaction:", error);
      });
    }
  }, [user]);

  return (
    <div className="bg-white min-h-screen">
      {user ? (
        <div className="flex flex-col">
          <main className="flex-grow w-full pb-6 sm:pb-10 md:pb-14 px-4 sm:px-6">
            <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-12">
              <audio ref={audioRef} src="/ui2.mp3"></audio>

              <div className="w-full lg:w-auto flex flex-col gap-6 sm:gap-8 items-center lg:items-end lg:mt-8">
                <div className="w-full max-w-[340px] space-y-6 sm:space-y-8 mt-6 sm:mt-6">
                  <UserStats />
                  <Streak />
                </div>
              </div>

              <div className="w-full lg:w-auto flex justify-center lg:justify-start">
                <DraggableCards />
              </div>
            </div>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-8 sm:mt-12 lg:mt-16">
              <h1 className="font-hand font-bold text-2xl sm:text-3xl md:text-4xl">
                <Highlighter action="underline" color="orange">
                  EduQuest{" "}
                  <Highlighter action="highlight" color="skyblue">
                    Community
                  </Highlighter>{" "}
                </Highlighter>
              </h1>
            </div>

            <div className="max-w-[1200px] mx-auto mt-8 sm:mt-12 lg:mt-16 mb-12 sm:mb-16 lg:mb-20 px-4 sm:px-6 space-y-12 sm:space-y-16">
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
                  onClick={() => (window.location.href = "/leaderboard")}
                  className="bg-[#3F48EF] hover:bg-[#343cc4] text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-[#3F48EF]/25 flex items-center gap-2"
                >
                  View Global Leaderboard
                </button>
              </div>
              <CompetitionStats />
              <LiveCompetitions />

              <section>
                <div className="mb-6 sm:mb-8">
                  <Highlighter action="underline" color="orange">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-hand">
                      Community{" "}
                      <Highlighter action="highlight" color="skyblue">
                        Posts
                      </Highlighter>{" "}
                    </h1>
                  </Highlighter>
                  <p className="text-gray-500 mt-2 text-sm sm:text-base">
                    See what others are sharing
                  </p>
                </div>
                <TopCommunityPosts />
              </section>
            </div>
          </main>
        </div>
      ) : (
        <>
          <HeroSection />
          <div className="bg-[#171717]">
            <FeaturesSection />
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
