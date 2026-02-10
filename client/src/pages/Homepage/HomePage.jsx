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
          <main className="flex-grow w-full py-16 px-4">
            <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-start justify-center gap-12">
              <audio ref={audioRef} src="/ui2.mp3"></audio>

              <div className="w-full lg:w-auto flex flex-col gap-8 items-center lg:items-end">
                <div className="w-full max-w-[340px] space-y-8 mt-16">
                  <UserStats />
                  <Streak />
                </div>
              </div>

              <div className="w-full lg:w-auto flex justify-center lg:justify-start">
                <DraggableCards />
              </div>
            </div>
            <div className="ml-32 flex ">
              <h1 className="font-hand font-bold text-4xl ">
                <Highlighter action="underline" color="orange">
                  EduQuest{" "}
                  <Highlighter action="highlight" color="skyblue">
                    Community
                  </Highlighter>{" "}
                </Highlighter>
              </h1>
              <div></div>
            </div>

            <div className="max-w-[1200px] mx-auto mt-10 mb-20 px-4">
              <Leaderboard />
              <div className="mt-16 ml-28">
                <h1 className="font-hand font-bold text-4xl">
                  <Highlighter action="underline" color="orange">
                    Community{" "}
                    <Highlighter action="highlight" color="skyblue">
                      Posts
                    </Highlighter>{" "}
                  </Highlighter>
                </h1>
              </div>
              <TopCommunityPosts />
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
