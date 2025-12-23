import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import AddCourseDialog from "./AddCourseDialog";
import api from "@/features/auth/authApi";
import { useSelector } from "react-redux";
import CourseCard from "./CourseCard";

function CourseList() {
  const { user } = useSelector((state) => state.auth);
  const [courseList, setCourseList] = useState([]);

  useEffect(() => {
    if (user?.email) {
      GetCourseList();
    }
  }, [user]);

  const GetCourseList = async () => {
    try {
      const result = await api.get(
        `http://localhost:8080/api/v1/ai/courses?email=${user.email}`
      );
      setCourseList(result.data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };
  return (
    <div className="w-full mt-10">
      <h2 className="font-jersey text-3xl mb-5">Course List</h2>
      {courseList.length === 0 ? (
        <div className="flex p-7 items-center justify-center flex-col border-2 border-dashed border-zinc-200 rounded-lg">
          <img src="/start-up.png" alt="duck" height={100} width={100} />
          <h2 className="my-2 text-lg font-bold text-center">
            Looks like you haven't Enrolled in any Course yet
          </h2>
          <AddCourseDialog setCourseList={setCourseList}>
            <Button variant={"pixel"} className="mt-5 text-xl font-jersey">
              Create your first Course
            </Button>
          </AddCourseDialog>
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
