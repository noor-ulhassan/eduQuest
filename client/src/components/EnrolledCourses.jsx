import React, { useState } from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

function EnrolledCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  return (
    <div className="mt-8 font-pixelify ">
      <h2 className="text-2xl font-bold">Your Enrolled Courses..</h2>
      {enrolledCourses?.length === 0 ? (
        <div className="flex flex-col items-center gap-3 p-4 border rounded-2xl bg-zinc-100 text-lg mt-2">
          <img src="/books.png" alt="book" width={90} height={90} />

          <h2>Yyou don't have any Enrolled Courses !</h2>
          <Button className="bg-yellow-400 text-black">
            <Link to="/home">Browse more Courses</Link>
          </Button>
        </div>
      ) : (
        <div>List</div>
      )}
    </div>
  );
}

export default EnrolledCourses;
