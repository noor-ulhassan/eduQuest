import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import NotificationBell from "@/components/social/NotificationBell";
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

// ---------------------------------------------------------------------------
// Static data — courses listed in the mega-menu
// ---------------------------------------------------------------------------
const courses = [
  {
    id: 1,
    name: "HTML",
    desc: "Learn the fundamentals of HTML and build the structure of modern web pages.",
    path: "/course/1/detail",
  },
  {
    id: 2,
    name: "CSS",
    desc: "Master CSS to style and design responsive, visually appealing web layouts.",
    path: "/course/2/detail",
  },
  {
    id: 3,
    name: "React",
    desc: "Build dynamic and interactive web applications using the React JavaScript library.",
    path: "/course/3/detail",
  },
  {
    id: 4,
    name: "React Advanced",
    desc: "Deep dive into advanced React concepts including hooks, state management, performance optimization, and architectural patterns.",
    path: "/course/4/detail",
  },
  {
    id: 5,
    name: "Python",
    desc: "Learn Python programming from basics to intermediate level, covering logic building, functions, and real-world applications.",
    path: "/course/5/detail",
  },
  {
    id: 6,
    name: "Python Advanced",
    desc: "Master advanced Python concepts such as OOP, modules, APIs, data processing, and automation.",
    path: "/course/6/detail",
  },
  {
    id: 7,
    name: "Generative AI",
    desc: "Explore prompt engineering, LLMs, embeddings, image generation, and build GenAI-powered applications.",
    path: "/course/7/detail",
  },
  {
    id: 8,
    name: "Machine Learning",
    desc: "Understand ML concepts, algorithms, data preprocessing, model training, evaluation, and deployment.",
    path: "/course/8/detail",
  },
  {
    id: 9,
    name: "JavaScript",
    desc: "Learn core JavaScript concepts, asynchronous programming, DOM manipulation, and modern ES6+ features.",
    path: "/course/9/detail",
  },
];

// ---------------------------------------------------------------------------
// Top-level navigation links (shared between desktop + mobile)
// ---------------------------------------------------------------------------
const navLinks = [
  { label: "Create & Learn", path: "/workspace" },
  { label: "Compete", path: "/competition" },
  { label: "Playground", path: "/playground" },
  { label: "Documents", path: "/documents" },
  { label: "Community", path: "/community" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Transparent dark navbar on homepage when not logged in (Codewars style)
  const isHeroPage = location.pathname === "/" && !user;

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
      className={`h-14 fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isHeroPage
          ? "bg-[#0d0b1a] border-b border-white/10"
          : "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
      }`}
    >
      {/* ── Desktop ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <span className="font-hand font-bold text-4xl tracking-tight">
            <span className={isHeroPage ? "text-red-500" : "text-yellow-500"}>
              Edu
            </span>
            <span className={isHeroPage ? "text-white" : "text-gray-800"}>
              Quest
            </span>
          </span>
        </Link>

        {/* Nav Links */}
        <NavigationMenu>
          <NavigationMenuList className="flex gap-8">
            {/* Courses mega-menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={
                  isHeroPage
                    ? "text-sm text-gray-300 hover:text-white data-[state=open]:text-white bg-transparent hover:bg-white/10"
                    : "hover:bg-yellow-300 data-[state=open] text-sm"
                }
              >
                Courses
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-[#1a1730] shadow-2xl border border-white/10 rounded-lg">
                <ul className="grid md:grid-cols-2 gap-2 sm:w-400px md:w-[500px] lg:w-[500px] p-4 max-h-[90vh] overflow-y-auto">
                  {courses.map((course) => (
                    <Link key={course.id} to={course.path}>
                      <div className="p-2 hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
                        <h2 className="font-medium text-white">
                          {course.name}
                        </h2>
                        <p className="text-sm text-gray-400">{course.desc}</p>
                      </div>
                    </Link>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Dynamic top-level links */}
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.path}>
                <NavigationMenuLink asChild>
                  <Link
                    to={link.path}
                    className={`text-sm transition-colors ${
                      isHeroPage
                        ? "text-gray-300 hover:text-white"
                        : "hover:text-yellow-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Notification Bell + Auth */}
        <div className="flex items-center gap-3 shrink-0">
          <NotificationBellConditional />
          {isHeroPage ? <HeroAuthButtons /> : <AuthButtons />}
        </div>
      </div>

      {/* ── Mobile ──────────────────────────────────────────────────────── */}
      <div className="flex md:hidden justify-between items-center px-4 h-full">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-hand font-bold text-xl">
            <span className={isHeroPage ? "text-red-500" : "text-yellow-500"}>
              Edu
            </span>
            <span className={isHeroPage ? "text-white" : "text-gray-800"}>
              Quest
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user && <NotificationBell />}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className={`p-2 rounded-md transition-colors ${
                  isHeroPage
                    ? "text-white hover:bg-white/10"
                    : "hover:bg-gray-100"
                }`}
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
                    onClick={() => handleLinkClick(link.path)}
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
                <HeroAuthButtons />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
};

// ---------------------------------------------------------------------------
// Codewars-style bordered auth buttons (used on hero page)
// ---------------------------------------------------------------------------
const HeroAuthButtons = () => {
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
        className="px-5 py-1.5 rounded text-sm font-semibold text-white border border-red-500 bg-red-600 hover:bg-red-500 transition-all cursor-pointer"
        style={{
          boxShadow: "0 2px 12px rgba(220, 38, 38, 0.3)",
        }}
      >
        Sign Up
      </button>
    </div>
  );
};

// Only render NotificationBell when user is logged in
const NotificationBellConditional = () => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return null;
  return <NotificationBell />;
};

export default Navbar;
