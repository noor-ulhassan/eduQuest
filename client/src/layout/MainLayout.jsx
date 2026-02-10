import Navbar from "@/layout/Navbar";
import React from "react";
import Footer from "@/layout/Footer";
import { Outlet, useLocation } from "react-router-dom";

const MainLayout = () => {
  const location = useLocation();
  const isPlaygroundRoute =
    location.pathname.startsWith("/playground/") &&
    location.pathname !== "/playground";
  const hideFooter =
    location.pathname.startsWith("/problem/") ||
    location.pathname === "/workspace" ||
    location.pathname.startsWith("/course/") ||
    isPlaygroundRoute;
  return (
    <div>
      {!isPlaygroundRoute && <Navbar />}
      <div>
        <Outlet />
      </div>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
