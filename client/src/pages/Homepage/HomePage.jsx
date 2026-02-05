import React from "react";
import { useSelector } from "react-redux";
import HeroSection from "../../components/home/HeroSection";
import LearningSection from "../../components/home/LearningSection";
import PracticeSection from "../../components/home/PracticeSection";
import PortfolioSection from "../../components/home/PortfolioSection";
import CommunitySection from "../../components/home/CommunitySection";

import Streak from "../../components/home/streak";
import ExplorePremium from "../../components/home/explorePremium";
import Leaderboard from "../../components/home/leaderboard";
import DraggableCards from "../../components/home/draggableCards";

const HomePage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="bg-white min-h-screen">
      {user ? (
        <div className="flex flex-col">
          {/* FIX: 
            1. Removed asymmetric margins.
            2. Added 'flex justify-center' to the main wrapper.
          */}
          <main className="flex-grow w-full py-16 px-4">
            <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-start justify-center gap-12">
              {/* SIDEBAR: 
                - Uses w-full and max-w to match the component size.
                - lg:sticky keeps it in view while scrolling.
              */}
              <div className="w-full lg:w-auto flex flex-col gap-8 items-center lg:items-end">
                <div className="w-full max-w-[340px] space-y-6">
                  <Streak />
                  <ExplorePremium />
                  <Leaderboard />
                </div>
              </div>

              {/* MAIN CONTENT: 
                - Centered relative to the remaining space.
              */}
              <div className="w-full lg:w-auto flex justify-center lg:justify-start">
                <DraggableCards />
              </div>
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
