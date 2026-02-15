import React from "react";
import { HomeIcon, User, Bell, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const LeftSidebar = () => {
  return (
    <div className="w-[275px] h-screen sticky top-0 flex flex-col px-2 border-r border-gray-100">
      <div
        className="relative flex items-end h-32 p-4 mx-2 mt-4 mb-6 overflow-hidden shadow-md rounded-2xl"
        style={{
          backgroundImage: "url('/skate.gif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/20" />

        {/* Updated: Removed the box border. Added a text-shadow simulation to create a black outline around the letters. */}
        <h1
          className="relative z-10 text-4xl font-jersey text-white"
          style={{
            textShadow:
              "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
          }}
        >
          Community
        </h1>
      </div>

      <div className="flex flex-col gap-1 px-2">
        <SidebarItem icon={<User />} label="Profile" />
        <SidebarItem icon={<HomeIcon />} label="Home" />
        <SidebarItem icon={<Bell />} label="Notifications" />
        <SidebarItem icon={<Mail />} label="Messages" />

        <Button
          variant={"pixel"}
          className="w-11/12 py-3 mt-6 font-jersey text-2xl"
        >
          Post
        </Button>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label }) => {
  return (
    <div className="flex items-center gap-4 px-4 py-3 transition-colors duration-200 cursor-pointer w-fit rounded-full hover:bg-gray-200">
      {React.cloneElement(icon, { className: "w-7 h-7" })}
      <span className="text-xl text-gray-900 font-medium">{label}</span>
    </div>
  );
};

export default LeftSidebar;
