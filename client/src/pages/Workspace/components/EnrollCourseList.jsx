import React, { useEffect, useState } from "react";
import { getUserEnrollments } from "@/features/workspace/courseApi";
import ProgressCard from "./ProgressCard";

function EnrollCourseList() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const data = await getUserEnrollments();
      setEnrolledCourses(data || []);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || enrolledCourses.length === 0) return null;

  return (
    <div className="mt-5">
      <h2 className="font-Inter font-bold text-3xl mb-4 text-metallic ">
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
