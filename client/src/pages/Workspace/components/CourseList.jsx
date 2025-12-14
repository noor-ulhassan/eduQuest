// CourseList.jsx
import { Button } from "@/components/ui/button";
import React from "react";
import AddCourseDialog from "./AddCourseDialog";

function CourseList() {
  const [courseList, setCourseList] = React.useState([]);
  return (
    <div className="w-full mt-10">
      <h2 className="font-jersey text-3xl mb-5">Course List</h2>
      {courseList.length === 0 ? (
        <div className="flex p-7 items-center justify-center flex-col border-2 border-dashed border-zinc-200 rounded-lg">
          <img src="/start-up.png" alt="duck" height={100} width={100} />
          <h2 className="my-2 text-lg font-bold text-center">
            Looks like you have'nt Enrolled in any Course yet
          </h2>
          <AddCourseDialog>
            <Button variant={"pixel"} className="mt-5 text-xl font-jersey">
              Create your first Course
            </Button>
          </AddCourseDialog>
        </div>
      ) : (
        <div>List of Courses</div>
      )}
    </div>
  );
}

export default CourseList;
