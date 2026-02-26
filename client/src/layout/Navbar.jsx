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
      className="h-14 bg-background/95 backdrop-blur-md border-b border-border fixed top-0 left-0 right-0 z-50 shadow-sm"
    >
      {/* ── Desktop ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <span className="font-hand font-bold text-4xl tracking-tight">
            <span className="text-yellow-500">Edu</span>
            <span className="text-gray-800">Quest</span>
          </span>
        </Link>

        {/* Nav Links */}
        <NavigationMenu>
          <NavigationMenuList className="flex gap-8">
            {/* Courses mega-menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="hover:bg-yellow-300 data-[state=open] text-sm">
                Courses
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-background shadow-lg border border-border rounded-lg">
                <ul className="grid md:grid-cols-2 gap-2 sm:w-400px md:w-[500px] lg:w-[500px] p-4 max-h-[90vh] overflow-y-auto">
                  {courses.map((course) => (
                    <Link key={course.id} to={course.path}>
                      <div className="p-2 hover:bg-accent rounded-xl cursor-pointer">
                        <h2 className="font-medium text-foreground">
                          {course.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {course.desc}
                        </p>
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
                    className="text-sm hover:text-yellow-600 transition-colors"
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
          <AuthButtons />
        </div>
      </div>

      {/* ── Mobile ──────────────────────────────────────────────────────── */}
      <div className="flex md:hidden justify-between items-center px-4 h-full">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-hand font-bold text-xl">
            <span className="text-yellow-500">Edu</span>
            <span className="text-gray-800">Quest</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user && <NotificationBell />}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[85vw] sm:w-[400px] overflow-y-auto bg-background"
            >
              <SheetHeader className="pb-4 border-b border-border">
                <SheetTitle className="text-left">
                  <span className="text-yellow-500 font-hand text-2xl">
                    Edu
                  </span>
                  <span className="text-gray-800 font-hand text-2xl">
                    Quest
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-1">
                {/* Courses accordion */}
                <div>
                  <button
                    onClick={() => setCoursesOpen(!coursesOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left rounded-lg hover:bg-yellow-50 transition-colors font-medium text-gray-900"
                  >
                    <span>Courses</span>
                    {coursesOpen ? (
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    )}
                  </button>

                  {coursesOpen && (
                    <div className="ml-4 mt-2 mb-2 space-y-1 border-l-2 border-yellow-400 pl-4">
                      {courses.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => handleLinkClick(course.path)}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-yellow-50 transition-colors block"
                        >
                          <div className="font-medium text-sm text-gray-900">
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
                    className="w-full px-4 py-3 text-left rounded-lg hover:bg-yellow-50 transition-colors font-medium text-gray-900"
                  >
                    {link.label}
                  </button>
                ))}

                {/* Authenticated-only links */}
                {user && (
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <button
                      onClick={() => handleLinkClick("/profile")}
                      className="w-full px-4 py-3 text-left rounded-lg hover:bg-yellow-50 transition-colors font-medium text-gray-900"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => handleLinkClick("/my-learning")}
                      className="w-full px-4 py-3 text-left rounded-lg hover:bg-yellow-50 transition-colors font-medium text-gray-900"
                    >
                      My Learning
                    </button>
                  </div>
                )}
              </div>

              {/* Auth Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <AuthButtons />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
};

// Only render NotificationBell when user is logged in
const NotificationBellConditional = () => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return null;
  return <NotificationBell />;
};

export default Navbar;
