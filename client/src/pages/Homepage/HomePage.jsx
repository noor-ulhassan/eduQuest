import React from "react";
import HeroSection from "../../components/home/HeroSection";
import Courses from "../../components/home/Courses";
import LearningSection from "@/components/home/LearningSection";
import PracticeSection from "@/components/home/PracticeSection";
import PortfolioSection from "@/components/home/PortfolioSection";
import CommunitySection from "@/components/home/CommunitySection";
import LowerImage from "@/components/home/Ready";

const HomePage = () => {
  return (
    <div className="bg-gray-50">
      <HeroSection />

      <Courses />

      <div className="bg-[#0b0f1a]">
        <LearningSection />
        <PracticeSection />
        <PortfolioSection />
        <CommunitySection />
        <LowerImage />
      </div>
    </div>
  );
};

export default HomePage;
