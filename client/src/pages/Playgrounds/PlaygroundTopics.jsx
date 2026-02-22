import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { PLAYGROUND_DATA } from "../../data/playgroundData";
import {
  getPlaygroundProgress,
  enrollInPlayground,
} from "../../features/playground/playgroundApi";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  Loader2,
  Lock,
  Play,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import toast from "react-hot-toast";

/* ── language metadata ── */
const LANG_META = {
  javascript: {
    title: "JavaScript",
    subtitle: "Master the language of the web",
    img: "/javascript.png",
    accent: "from-yellow-400 to-amber-500",
    accentBg: "bg-yellow-400",
    accentText: "text-yellow-600",
    accentBorder: "border-yellow-400",
    accentRing: "ring-yellow-400/40",
    levelColor: "text-yellow-600",
    levelBg: "bg-yellow-50 border-yellow-300",
  },
  html: {
    title: "HTML",
    subtitle: "Build the structure of the web",
    img: "/html5.png",
    accent: "from-orange-500 to-red-500",
    accentBg: "bg-orange-500",
    accentText: "text-orange-600",
    accentBorder: "border-orange-500",
    accentRing: "ring-orange-400/40",
    levelColor: "text-orange-600",
    levelBg: "bg-orange-50 border-orange-300",
  },
  css: {
    title: "CSS",
    subtitle: "Style and design beautiful interfaces",
    img: "/css.png",
    accent: "from-blue-500 to-indigo-500",
    accentBg: "bg-blue-500",
    accentText: "text-blue-600",
    accentBorder: "border-blue-500",
    accentRing: "ring-blue-400/40",
    levelColor: "text-blue-600",
    levelBg: "bg-blue-50 border-blue-300",
  },
  python: {
    title: "Python",
    subtitle: "Learn the versatile programming language",
    img: "/python1.png",
    accent: "from-green-500 to-emerald-500",
    accentBg: "bg-green-500",
    accentText: "text-green-600",
    accentBorder: "border-green-500",
    accentRing: "ring-green-400/40",
    levelColor: "text-green-600",
    levelBg: "bg-green-50 border-green-300",
  },
};

const PlaygroundTopics = () => {
  const { language } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedProblems, setCompletedProblems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const data = PLAYGROUND_DATA[language?.toLowerCase()];
  const meta = LANG_META[language?.toLowerCase()] || LANG_META.javascript;

  /* ── fetch progress ── */
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { progress } = await getPlaygroundProgress();
        const current = progress.find((p) => p.language === language);
        if (current) {
          setIsEnrolled(true);
          setCompletedProblems(new Set(current.completedProblems));
        }
      } catch (err) {
        console.error("Error fetching progress:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [user, language]);

  /* ── enroll handler ── */
  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setEnrolling(true);
    try {
      await enrollInPlayground(language);
      toast.success("Enrolled! Let's begin 🚀");
      navigate(`/playground/${language}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  /* ── redirect if no data ── */
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Playground Not Found</h1>
          <button
            onClick={() => navigate("/playground")}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg"
          >
            Back to Playgrounds
          </button>
        </div>
      </div>
    );
  }

  /* ── derived stats ── */
  const totalLessons = data.chapters.length;
  const totalExercises = data.chapters.reduce(
    (s, ch) => s + ch.problems.length,
    0,
  );
  const totalXp = data.chapters.reduce((s, ch) => s + ch.totalXp, 0);

  const getChapterStatus = (chapter, idx) => {
    if (!isEnrolled) return "preview";
    const allDone = chapter.problems.every((p) => completedProblems.has(p.id));
    if (allDone) return "completed";
    const anyDone = chapter.problems.some((p) => completedProblems.has(p.id));
    if (anyDone) return "current";
    // Find the first incomplete chapter
    const firstIncomplete = data.chapters.findIndex(
      (ch) => !ch.problems.every((p) => completedProblems.has(p.id)),
    );
    if (idx === firstIncomplete) return "current";
    if (idx < firstIncomplete) return "completed";
    return "locked";
  };

  const completedChapters = data.chapters.filter((ch) =>
    ch.problems.every((p) => completedProblems.has(p.id)),
  ).length;

  if (loading) return <TopicsSkeleton />;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/playground")}
            className="p-1.5 hover:bg-zinc-100 rounded-lg transition text-zinc-500"
          >
            <ChevronLeft size={20} />
          </button>
          <img
            src={meta.img}
            alt={meta.title}
            className="w-7 h-7 object-contain"
          />
          <span className="font-bold text-zinc-800">{meta.title}</span>
          {isEnrolled && (
            <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              {completedChapters}/{totalLessons} Chapters
            </span>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-10">
        {/* ── Left Info Card ── */}
        <div className="lg:w-[320px] shrink-0">
          <div className="sticky top-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border-2 border-zinc-200 p-6 bg-white"
            >
              <div className="flex justify-center mb-4">
                <div className="w-28 h-28 rounded-2xl bg-zinc-50 flex items-center justify-center">
                  <img
                    src={meta.img}
                    alt={meta.title}
                    className="w-20 h-20 object-contain"
                  />
                </div>
              </div>

              <h1 className="text-2xl font-black text-zinc-900 text-center">
                {data.title}
              </h1>
              <p className="text-sm text-zinc-500 text-center mt-2">
                {data.subtitle}
              </p>

              <div className="flex justify-center gap-6 mt-5 text-sm text-zinc-600">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={14} className="text-zinc-400" />
                  {totalLessons} Chapters
                </span>
                <span className="flex items-center gap-1.5">
                  <Star size={14} className="text-zinc-400" />
                  {totalExercises} Exercises
                </span>
              </div>

              {isEnrolled && (
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                    <span>Progress</span>
                    <span>
                      {Math.round((completedChapters / totalLessons) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${meta.accent} transition-all duration-700`}
                      style={{
                        width: `${(completedChapters / totalLessons) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={
                  isEnrolled
                    ? () => navigate(`/playground/${language}`)
                    : handleEnroll
                }
                disabled={enrolling}
                className={`w-full mt-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border-b-4 active:border-b-0 active:mt-[28px] ${
                  isEnrolled
                    ? "bg-yellow-400 hover:bg-yellow-500 border-yellow-600 text-zinc-900"
                    : `bg-gradient-to-r ${meta.accent} text-white border-transparent hover:shadow-lg`
                }`}
              >
                {enrolling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enrolling…
                  </>
                ) : isEnrolled ? (
                  <>
                    <Play size={16} fill="currentColor" />
                    Continue Learning
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Start Learning
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>

        {/* ── Right: Topic Path ── */}
        <div className="flex-1 pt-2">
          {data.chapters.map((chapter, idx) => {
            const status = getChapterStatus(chapter, idx);
            const chapterCompleted = chapter.problems.filter((p) =>
              completedProblems.has(p.id),
            ).length;
            const isLast = idx === data.chapters.length - 1;
            const isSelected = selectedChapter === chapter.id;

            return (
              <div key={chapter.id} className="relative">
                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={`absolute left-[27px] top-[56px] w-[2px] h-[calc(100%-28px)] ${
                      status === "completed"
                        ? `${meta.accentBg}`
                        : status === "current"
                          ? "bg-gradient-to-b from-zinc-300 to-zinc-200"
                          : "bg-zinc-200 border-dashed"
                    }`}
                    style={
                      status !== "completed" && status !== "current"
                        ? {
                            backgroundImage:
                              "repeating-linear-gradient(to bottom, #e4e4e7, #e4e4e7 6px, transparent 6px, transparent 12px)",
                            backgroundColor: "transparent",
                          }
                        : {}
                    }
                  />
                )}

                {/* Chapter Node */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="relative flex gap-4 pb-8"
                >
                  {/* Node Circle */}
                  <button
                    onClick={() =>
                      setSelectedChapter(isSelected ? null : chapter.id)
                    }
                    className={`relative z-10 w-14 h-14 rounded-full shrink-0 flex items-center justify-center transition-all duration-300 ${
                      status === "completed"
                        ? `${meta.accentBg} text-white shadow-md ring-4 ${meta.accentRing}`
                        : status === "current"
                          ? `bg-white border-[3px] ${meta.accentBorder} shadow-lg ring-4 ${meta.accentRing} animate-pulse`
                          : "bg-zinc-100 border-2 border-zinc-200 text-zinc-400"
                    }`}
                  >
                    {status === "completed" ? (
                      <CheckCircle size={24} strokeWidth={2.5} />
                    ) : status === "current" ? (
                      <div
                        className={`w-4 h-4 rounded-sm rotate-45 ${meta.accentBg}`}
                      />
                    ) : status === "preview" ? (
                      <span className="text-lg font-bold text-zinc-400">
                        {idx + 1}
                      </span>
                    ) : (
                      <Lock size={18} />
                    )}
                  </button>

                  {/* Chapter Info */}
                  <div className="flex-1 pt-1">
                    {/* Level badge */}
                    {(status === "current" || (idx === 0 && !isEnrolled)) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`inline-block px-3 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wider mb-2 ${meta.levelBg} ${meta.levelColor}`}
                      >
                        Level {idx + 1}
                      </motion.div>
                    )}

                    <button
                      onClick={() =>
                        setSelectedChapter(isSelected ? null : chapter.id)
                      }
                      className={`block text-left w-full group ${
                        status === "locked"
                          ? "opacity-50 cursor-default"
                          : "cursor-pointer"
                      }`}
                    >
                      <h3
                        className={`font-bold text-base transition-colors ${
                          status === "completed" || status === "current"
                            ? "text-zinc-900"
                            : "text-zinc-500"
                        } ${status !== "locked" ? "group-hover:text-zinc-700" : ""}`}
                      >
                        {chapter.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {chapter.problems.length} exercises · {chapter.totalXp}{" "}
                        XP
                        {isEnrolled &&
                          status !== "locked" &&
                          status !== "preview" && (
                            <span className="ml-2 text-zinc-500">
                              {chapterCompleted}/{chapter.problems.length} done
                            </span>
                          )}
                      </p>
                    </button>

                    {/* Expanded detail panel */}
                    {isSelected && status !== "locked" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 overflow-hidden"
                      >
                        <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4">
                          <p className="text-sm text-zinc-600 mb-3">
                            {chapter.description}
                          </p>
                          <div className="space-y-1.5">
                            {chapter.problems.map((prob) => {
                              const isDone = completedProblems.has(prob.id);
                              return (
                                <div
                                  key={prob.id}
                                  className="flex items-center gap-2.5 text-sm"
                                >
                                  {isDone ? (
                                    <CheckCircle
                                      size={14}
                                      className="text-emerald-500 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300 shrink-0" />
                                  )}
                                  <span
                                    className={
                                      isDone
                                        ? "text-zinc-500 line-through"
                                        : "text-zinc-700"
                                    }
                                  >
                                    {prob.title}
                                  </span>
                                  <span
                                    className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                      prob.difficulty === "Easy"
                                        ? "bg-green-50 text-green-600"
                                        : prob.difficulty === "Medium"
                                          ? "bg-amber-50 text-amber-600"
                                          : "bg-red-50 text-red-600"
                                    }`}
                                  >
                                    {prob.difficulty}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {(isEnrolled || !user) && (
                            <button
                              onClick={() => {
                                if (!user) {
                                  navigate("/login");
                                } else {
                                  navigate(`/playground/${language}`);
                                }
                              }}
                              className={`mt-4 w-full py-2.5 rounded-lg font-bold text-sm text-white bg-gradient-to-r ${meta.accent} hover:shadow-md transition-all`}
                            >
                              {isEnrolled ? "Continue" : "Start"}
                            </button>
                          )}
                          {!isEnrolled && user && (
                            <button
                              onClick={handleEnroll}
                              disabled={enrolling}
                              className={`mt-4 w-full py-2.5 rounded-lg font-bold text-sm text-white bg-gradient-to-r ${meta.accent} hover:shadow-md transition-all`}
                            >
                              {enrolling ? "Enrolling…" : "Start"}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}

          {/* Completion Badge */}
          {isEnrolled && completedChapters === totalLessons && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 py-6 text-center"
            >
              <Trophy className="text-yellow-500" size={28} />
              <span className="text-lg font-bold text-zinc-800">
                Course Completed!
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Skeleton ── */
const TopicsSkeleton = () => (
  <div className="min-h-screen bg-white">
    <div className="max-w-5xl mx-auto px-4 py-24 flex gap-10">
      <div className="w-[320px] shrink-0">
        <div className="h-[380px] bg-zinc-100 rounded-2xl animate-pulse" />
      </div>
      <div className="flex-1 space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-14 h-14 rounded-full bg-zinc-100 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2 pt-2">
              <div className="h-5 bg-zinc-100 rounded w-40 animate-pulse" />
              <div className="h-3 bg-zinc-100 rounded w-60 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PlaygroundTopics;
