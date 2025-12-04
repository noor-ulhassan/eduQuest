import { Button } from "@/components/ui/button";
import React from "react";

const HeroSection = () => {
  return (
    <div className="w-full relative h-screen overflow-hidden mt-18 pt-16">
      <img
        src="gif7.gif"
        alt="hero"
        height={1000}
        width={1000}
        className="w-full h-full object-cover absolute inset-0"
      />
      <div className="absolute w-full flex flex-col items-center mt-24">
        <h2
          className="text-7xl font-jersey text-white font-semibold"
          style={{
            textShadow:
              "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
          }}
        >
          Start your
        </h2>
        <h2
          className="text-8xl font-jersey text-yellow-400 font-semibold"
          style={{
            textShadow:
              "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
          }}
        >
          Learning Adventure
        </h2>
        <h2
          className="mt-5 font-jersey text-3xl text-white"
          style={{
            textShadow:
              "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
          }}
        >
          Beginner friendly courses and projects
        </h2>
        <Button className="mt-7 font-jersey text-3xl p-6" variant={"pixel"}>
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;
