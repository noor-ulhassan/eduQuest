import React from "react";
import { School } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; //
import { DarkMode } from "@/DarkMode";
import { Link } from "react-router-dom";
import Course from "@/pages/student/Course";

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
  const user = true;

  return (
    <motion.div className="h-16 dark:bg-[#0A0A0A]/80 bg-white/80 backdrop-blur-md border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10 shadow-sm">
      {/* Desktop */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 font-jersey">
          <Link to="/home" className="flex items-center gap-3">
            <img src="logo.png" alt="logo" height={40} width={40} />
            <h1 className="hidden md:block text-3xl tracking-tight">
              <span className="text-blue-700">Edu</span>
              <span className="dark:text-white text-gray-800">Quest</span>
            </h1>
          </Link>
        </div>

        {/*  Added Nav Links (safe addition) */}
        <div>
          <NavigationMenu>
            <NavigationMenuList className="flex gap-8">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="hover:bg-yellow-300 data-[state=open]">
                  Courses
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white dark:bg-[#0A0A0A] shadow-lg border border-gray-200 dark:border-gray-800 rounded-lg">
                  <ul className="grid md:grid-cols-2 gap-2 sm:w-400px md:w-[500px] lg:w-[500px] p-4 max-h-[90vh] overflow-y-auto">
                    {courses.map((course, index) => {
                      return (
                        <div
                          key={index}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer"
                        >
                          <h2 className="font-medium">{course.name}</h2>
                          <p className="text-sm text-gray-600">{course.desc}</p>
                        </div>
                      );
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink>
                  <Link to={"/profile"}>Profile</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink>
                  <Link to={"my-learning"}>Dashboard</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink>
                  <Link to={"/Problems"}>Problems</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* User or Auth Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="outline-none">
                  <Avatar className="w-9 h-9 cursor-pointer ring-2 ring-blue-700 hover:ring-blue-500 transition">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <AnimatePresence>
                <DropdownMenuPortal>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <DropdownMenuContent
                      className="w-56 bg-white dark:bg-[#0A0A0A] border dark:border-gray-800 shadow-lg rounded-lg"
                      align="end"
                      sideOffset={12}
                    >
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Link to="profile">Profile</Link>
                          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Link to="my-learning">My Learning</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem>Email</DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Dashboard</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        Log out
                        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </motion.div>
                </DropdownMenuPortal>
              </AnimatePresence>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="outline">Login</Button>
              <Button className="bg-blue-700 hover:bg-blue-800 text-white">
                Signup
              </Button>
            </div>
          )}
          <DarkMode />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden justify-between items-center px-4 h-full">
        <div className="flex items-center gap-2">
          <School size={26} className="text-blue-700" />
          <h1 className="font-bold text-xl">
            <span className="text-blue-700">Edu</span>
            <span className="dark:text-white text-gray-800">Quest</span>
          </h1>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
