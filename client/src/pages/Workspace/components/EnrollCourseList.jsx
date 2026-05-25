import React from "react";
import { useUserEnrollments } from "@/features/workspace/useCourses";
import ProgressCard from "./ProgressCard";

function EnrollCourseList() {
  const { data: enrolledCourses = [], isLoading } = useUserEnrollments();

  if (isLoading || enrolledCourses.length === 0) return null;

  return (
    <div className="mt-5">
      <h2 className="font-Inter font-bold text-3xl mb-4 text-metallic">
        Continue Learning
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-5">
        {enrolledCourses.map((course, index) => (
          <ProgressCard
            key={index}
            course={course}
            progress={course.progress}
          />
        ))}
      </div>
    </div>
  );
}

export default EnrollCourseList;
