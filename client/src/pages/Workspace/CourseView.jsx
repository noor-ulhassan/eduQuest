import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "@/features/auth/authApi";
import { useSelector } from "react-redux";
import CourseOverview from "./components/CourseOverview";
import CourseLearning from "./components/CourseLearning";

function CourseView() {
  const { courseId } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  // viewMode is either 'overview' or an integer corresponding to the chapter index
  const [viewMode, setViewMode] = useState("overview");

  const fetchCourseData = useCallback(async () => {
    try {
      const res = await api.get(
        `http://localhost:8080/api/v1/ai/course/${courseId}`,
      );
      setCourse(res.data.course);

      const enrollRes = await api.get(
        `http://localhost:8080/api/v1/ai/enrollment-status?courseId=${courseId}&email=${user.email}`,
      );
      setEnrollment(enrollRes.data.enrollment);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId, user?.email]);

  useEffect(() => {
    if (courseId && user?.email) {
      fetchCourseData();
    }
  }, [courseId, user, fetchCourseData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f7f6f8] dark:bg-[#191022]">
        <p className="font-space-grotesk font-bold text-3xl animate-pulse text-[#8c2bee]">
          Loading Course Experience...
        </p>
      </div>
    );
  }

  if (viewMode === "overview") {
    return (
      <CourseOverview
        course={course}
        enrollment={enrollment}
        onResume={(chapterIndex) => setViewMode(chapterIndex)}
      />
    );
  }

  if (typeof viewMode === "number") {
    return (
      <CourseLearning
        course={course}
        enrollment={enrollment}
        currentChapterIndex={viewMode}
        onProgressUpdate={fetchCourseData}
        onNavigate={(mode) => setViewMode(mode)}
      />
    );
  }

  return null;
}

export default CourseView;
