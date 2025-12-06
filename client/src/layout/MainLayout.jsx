import Navbar from "@/components/Navbar";
import React from "react";
import Footer from "@/components/Footer";
import { Outlet } from "react-router-dom";
import ChatBotFloating from "@/components/ChatBotFloating";

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <div>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
