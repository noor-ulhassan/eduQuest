import { Button } from "@/components/ui/button";
import { Book, PlayCircle, Settings } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const bannerImages = [
  "/gif5.gif",
  "/gif6.gif",
  "/gif4.gif",
  "/gif7.gif",
  "/gif8.gif",
  "/gif9.gif",
];

function CourseCard({ course }) {
  const courseLayout = course?.courseOutput;

  const bannerImage =
    bannerImages[
      Math.abs(
        String(course?.courseId)
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      ) % bannerImages.length
    ];

  return (
    <div className="shadow-md rounded-xl border flex flex-col h-full bg-white hover:shadow-lg transition-all cursor-pointer">
      <img
        src={bannerImage}
        alt={course?.name}
        className="w-full aspect-video rounded-t-xl object-cover"
      />

      <div className="p-4 flex flex-col gap-3 flex-grow">
        <h2 className="font-bold text-lg line-clamp-1">{course?.name}</h2>

        <p className="line-clamp-2 text-gray-500 text-sm h-10">
          {courseLayout?.description}
        </p>

        <div className="flex justify-between items-center mt-auto pt-2 border-t">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Book className="w-4 h-4 text-green-600" />
            {course?.noOfChapters} Chapters
          </h2>

          <Link to={`/course/${course?.courseId}`}>
            {course?.courseOutput ? (
              <Button
                variant={"pixel"}
                className="flex items-center gap-2 h-9 font-jersey text-xl"
              >
                <PlayCircle className="w-4 h-4" /> Enroll
              </Button>
            ) : (
              <Button
                variant={"pixel"}
                className="flex items-center gap-2 h-9 font-jersey text-xl"
              >
                <Settings /> Generate Course
              </Button>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
