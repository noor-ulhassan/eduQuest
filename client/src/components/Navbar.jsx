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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; //
import { DarkMode } from "@/DarkMode";
import { Link } from "react-router-dom";

const Navbar = () => {
  const user = true;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-16 dark:bg-[#0A0A0A]/80 bg-white/80 backdrop-blur-md border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10 shadow-sm"
    >
      {/* Desktop */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <School
            size={28}
            className="text-blue-700 transition-transform duration-300 hover:rotate-6"
          />
          <h1 className="hidden md:block font-extrabold text-2xl tracking-tight">
            <span className="text-blue-700">Edu</span>
            <span className="dark:text-white text-gray-800">Quest</span>
          </h1>
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
