import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "@/features/auth/authApi";
import { useSelector } from "react-redux";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import ChapterSidebar from "./components/ChapterSidebar";
import ChapterContent from "./components/ChapterContent";

function CourseView() {
  const { courseId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(0);

  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent) => {
      if (isResizing && !isCollapsed) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth > 200 && newWidth < 600) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing, isCollapsed]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  useEffect(() => {
    if (courseId && user?.email) {
      fetchCourseData();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    try {
      const res = await api.get(
        `http://localhost:8080/api/v1/ai/course/${courseId}`
      );
      setCourse(res.data.course);
      const enrollRes = await api.get(
        `http://localhost:8080/api/v1/ai/enrollment-status?courseId=${courseId}&email=${user.email}`
      );
      setEnrollment(enrollRes.data.enrollment);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden select-none relative">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed top-4 z-50 p-2 bg-white border rounded-md shadow-sm transition-all duration-300 hover:bg-zinc-50 ${
          isCollapsed ? "left-4" : ""
        }`}
        style={{ left: isCollapsed ? "1rem" : `${sidebarWidth - 45}px` }}
      >
        {isCollapsed ? (
          <PanelLeftOpen size={20} />
        ) : (
          <PanelLeftClose size={20} />
        )}
      </button>

      <div
        className={`hidden md:block border-r h-full overflow-y-auto bg-white relative transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-0 opacity-0 border-none" : "opacity-100"
        }`}
        style={{ width: isCollapsed ? "0px" : `${sidebarWidth}px` }}
      >
        {!isCollapsed && (
          <>
            <ChapterSidebar
              course={course}
              enrollment={enrollment}
              selectedChapter={selectedChapter}
              setSelectedChapter={(index) => {
                setSelectedChapter(index);
                setSelectedTopic(0);
              }}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
            />

            <div
              onMouseDown={startResizing}
              className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-yellow-400 transition-colors ${
                isResizing ? "bg-yellow-500 w-1.5" : "bg-transparent"
              }`}
            />
          </>
        )}
      </div>

      <div className="flex-1 h-full overflow-y-auto bg-gray-50">
        {course?.courseOutput?.chapters ? (
          <ChapterContent
            courseId={courseId}
            enrollment={enrollment}
            chapter={course.courseOutput.chapters[selectedChapter]}
            index={selectedChapter}
            selectedTopic={selectedTopic}
            onProgressUpdate={fetchCourseData}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="font-jersey text-3xl animate-pulse">
              Loading Course...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseView;
