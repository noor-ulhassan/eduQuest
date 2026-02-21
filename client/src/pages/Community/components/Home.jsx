import React from "react";
import LeftSidebar from "./LeftSidebar";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";

const Home = () => {
  return (
    <div className="mt-14 sm:mt-16 md:mt-20 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-4 lg:gap-6">
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <LeftSidebar />
          </div>
          <div className="flex-1 min-w-0">
            <Feed />
          </div>
          <div className="hidden xl:block xl:w-80 flex-shrink-0">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
