import { Button } from "@/components/ui/button";
import React from "react";
import downloadGif from "../../assets/download.gif";

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-gray-800 dark:to-gray-900 py-16 px-4 text-center pt-24">
      {/* Added pt-24 to push content below fixed navbar */}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">
          Find the Best Courses For You
        </h1>
        <p className="text-gray-200 dark:text-gray-400 mb-8">
          Learn By Competing
        </p>

        {/* Search Bar + Search Button */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex justify-center items-center max-w-xl mx-auto"
        >
          <input
            type="text"
            placeholder="Search courses..."
            className="flex-grow bg-white border-none focus-visible:ring-2 focus-visible:ring-blue-300 px-6 py-3 text-gray-900 rounded-l-full shadow-lg h-12"
          />
          <Button
            type="submit"
            className="bg-blue-300 dark:bg-blue-700 text-white px-6 rounded-r-full hover:bg-indigo-500 transition h-12"
          >
            Search
          </Button>
        </form>

        {/* Explore Courses Button */}
        <div className="mt-6">
          <Button className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 transition">
            Explore Courses
          </Button>
          <div className="w-full overflow-hidden relative mt-10 ">
            <img
              src={downloadGif}
              alt="Hero section graphic"
              className="w-full h-full object-cover absolute inset-0 "
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
