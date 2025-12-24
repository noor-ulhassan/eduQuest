import { Button } from "@/components/ui/button";
import api from "@/features/auth/authApi";
import { Book, PlayCircle, GraduationCap } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const bannerImages = [
  "/gif5.gif",
  "/gif6.gif",
  "/gif4.gif",
  "/gif7.gif",
  "/gif8.gif",
  "/gif9.gif",
];

function ProgressCard({ course, progress }) {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const courseLayout = course?.courseOutput;

  // FIX: Added a fallback check for courseId.
  // If courseId is missing, it uses the course name to generate the index.
  const identifier = course?.courseId || course?.name || "default";

  const bannerImage =
    bannerImages[
      Math.abs(
        String(identifier)
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
        navigate(`/course/${course?.courseId}`);
      }
    } catch (error) {
      console.error("Enrollment failed:", error);
    }
  };

  return (
    <div className="shadow-md rounded-xl border flex flex-col h-full bg-white hover:shadow-lg transition-all cursor-pointer overflow-hidden">
      {/* Added 'bg-zinc-100' so the card doesn't look empty if the GIF is loading */}
      <div className="w-full aspect-video bg-zinc-100">
        <img
          src={bannerImage}
          alt={course?.name}
          className="w-full h-full object-cover"
          // Adding an onError handler just in case a path is wrong
          onError={(e) => {
            e.target.src = "/gif4.gif";
          }}
        />
      </div>

      <div className="p-4 flex flex-col gap-3 flex-grow">
        <h2 className="font-bold text-lg line-clamp-1">
          {course?.name || "Untitled Course"}
        </h2>

        <p className="line-clamp-2 text-gray-500 text-sm h-10">
          {courseLayout?.description ||
            course?.description ||
            "No description available."}
        </p>

        {progress !== undefined && (
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-zinc-600">
                {progress}% Completed
              </span>
            </div>
            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden border">
              <div
                className="bg-green-500 h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-auto pt-2 border-t">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Book className="w-4 h-4 text-green-600" />
            {course?.noOfChapters || 0} Chapters
          </h2>

          <div className="flex gap-2">
            {progress !== undefined ? (
              <Button
                onClick={() => navigate(`/course/${course?.courseId}`)}
                variant={"pixel"}
                className="flex items-center gap-2 h-9 font-jersey text-xl bg-blue-600 hover:bg-blue-700"
              >
                <PlayCircle className="w-4 h-4" /> Continue
              </Button>
            ) : course?.courseOutput ? (
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressCard;
