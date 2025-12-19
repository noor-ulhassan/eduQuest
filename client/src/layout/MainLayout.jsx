import Navbar from "@/components/Navbar";
import React from "react";
import Footer from "@/components/Footer";
import ChatBotFloating from "@/components/ChatBotFloating";
import { Outlet, useLocation } from "react-router-dom";

const MainLayout = () => {
   const location = useLocation(); 
  const hideFooter = location.pathname.startsWith("/problem/") ||
  location.pathname === "/workspace";
  return (
    <div>
      <Navbar />
      <div>
        <Outlet />
      </div>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
