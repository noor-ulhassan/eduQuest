import React from "react";
import HeroSection from "../../components/home/HeroSection";
import Courses from "../../components/home/Courses";
import LearningSection from "@/components/home/LearningSection";
import PracticeSection from "@/components/home/PracticeSection";
import PortfolioSection from "@/components/home/PortfolioSection";
import CommunitySection from "@/components/home/CommunitySection";
import LowerImage from "@/components/home/Ready";
import CourseCard from "../Workspace/components/CourseCard";
import { useSelector } from "react-redux";
import CourseList from "../Workspace/components/CourseList";

const HomePage = () => {
  const { user } = useSelector((state) => state.auth);
  return (
    <div className="bg-gray-50">
      {user ? (
        <div className="flex flex-col min-h-screen">
          <HeroSection />

          <main className="flex-grow container mx-auto px-4 md:px-8 py-12 bg-[#0b0f1a]">
            <div className="flex flex-col items-center">
              {" "}
              <div className="text-center">
                <h2 className="text-white text-5xl font-jersey tracking-wider mt-5">
                  Your Courses
                </h2>
                <div className="h-1 w-24 bg-yellow-400 mx-auto mt-2 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-6 justify-items-center lg:ml-8">
                <CourseList />
              </div>
            </div>
          </main>

          <LowerImage />
        </div>
      ) : (
        <>
          <HeroSection />
          <div className="bg-[#0b0f1a]">
            <LearningSection />
            <PracticeSection />
            <PortfolioSection />
            <CommunitySection />
            <LowerImage />
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
