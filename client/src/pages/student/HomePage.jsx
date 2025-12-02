import React from "react";
import HeroSection from "./HeroSection";
import Courses from "./Courses";

const HomePage = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Courses Section */}
      <Courses />
    </div>
  );
};

export default HomePage;
