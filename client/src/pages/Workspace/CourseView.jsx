import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/features/auth/authApi";
import { useSelector } from "react-redux";
import CourseOverview from "./components/CourseOverview";
import CourseLearning from "./components/CourseLearning";

function CourseView() {
  const { courseId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(!!courseId);

  const [currentChapterIndex, setCurrentChapterIndex] = useState(null);

  const fetchCourseData = useCallback(
    async (showLoader = true) => {
      if (!courseId || !user?.email) return;
      if (showLoader) setLoading(true);
      try {
        const res = await api.get(`/ai/course/${courseId}`);
        setCourse(res.data.course);

        const enrollRes = await api.get(
          `/ai/enrollment-status?courseId=${courseId}`,
        );
        setEnrollment(enrollRes.data.enrollment);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [courseId, user?.email],
  );

  useEffect(() => {
    if (courseId && user?.email) {
      fetchCourseData(true);
    } else if (!courseId) {
      setLoading(false);
      setCourse(null);
      setEnrollment(null);
    }
  }, [courseId, user?.email, fetchCourseData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a] ">
        <p className="font-space-grotesk font-bold text-3xl animate-pulse text-red-400">
          Loading Course Experience...
        </p>
      </div>
    );
  }

  if (!courseId) {
    return (
      <CourseOverview course={null} enrollment={null} onResume={() => {}} />
    );
  }

  const chapters = course?.courseOutput?.chapters || [];
  const completedCount = enrollment?.completedChapters?.length || 0;
  const resumeChapterIndex = Math.max(
    0,
    Math.min(completedCount, chapters.length - 1),
  );

  const resolvedChapterIndex = currentChapterIndex ?? resumeChapterIndex;

  const handleNavigate = (mode) => {
    if (mode === "overview") {
      navigate("/workspace");
    } else if (typeof mode === "number") {
      const clamped = Math.max(0, Math.min(mode, chapters.length - 1));
      setCurrentChapterIndex(clamped);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <CourseLearning
      course={course}
      enrollment={enrollment}
      currentChapterIndex={resolvedChapterIndex}
      onProgressUpdate={() => fetchCourseData(false)}
      onNavigate={handleNavigate}
    />
  );
}

export default CourseView;
