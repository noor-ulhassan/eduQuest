import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";
import { Outlet, useLocation } from "react-router-dom";

/**
 * MainLayout — root shell shared by all public + protected pages.
 *
 * Layout contract:
 *  - Navbar is fixed at the top (h-14 = 3.5rem).
 *  - <main> has pt-14 so page content always starts below the navbar.
 *    Individual pages must NOT add their own top margin/padding for this offset.
 *  - Footer is hidden on full-screen pages (workspace, problem solver, etc.).
 */
const MainLayout = () => {
  const location = useLocation();

  const isPlaygroundRoute =
    location.pathname.startsWith("/playground/") &&
    location.pathname !== "/playground";

  const hideNavbar =
    isPlaygroundRoute ||
    location.pathname.startsWith("/competition") ||
    location.pathname === "/leaderboard";

  const hideFooter =
    location.pathname.startsWith("/problem/") ||
    location.pathname === "/workspace" ||
    location.pathname.startsWith("/course/") ||
    isPlaygroundRoute ||
    location.pathname.startsWith("/competition") ||
    location.pathname === "/leaderboard";

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbar && <Navbar />}

      {/* pt-14 offsets content by the fixed navbar height (h-14). */}
      <main className={`flex-1 ${!hideNavbar ? "pt-14" : ""}`}>
        <Outlet />
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
