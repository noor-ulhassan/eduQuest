import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthButtons from "../pages/Auth/AuthButtons";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import { playCompeteClickSound } from "@/lib/sound.js";

const navLinks = [
  { label: "Compete", path: "/competition" },
  { label: "Playground", path: "/playground" },
  { label: "Create & Learn", path: "/workspace" },
  { label: "Documents", path: "/documents" },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
    setCoursesOpen(false);
  }, [location.pathname]);

  const handleLinkClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setCoursesOpen(false);
  };

  return (
    <motion.nav
      initial={false}
      className="h-14 fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-[#171717] border-b border-white/10"
    >
      {/* ── Desktop ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/quest.png" alt="" width={40} height={40} />
          <span className="font-hand font-extrabold text-3xl tracking-tight">
            <span className="text-metallic">Edu</span>
            <span className="text-metallic">Quest</span>
          </span>
        </Link>

        {/* Nav Links */}
        <NavigationMenu>
          <NavigationMenuList className="flex gap-8">
            {/* Dynamic top-level links */}
            {navLinks.map((link) => (
              <NavigationMenuItem
                key={link.path}
                onClick={link.label === "Compete" ? playCompeteClickSound : undefined}
              >
                <NavigationMenuLink asChild>
                  <Link
                    to={link.path}
                    className="text-sm transition-colors text-metallic font-bold hover:text-white"
                  >
                    {link.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3 shrink-0">
          <NavbarAuthButtons />
        </div>
      </div>

      {/* ── Mobile ──────────────────────────────────────────────────────── */}
      <div className="flex md:hidden justify-between items-center px-4 h-full">
        <Link to="/" className="flex items-center gap-2">
          <img src="logo1.png" alt="" width={20} height={20} />
          <span className="font-hand font-bold text-xl">
            <span className="text-red-500">Edu</span>
            <span className="text-white">Quest</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="p-2 rounded-md transition-colors text-white hover:bg-white/10"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[85vw] sm:w-[400px] overflow-y-auto bg-[#131127] border-l border-white/10"
            >
              <SheetHeader className="pb-4 border-b border-white/10">
                <SheetTitle className="text-left">
                  <span className="text-red-500 font-hand text-2xl">Edu</span>
                  <span className="text-white font-hand text-2xl">Quest</span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-1">
                {/* Courses accordion */}
                <div>
                  <button
                    onClick={() => setCoursesOpen(!coursesOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-colors font-medium text-white"
                  >
                    <span>Courses</span>
                    {coursesOpen ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </button>

                  {coursesOpen && (
                    <div className="ml-4 mt-2 mb-2 space-y-1 border-l-2 border-red-500/40 pl-4">
                      {courses.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => handleLinkClick(course.path)}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors block"
                        >
                          <div className="font-medium text-sm text-white">
                            {course.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {course.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dynamic nav links */}
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => {
                      if (link.label === "Compete") playCompeteClickSound();
                      handleLinkClick(link.path);
                    }}
                    className="w-full px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-colors font-medium text-white"
                  >
                    {link.label}
                  </button>
                ))}

                {/* Authenticated-only links */}
                {user && (
                  <div className="pt-2 mt-2 border-t border-white/10">
                    <button
                      onClick={() => handleLinkClick("/profile")}
                      className="w-full px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-colors font-medium text-white"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => handleLinkClick("/my-learning")}
                      className="w-full px-4 py-3 text-left rounded-lg hover:bg-white/10 transition-colors font-medium text-white"
                    >
                      My Learning
                    </button>
                  </div>
                )}
              </div>

              {/* Auth Buttons */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <NavbarAuthButtons />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
};

const NavbarAuthButtons = () => {
  const { user, status } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex gap-3">
        <div className="px-5 py-1.5 rounded border border-white/20 text-gray-500 text-sm">
          Loading…
        </div>
      </div>
    );
  }

  if (user) {
    return <AuthButtons />;
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => navigate("/login")}
        className="px-5 py-1.5 rounded text-sm font-semibold text-white border border-white/30 hover:border-white/60 bg-transparent hover:bg-white/5 transition-all cursor-pointer"
      >
        Log in
      </button>
      <button
        onClick={() => navigate("/signup")}
        className="px-5 py-1.5 rounded text-sm font-semibold text-white border border-red-400 bg-red-600 hover:bg-red-500 transition-all cursor-pointer"
        style={{
          boxShadow: "0 2px 12px rgba(220, 38, 38, 0.3)",
        }}
      >
        Sign Up
      </button>
    </div>
  );
};

export default Navbar;
