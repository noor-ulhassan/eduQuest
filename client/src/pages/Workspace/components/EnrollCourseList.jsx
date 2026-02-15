import React, { useEffect, useState } from "react";
import api from "@/features/auth/authApi";
import ProgressCard from "./ProgressCard";

function EnrollCourseList({ userEmail }) {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userEmail) {
      fetchEnrolledCourses();
    }
  }, [userEmail]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `http://localhost:8080/api/v1/ai/user-enrollments?email=${userEmail}`
      );
      setEnrolledCourses(res.data.enrolledCourses);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || enrolledCourses.length === 0) return null;

  return (
    <div className="mt-5">
      <h2 className="font-jersey text-3xl mb-4 text-primary">
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
