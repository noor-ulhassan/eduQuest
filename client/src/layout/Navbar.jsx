import React from "react";
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
import { Link } from "react-router-dom";
import AuthButtons from "../pages/Auth/AuthButtons";

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
  return (
    <motion.div className="h-14 dark:bg-black bg-white backdrop-blur-md border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10 shadow-sm">
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
                <NavigationMenuContent className="bg-white dark:bg-black shadow-lg border border-gray-200 dark:border-gray-800 rounded-lg">
                  <ul className="grid md:grid-cols-2 gap-2 sm:w-400px md:w-[500px] lg:w-[500px] p-4 max-h-[90vh] overflow-y-auto">
                    {courses.map((course, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer"
                      >
                        <h2 className="font-medium">{course.name}</h2>
                        <p className="text-sm text-gray-600">{course.desc}</p>
                      </div>
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
                  <Link to={"/playground"}>Playground</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink className="hover:text-yellow-600 text-sm">
                  <Link to={"/community"}>Community</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink className="hover:text-yellow-600 text-sm">
                  <Link to={"/about"}>About</Link>
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
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-xl">
            <span className="text-yellow-500 font-hand text-xl">Edu</span>
            <span className="dark:text-white text-gray-800 font-hand text-xl">
              Quest
            </span>
          </h1>
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
