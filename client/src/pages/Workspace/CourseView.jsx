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
 const [loading, setLoading] = useState(!!courseId);

 const fetchCourseData = useCallback(async () => {
  if (!courseId || !user?.email) return;
  setLoading(true);
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

 // Calculate active chapter
 const chapters = course?.courseOutput?.chapters || [];
 const completedChaptersCount = enrollment?.completedChapters?.length || 0;
 const activeChapterIndex = Math.max(0, Math.min(
  completedChaptersCount,
  chapters.length > 0 ? chapters.length - 1 : 0
 ));

 if (!courseId) {
  return (
   <CourseOverview
    course={null}
    enrollment={null}
    onResume={() => {}}
   />
  );
 }

 return (
  <CourseLearning
   course={course}
   enrollment={enrollment}
   currentChapterIndex={activeChapterIndex}
   onProgressUpdate={fetchCourseData}
   onNavigate={(mode) => {
    if (mode === "overview") {
     window.location.href = "/workspace";
    }
   }}
  />
 );
}

export default CourseView;
