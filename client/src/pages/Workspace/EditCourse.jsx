import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getCourseById,
  updateCourseChapter,
  updateCourseMetadata,
  publishCourse,
} from "@/features/workspace/courseApi";
import EditorSidebar from "./components/editor/EditorSidebar";
import EditorMainArea from "./components/editor/EditorMainArea";
import SaveBar from "./components/editor/SaveBar";

function EditCourse() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [editedChapters, setEditedChapters] = useState([]);
  const [editedMeta, setEditedMeta] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const originalRef = useRef(null);

  useEffect(() => {
    if (courseId) fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const data = await getCourseById(courseId);
      setCourse(data);
      const chapters = JSON.parse(JSON.stringify(data.courseOutput?.chapters || []));
      setEditedChapters(chapters);
      setEditedMeta({ name: data.name, description: data.description, level: data.level, category: data.category, language: data.language });
      originalRef.current = JSON.stringify(chapters);
      setHasChanges(false);
    } catch (err) {
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const handleChapterChange = (newChapter) => {
    const updated = [...editedChapters];
    updated[selectedChapterIndex] = newChapter;
    setEditedChapters(updated);
    setHasChanges(true);
  };

  const handleMetadataChange = (newMeta) => {
    setEditedMeta(newMeta);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editedMeta) {
        await updateCourseMetadata(courseId, editedMeta);
      }

      for (let i = 0; i < editedChapters.length; i++) {
        const current = JSON.stringify(editedChapters[i]);
        const original = originalRef.current ? JSON.parse(originalRef.current) : [];
        if (current !== JSON.stringify(original[i])) {
          await updateCourseChapter(courseId, i, editedChapters[i]);
        }
      }

      originalRef.current = JSON.stringify(editedChapters);
      setHasChanges(false);
      toast.success("Changes saved");
      await fetchCourse();
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      const updated = await publishCourse(courseId);
      setCourse((prev) => ({ ...prev, isPublished: updated.isPublished }));
      toast.success(updated.isPublished ? "Course published" : "Course unpublished");
    } catch {
      toast.error("Failed to update publish status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-zinc-400">
        Course not found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white pt-16">
      <div className="flex flex-1 min-h-0">
        <EditorSidebar
          chapters={editedChapters}
          selectedIndex={selectedChapterIndex}
          onSelect={setSelectedChapterIndex}
          courseName={editedMeta?.name || course?.name}
        />
        <EditorMainArea
          chapter={editedChapters[selectedChapterIndex]}
          chapterIndex={selectedChapterIndex}
          courseId={courseId}
          course={{ ...course, ...editedMeta }}
          onChapterChange={handleChapterChange}
          onMetadataChange={handleMetadataChange}
        />
      </div>
      <SaveBar
        onSave={handleSave}
        onPublish={handlePublish}
        saving={saving}
        isPublished={course?.isPublished}
        hasChanges={hasChanges}
      />
    </div>
  );
}

export default EditCourse;
