import Navbar from "@/layout/Navbar";
import React from "react";
import Footer from "@/layout/Footer";
import { Outlet, useLocation } from "react-router-dom";

const MainLayout = () => {
  const location = useLocation();
  const hideFooter =
    location.pathname.startsWith("/problem/") ||
    location.pathname === "/workspace" ||
    location.pathname.startsWith("/course/");
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
