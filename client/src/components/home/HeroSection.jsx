import { Button } from "@/components/ui/button";
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const HeroSection = () => {
  const { user } = useSelector((state) => state.auth);
  return (
    <div className="w-full relative h-screen overflow-hidden mt-14 sm:mt-18 pt-12 sm:pt-16">
      <img
        src="gif8.gif"
        alt="hero"
        height={1000}
        width={1000}
        className="w-full h-full object-cover absolute inset-0"
      />
      <div className="absolute w-full flex flex-col items-center mt-16 sm:mt-20 md:mt-24 px-4">
        <h2
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-jersey text-white font-semibold text-center"
          style={{
            textShadow:
              "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
          }}
        >
          Start your
        </h2>
        <h2
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-jersey text-yellow-400 font-semibold text-center"
          style={{
            textShadow:
              "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
          }}
        >
          Learning Adventure
        </h2>
        <h2
          className="mt-3 sm:mt-4 md:mt-5 font-jersey text-lg sm:text-xl md:text-2xl lg:text-3xl text-white text-center px-4"
          style={{
            textShadow:
              "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
          }}
        >
          Beginner friendly courses and projects
        </h2>

        <Link to={user ? "/workspace" : "/login"} className="mt-6 sm:mt-8">
          <Button className="font-jersey text-lg sm:text-xl md:text-2xl lg:text-3xl p-4 sm:p-5 md:p-6" variant={"pixel"}>
            {user ? "Start Learning Free" : "Get Started"}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HeroSection;
