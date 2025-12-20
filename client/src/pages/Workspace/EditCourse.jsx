// 1. Correct Imports
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import CourseInfo from "./components/CourseInfo";
import ChapterTopicList from "./components/ChapterTopicList";
import api from "@/features/auth/authApi";

function EditCourse() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState();

  useEffect(() => {
    if (courseId) {
      GetCourseInfo();
    }
  }, [courseId]);

  const GetCourseInfo = async () => {
    setLoading(true);
    try {
      console.log("Fetching course with ID:", courseId);
      const result = await api.get(
        `http://localhost:8080/api/v1/ai/get-course/${courseId}`
      );
      setCourse(result.data.course);
      console.log("Course fetched successfully:", result.data.course);
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-20 px-10">
      <CourseInfo course={course} />
      <ChapterTopicList course={course} />
    </div>
  );
}

export default EditCourse;
