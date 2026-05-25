import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useCourse, useEnrollmentStatus } from "@/features/workspace/useCourses";
import CourseOverview from "./components/CourseOverview";
import CourseLearning from "./components/CourseLearning";

function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentChapterIndex, setCurrentChapterIndex] = useState(null);

  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: enrollment, isLoading: enrollmentLoading } = useEnrollmentStatus(courseId);
  const loading = courseLoading || enrollmentLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
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
      onProgressUpdate={() => queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] })}
      onNavigate={handleNavigate}
    />
  );
}

export default CourseView;
