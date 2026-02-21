import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import HeroSection from "../../components/home/HeroSection";
import LearningSection from "../../components/home/LearningSection";
import PracticeSection from "../../components/home/PracticeSection";
import PortfolioSection from "../../components/home/PortfolioSection";
import CommunitySection from "../../components/home/CommunitySection";
import MascotTweet from "@/components/home/MascottTweet";
import UserStats from "@/components/user/UserStatus";

import Streak from "../../components/home/streak";
import ExplorePremium from "../../components/home/explorePremium";
import Leaderboard from "../../components/home/leaderboard";
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
          <MascotTweet />
          <main className="flex-grow w-full py-8 sm:py-12 md:py-16 px-4 sm:px-6">
            <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-12">
              <audio ref={audioRef} src="/ui2.mp3"></audio>

              <div className="w-full lg:w-auto flex flex-col gap-6 sm:gap-8 items-center lg:items-end">
                <div className="w-full max-w-[340px] space-y-6 sm:space-y-8 mt-8 sm:mt-12 lg:mt-16">
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
              <Leaderboard />
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
          <div className="bg-[#0b0f1a]">
            <LearningSection />
            <PracticeSection />
            <PortfolioSection />
            <CommunitySection />
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
