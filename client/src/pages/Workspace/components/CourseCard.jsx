import { Button } from "@/components/ui/button";
import api from "@/features/auth/authApi";
import { Book, PlayCircle, Settings } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const bannerImages = [
  "/gif5.gif",
  "/gif6.gif",
  "/gif4.gif",
  "/gif7.gif",
  "/gif8.gif",
  "/gif3.gif",
];

function CourseCard({ course }) {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const courseLayout = course?.courseOutput;

  const bannerImage =
    bannerImages[
      Math.abs(
        String(course?.courseId)
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      ) % bannerImages.length
    ];

  const onEnrollClick = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "http://localhost:8080/api/v1/ai/enroll-course",
        {
          courseId: course?.courseId,
          userEmail: user?.email,
        }
      );

      if (response.data.success) {
        console.log("Enrollment successful");
        navigate(`/course/${course?.courseId}`);
      }
    } catch (error) {
      console.error("Enrollment failed:", error);
    }
  };

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
                onClick={onEnrollClick}
                variant={"pixel"}
                className="flex items-center gap-2 h-9 font-jersey text-xl"
              >
                <PlayCircle className="w-4 h-4" /> Enroll
              </Button>
            ) : (
              <Button
                onClick={() => navigate(`/course/${course?.courseId}`)}
                variant={"pixel"}
                className="flex items-center gap-2 h-9 font-jersey text-xl"
              >
                Generate Course
              </Button>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
