import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Book, BookOpen, LayoutDashboard, Plus, User } from "lucide-react";

import React from "react";
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

  return (
    <SidebarProvider>
      <div className="mt-8 flex w-full">
        <Sidebar collapsible="icon" className="h-[calc(100vh-64px)] mt-16">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <img src="pc.jpeg" alt="work" width={30} height={30} />
              <h2 className="text-3xl font-jersey group-data-[collapsible=icon]:hidden">
                Workspace
              </h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <AddCourseDialog>
                <Button
                  variant={"pixel"}
                  className="text-xl font-jersey w-full"
                >
                  <Plus
                    className="w-6 h-6"
                    strokeWidth={4}
                    style={{ shapeRendering: "crispEdges" }}
                  />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Create New Course
                  </span>
                </Button>
              </AddCourseDialog>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {SidebarOptions.map((item, index) => (
                    <SidebarMenuItem
                      key={index}
                      className="hover:bg-zinc-200 font-bold"
                    >
                      <SidebarMenuButton asChild className="p-5">
                        <Link
                          to={item.path}
                          className={`text-[17px] ${
                            path.includes(item.path)
                              ? "text-primary bg-zinc-200"
                              : ""
                          }`}
                        >
                          <item.icon className="h-7 w-7" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="p-10 mt-4 flex-1">
          <div className="mb-4">
            <SidebarTrigger className="scale-125 border shadow-sm" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            <div className="lg:col-span-2">
              <WelcomeBanner />
              <EnrollCourseList userEmail={user?.email} />
              <CourseList />
            </div>
            <div className="mt-4">
              <UserStatus />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Workspace;
