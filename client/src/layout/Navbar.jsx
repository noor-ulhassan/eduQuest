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

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Close mobile menu when route changes (e.g. AuthButtons, any link)
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
    <motion.div className="h-14 bg-background/95 dark:bg-background/95 backdrop-blur-md border-b border-border fixed top-0 left-0 right-0 duration-300 z-50 shadow-sm">
      {/* Desktop */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 font-hand font-bold text-xl">
          <Link to="/home" className="flex items-center gap-3">
            <h1 className="hidden md:block text-4xl tracking-tight">
              <span className="text-yellow-500">Edu</span>
              <span className="dark:text-white text-gray-800">Quest</span>
            </h1>
          </Link>
        </div>

        {/* Nav Links */}
        <div>
          <NavigationMenu>
            <NavigationMenuList className="flex gap-8">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="hover:bg-yellow-300 data-[state=open] text-sm">
                  Courses
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background shadow-lg border border-border rounded-lg">
                  <ul className="grid md:grid-cols-2 gap-2 sm:w-400px md:w-[500px] lg:w-[500px] p-4 max-h-[90vh] overflow-y-auto">
                    {courses.map((course, index) => (
                      <Link key={index} to={course.path}>
                        <div className="p-2 hover:bg-accent rounded-xl cursor-pointer">
                          <h2 className="font-medium text-foreground">{course.name}</h2>
                          <p className="text-sm text-muted-foreground">{course.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink className="hover:text-yellow-600 text-sm">
                  <Link to={"/workspace"}>Create & Learn</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="hover:text-yellow-600 text-sm">
                  <Link to={"/competition"}>Compete</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="hover:text-yellow-600 text-sm">
                  <Link to={"/playground"}>Playground</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="hover:text-yellow-600 text-sm">
                  <Link to={"/documents"}>Documents</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink className="hover:text-yellow-600 text-sm">
                  <Link to={"/community"}>Community</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Notification Bell + Auth Buttons */}
        <div className="flex items-center gap-3">
          <NotificationBellConditional />
          <AuthButtons />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden justify-between items-center px-4 h-full">
        <Link to="/" className="flex items-center gap-2">
          <h1 className="font-bold text-xl">
            <span className="text-yellow-500 font-hand text-xl">Edu</span>
            <span className="dark:text-white text-gray-800 font-hand text-xl">
              Quest
            </span>
          </h1>
        </Link>

        <div className="flex items-center gap-3">
          {user && <NotificationBell />}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] overflow-y-auto bg-background">
              <SheetHeader className="pb-4 border-b border-border">
                <SheetTitle className="text-left">
                  <span className="text-yellow-500 font-hand text-2xl">Edu</span>
                  <span className="dark:text-white text-gray-800 font-hand text-2xl">
                    Quest
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-1">
                {/* Courses Dropdown */}
                <div>
                  <button
                    onClick={() => setCoursesOpen(!coursesOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left rounded-lg hover:bg-yellow-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-900 dark:text-white"
                  >
                    <span>Courses</span>
                    {coursesOpen ? (
                      <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                  {coursesOpen && (
                    <div className="ml-4 mt-2 mb-2 space-y-1 border-l-2 border-yellow-400 dark:border-yellow-600 pl-4">
                      {courses.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => handleLinkClick(course.path)}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-yellow-50 dark:hover:bg-gray-800 transition-colors block"
                        >
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            {course.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                            {course.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Other Navigation Links */}
                <button
                  onClick={() => handleLinkClick("/workspace")}
                  className="w-full px-4 py-3 text-left rounded-lg hover:bg-yellow-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-900 dark:text-white"
                >
                  Create & Learn
                </button>

                <button
                  onClick={() => handleLinkClick("/competition")}
                  className="w-full px-4 py-3 text-left rounded-lg hover:bg-yellow-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-900 dark:text-white"
                >
                  Compete
                </button>

                <button
                  onClick={() => handleLinkClick("/playground")}
                  className="w-full px-4 py-3 text-left rounded-lg hover:bg-yellow-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-900 dark:text-white"
                >
                  Playground
                </button>

                <button
                  onClick={() => handleLinkClick("/documents")}
                  className="w-full px-4 py-3 text-left rounded-lg hover:bg-yellow-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-900 dark:text-white"
                >
                  Documents
                </button>

                <button
                  onClick={() => handleLinkClick("/community")}
                  className="w-full px-4 py-3 text-left rounded-lg hover:bg-yellow-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-900 dark:text-white"
                >
                  Community
                </button>

                {user && (
                  <>
                    <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-800">
                      <button
                        onClick={() => handleLinkClick("/profile")}
                        className="w-full px-4 py-3 text-left rounded-lg hover:bg-yellow-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-900 dark:text-white"
                      >
                        Profile
                      </button>

                      <button
                        onClick={() => handleLinkClick("/my-learning")}
                        className="w-full px-4 py-3 text-left rounded-lg hover:bg-yellow-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-900 dark:text-white"
                      >
                        My Learning
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Auth Buttons for Mobile */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <AuthButtons />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.div>
  );
};

// Only render NotificationBell when user is logged in
const NotificationBellConditional = () => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return null;
  return <NotificationBell />;
};

export default Navbar;
