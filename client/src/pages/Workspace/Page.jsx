import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
 Sidebar,
 SidebarBody,
 SidebarLink,
} from "@/components/ui/sidebar";
import { Book, BookOpen, LayoutDashboard, Plus, User } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import WelcomeBanner from "./components/WelcomeBanner";
import CourseList from "./components/CourseList";
import UserStatus from "@/components/user/UserStatus";
import AddCourseDialog from "./components/AddCourseDialog";
import EnrollCourseList from "./components/EnrollCourseList";

const SidebarOptions = [
 { title: "Dashboard", icon: LayoutDashboard, path: "/workspace" },
 { title: "My Learning", icon: Book, path: "/my-learning" },
 { title: "Explore Courses", icon: BookOpen, path: "/#" },
 { title: "Billing", icon: BookOpen, path: "/#" },
 { title: "Profile", icon: User, path: "/profile" },
];

function Workspace() {
 const location = useLocation();
 const path = location.pathname;
 const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  return (
   <div className="flex md:flex-row flex-col w-full relative min-h-screen bg-[#0A0A0B] text-white pt-16">
    <Sidebar open={open} setOpen={setOpen}>
     <SidebarBody className="bg-[#111111] dark:bg-[#111111] border-r border-white/10 h-[calc(100vh-64px)] pb-10 px-3">
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden pt-4 -mx-1">
       {/* Sidebar Header */}
       <div className="flex items-center gap-3 mb-8">
        <img src="pc.jpeg" alt="work" width={30} height={30} className="shrink-0 shadow-lg rounded" />
        {open && (
         <h2 className="text-3xl font-jersey whitespace-pre animate-in fade-in">
          Workspace
         </h2>
        )}
       </div>

       {/* Create New Course Button */}
       <div className="mb-8">
        <AddCourseDialog>
         <Button
          variant={"pixel"}
          className={`font-jersey flex items-center justify-start gap-3 transition-all ${open ? 'w-full text-xl px-4 py-2' : 'w-8 h-8 p-0 justify-center text-sm'}`}
         >
          <Plus
           className="w-5 h-5 shrink-0"
           strokeWidth={4}
           style={{ shapeRendering: "crispEdges" }}
          />
          {open && <span className="animate-in fade-in whitespace-pre mt-1">Create New Course</span>}
         </Button>
        </AddCourseDialog>
       </div>

       {/* Sidebar Links */}
       <div className="flex flex-col gap-3 mt-2">
        {SidebarOptions.map((item, index) => (
         <SidebarLink
          key={index}
          link={{
           label: item.title,
           href: item.path,
           icon: (
            <item.icon
             className={`h-6 w-6 shrink-0 ${
              path.includes(item.path) ? "text-red-400" : "text-zinc-400 group-hover/sidebar:text-white"
             }`}
            />
           ),
          }}
          className={`font-bold transition-colors py-3 px-3 rounded-lg ${
           path.includes(item.path) ? "text-red-400 bg-white/10" : "hover:bg-white/5 text-zinc-300"
          }`}
         />
        ))}
       </div>
      </div>
     </SidebarBody>
    </Sidebar>

    {/* Main Content Area */}
    <div className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">     
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7">
      <div className="lg:col-span-2">
       <WelcomeBanner />
       <EnrollCourseList userEmail={user?.email} />
       <CourseList />
      </div>
      <div className="mt-2">
       <UserStatus />
      </div>
     </div>
    </div>
   </div>
  );
}

export default Workspace;
