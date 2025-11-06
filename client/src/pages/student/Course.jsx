import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Badge, BadgeCheckIcon } from "lucide-react";
import React from "react";

const Course = () => {
  return (
    <Card className="overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 w-full max-w-sm mx-auto">
      {/* Image section */}
      <div className="relative">
        <img
          src="https://img-c.udemycdn.com/course/750x422/3873464_403c_3.jpg"
          alt="Course"
          className="w-full h-36 object-cover rounded-t-lg"
        />
      </div>
      <CardContent className="px-5 py-4 space-y-3">
        <h1 className="hover:underline font-bold text-lg truncate">
          Nextjs Complete Course in English 2025
        </h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-6 w-6 rounded-full">
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="@shadcn"
                className="h-full w-full rounded-full object-cover"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h1 className="font-medium text-sm">Noor</h1>
          </div>
          <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            Advanced
          </span>
        </div>
        <div className="text-lg font-bold">
          <span>$9.99</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default Course;
