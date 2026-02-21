import Navbar from "@/layout/Navbar";
import React from "react";
import Footer from "@/layout/Footer";
import { Outlet, useLocation } from "react-router-dom";

const MainLayout = () => {
  const location = useLocation();
  const isPlaygroundRoute =
    location.pathname.startsWith("/playground/") &&
    location.pathname !== "/playground";
  const hideNavbar =
    isPlaygroundRoute ||
    location.pathname.startsWith("/competition");
  const hideFooter =
    location.pathname.startsWith("/problem/") ||
    location.pathname === "/workspace" ||
    location.pathname.startsWith("/course/") ||
    isPlaygroundRoute ||
    location.pathname.startsWith("/competition");

  return (
    <div>
      {!hideNavbar && <Navbar />}
      <div>
        <Outlet />
      </div>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
