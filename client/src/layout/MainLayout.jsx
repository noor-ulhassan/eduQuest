import Navbar from "@/components/Navbar";
import React from "react";
import { Outlet } from "react-router-dom";
import ChatBotFloating from "@/components/ChatBotFloating";

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <div>
        <Outlet />
      </div>
      <div>
        <ChatBotFloating />
      </div>
    </div>
  );
};

export default MainLayout;
