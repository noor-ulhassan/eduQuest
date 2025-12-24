import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import EnrollCourseList from "@/pages/Workspace/components/EnrollCourseList";
import { useSelector } from "react-redux";
import api from "@/features/auth/authApi";
import { Link } from "react-router-dom";

function EnrolledCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.email) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      // Fetch the same enrollment data used in the Workspace
      const res = await api.get(
        `http://localhost:8080/api/v1/ai/user-enrollments?email=${user?.email}`
      );
      setEnrolledCourses(res.data.enrolledCourses);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-3xl font-jersey mb-2">Your Enrolled Courses...</h2>
        <p className="animate-pulse font-jersey text-xl">
          Loading your progress...
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-jersey mb-2"></h2>

      {enrolledCourses?.length === 0 ? (
        <div className="flex flex-col items-center gap-3 p-10 rounded-2xl border border-zinc-200 bg-zinc-50/50 mt-5">
          <img
            src="/books.png"
            alt="books"
            width={90}
            height={90}
            className="opacity-80"
          />
          <h2 className="font-jersey text-2xl text-zinc-600">
            You don't have any Enrolled Courses yet
          </h2>
          <Link to="/workspace">
            <Button
              variant={"pixel"}
              className="font-jersey text-xl"
              size={"lg"}
            >
              Browse all Courses
            </Button>
          </Link>
        </div>
      ) : (
        <div>
          {/* Reusing the component that shows cards with Progress Bars */}
          <EnrollCourseList userEmail={user?.email} />
        </div>
      )}
    </div>
  );
}

export default EnrolledCourses;
