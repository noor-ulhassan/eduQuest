import React from "react";
import LeftSidebar from "./LeftSidebar";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";

const Home = () => {
  return (
    <div className="mt-20 flex justify-between w-[80% ] mx-auto">
      <LeftSidebar />
      <Feed />
      <RightSidebar />
    </div>
  );
};

export default Home;
