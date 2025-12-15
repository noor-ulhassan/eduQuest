// CourseList.jsx
import { Button } from "@/components/ui/button";
import React from "react";
import AddCourseDialog from "./AddCourseDialog";

function CourseList() {
  const [courseList, setCourseList] = React.useState([]);
  console.log("Current Course List: ", courseList);
  return (
    <div className="w-full mt-10">
      <h2 className="font-jersey text-3xl mb-5">Course List</h2>
      {courseList.length === 0 ? (
        <div className="flex p-7 items-center justify-center flex-col border-2 border-dashed border-zinc-200 rounded-lg">
          <img src="/start-up.png" alt="duck" height={100} width={100} />
          <h2 className="my-2 text-lg font-bold text-center">
            Looks like you have'nt Enrolled in any Course yet
          </h2>
          <AddCourseDialog setCourseList={setCourseList}>
            <Button variant={"pixel"} className="mt-5 text-xl font-jersey">
              Create your first Course
            </Button>
          </AddCourseDialog>
        </div>
      ) : (
        courseList.map((course, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold mb-2">{course.name}</h2>
            <p className="text-gray-600 mb-2">{course.description}</p>
            <p className="text-sm text-gray-500">
              Level: {course.level} | Chapters: {course.noOfChapters}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default CourseList;
