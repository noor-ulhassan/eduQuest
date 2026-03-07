import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";
import { Outlet, useLocation } from "react-router-dom";
import PlatformGuide from "@/components/ui/PlatformGuide";

const MainLayout = () => {
  const location = useLocation();

  const isPlaygroundRoute =
    location.pathname.startsWith("/playground/") &&
    location.pathname !== "/playground";

  const hideNavbar =
    isPlaygroundRoute ||
    location.pathname.startsWith("/competition") ||
    location.pathname.startsWith("/course/") ||
    location.pathname === "/leaderboard" ||
    location.pathname === "/login" ||
    location.pathname === "/signup";
  const hideFooter =
    location.pathname.startsWith("/problem/") ||
    location.pathname === "/workspace" ||
    location.pathname.startsWith("/course/") ||
    isPlaygroundRoute ||
    location.pathname.startsWith("/competition") ||
    location.pathname === "/leaderboard" ||
    location.pathname === "/login" ||
    location.pathname === "/signup";

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbar && <Navbar />}

      {/* pt-14 offsets content by the fixed navbar height (h-14). */}
      <main className={`flex-1 ${!hideNavbar ? "pt-14" : ""}`}>
        <Outlet />
      </main>

      {!hideFooter && <PlatformGuide />}
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
