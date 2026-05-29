import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  generateCourse,
  getAdminCourses,
  publishCourse,
  deleteCourse,
} from "@/features/workspace/courseApi";
import {
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

const LANGUAGES = ["javascript", "html", "css", "python", "react", "general"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const LANGUAGE_COLORS = {
  javascript: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  html: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  css: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  python: "bg-green-500/20 text-green-400 border-green-500/30",
  react: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  general: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const AdminCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    language: "general",
    level: "Beginner",
    category: "",
    noOfChapters: 8,
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getAdminCourses();
      setCourses(data || []);
    } catch (err) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.category) {
      toast.error("Please fill all fields");
      return;
    }
    setGenerating(true);
    try {
      await generateCourse(form);
      toast.success("Course generated successfully!");
      setForm({ name: "", description: "", language: "general", level: "Beginner", category: "", noOfChapters: 8 });
      setShowForm(false);
      await fetchCourses();
    } catch (err) {
      toast.error(err?.message || "Failed to generate course");
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async (courseId) => {
    setTogglingId(courseId);
    try {
      const updated = await publishCourse(courseId);
      setCourses((prev) =>
        prev.map((c) => (c.courseId === courseId ? { ...c, isPublished: updated.isPublished } : c))
      );
      toast.success(updated.isPublished ? "Course published" : "Course unpublished");
    } catch (err) {
      toast.error("Failed to update publish status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This cannot be undone.")) return;
    setDeletingId(courseId);
    try {
      await deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.courseId !== courseId));
      toast.success("Course deleted");
    } catch (err) {
      toast.error("Failed to delete course");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
            <p className="text-zinc-400 text-sm mt-1">Create, publish, and manage courses for students</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors"
          >
            {showForm ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Close" : "Add Course"}
          </button>
        </div>

        {/* Generate Form */}
        {showForm && (
          <form
            onSubmit={handleGenerate}
            className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-8 space-y-4"
          >
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Generate New Course with AI
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                  Course Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. JavaScript Fundamentals"
                  className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                  Category
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Web Development"
                  className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what students will learn..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                  Language (Playground Link)
                </label>
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-indigo-500 text-sm"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                  Difficulty Level
                </label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-indigo-500 text-sm"
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                  Number of Chapters
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={form.noOfChapters}
                  onChange={(e) => setForm({ ...form, noOfChapters: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={generating}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors disabled:opacity-50"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? "Generating..." : "Generate with AI"}
              </button>
            </div>
          </form>
        )}

        {/* Course Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
            <BookOpen className="w-12 h-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-zinc-400">No courses yet</h3>
            <p className="text-sm text-zinc-600 mt-1">Click "Add Course" to generate your first course with AI</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <div
                key={course.courseId}
                className="bg-[#111] border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:border-white/20 transition-colors"
              >
                {/* Top row: name + language badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 flex-1">
                    {course.name}
                  </h3>
                  {course.language && (
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${LANGUAGE_COLORS[course.language] || LANGUAGE_COLORS.general}`}
                    >
                      {course.language}
                    </span>
                  )}
                </div>

                {/* Meta badges */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
                    {course.level || "Beginner"}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
                    {course.noOfChapters} chapters
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      course.status === "published" || course.isPublished
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : course.status === "draft"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                    }`}
                  >
                    {course.status === "published" || course.isPublished
                      ? "Published"
                      : course.status === "draft"
                      ? "Draft"
                      : "Outline"}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-500 line-clamp-2">
                  {course.courseOutput?.description || course.description || "No description"}
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <button
                    onClick={() => navigate(`/workspace/edit-course/${course.courseId}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition-colors border border-white/5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    View / Edit
                  </button>
                  <button
                    onClick={() => handlePublish(course.courseId)}
                    disabled={togglingId === course.courseId}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${
                      course.isPublished
                        ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                        : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/20"
                    } disabled:opacity-50`}
                  >
                    {togglingId === course.courseId ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : course.isPublished ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(course.courseId)}
                    disabled={deletingId === course.courseId}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors border border-red-500/20 disabled:opacity-50"
                  >
                    {deletingId === course.courseId ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourses;
