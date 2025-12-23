import React, { useState } from "react";
import { Button } from "../ui/button";

function EnrolledCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  return (
    <div className="mt-8 ">
      <h2 className="text-3xl font-jersey mb-2">Your Enrolled Courses...</h2>
      {enrolledCourses?.length === 0 ? (
        <div className="flex flex-col items-center gap-3 p-7 rounded-2xl border border-zinc-800 mt-5">
          <img src="/books.png" alt="books" width={90} height={90} />
          <h2 className="font-jersey text-xl">
            You don't have any Enrolled Courses
          </h2>
          <Button variant={"pixel"} className="font-jersey text-xl" size={"lg"}>
            Browse all Courses
          </Button>
        </div>
      ) : (
        <div>List of courses</div>
      )}
    </div>
  );
}

export default EnrolledCourses;
