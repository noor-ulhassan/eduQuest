import React from "react";
import { usePublishedCourses } from "@/features/workspace/useCourses";
import CourseCard from "./CourseCard";

function CourseList() {
  const { data: courseList = [], isLoading } = usePublishedCourses();

  if (isLoading) return null;

  return (
    <div className="w-full">
      <h2 className="font-jersey text-3xl mb-5 text-metallic">Course List</h2>
      {courseList.length === 0 ? (
        <div className="flex p-7 items-center justify-center flex-col border-2 border-dashed border-white/10 rounded-lg">
          <img src="/start-up.png" alt="duck" height={100} width={100} />
          <h2 className="my-2 text-lg font-bold text-center">
            No courses available yet. Check back soon!
          </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {courseList.map((course, index) => (
            <CourseCard course={course} key={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseList;
