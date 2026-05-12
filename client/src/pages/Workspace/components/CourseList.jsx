import React, { useEffect, useState } from "react";
import { getPublishedCourses } from "@/features/workspace/courseApi";
import CourseCard from "./CourseCard";

function CourseList() {
 const [courseList, setCourseList] = useState([]);

 useEffect(() => {
  fetchCourses();
 }, []);

 const fetchCourses = async () => {
  try {
   const courses = await getPublishedCourses();
   setCourseList(courses || []);
  } catch (error) {
   console.error("Error fetching courses:", error);
  }
 };

 return (
  <div className="w-full mt-10">
   <h2 className="font-jersey text-3xl mb-5">Course List</h2>
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
