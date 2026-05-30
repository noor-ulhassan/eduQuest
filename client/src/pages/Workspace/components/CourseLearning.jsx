import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Zap,
  Flame,
  Bell,
  CheckCircle2,
  Info,
  Cpu,
  Layers,
  HelpCircle,
  BookOpen,
  Paperclip,
  Link as LinkIcon,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CreditCard,
  Play,
  Terminal,
  Gamepad2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/features/auth/authApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUserStats } from "@/features/auth/authSlice";
import { emit } from "@/lib/gamificationBus";
import FlashcardViewer from "./FlashcardViewer";
import CourseMentor from "./CourseMentor";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import SlideshowPlayer from "./SlideshowPlayer";
import BlockRenderer from "./BlockRenderer";
import { getChaptersByCourse } from "@/features/workspace/courseApi";
import { getCurriculum } from "@/features/playground/playgroundApi";
import { setPlaygroundTask } from "@/features/playground/playgroundTaskSlice";

export default function CourseLearning({
  course,
  enrollment,
  currentChapterIndex,
  onProgressUpdate,
  onNavigate,
}) {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isGenerating, setIsGenerating] = useState(false);
  const [chapterBlocks, setChapterBlocks] = useState(null);
  const [linkedProblems, setLinkedProblems] = useState([]);
  const [linkedByChapter, setLinkedByChapter] = useState({});

  // Flashcard state
  const [flashcards, setFlashcards] = useState([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [flashcardGenStep, setFlashcardGenStep] = useState(0);

  // Mentor chat state
  const [showMentor, setShowMentor] = useState(false);

  // Slideshow modal state
  const [showSlideshow, setShowSlideshow] = useState(false);

  // Flashcard loader steps
  const flashcardLoadingStates = [
    { text: "Analyzing chapter content..." },
    { text: "Extracting key concepts..." },
    { text: "Generating flashcard pairs..." },
    { text: "Polishing hints & answers..." },
    { text: "Almost ready..." },
  ];

  const courseLayout = course?.courseOutput;
  const chapters = courseLayout?.chapters || [];
  const currentChapter = chapters[currentChapterIndex];

  // Calculate Progress
  const totalChapters = course?.noOfChapters || chapters.length || 1;
  const completedChaptersCount = enrollment?.completedChapters?.length || 0;
  const progressPercent = Math.round(
    (completedChaptersCount / totalChapters) * 100,
  );

  // Load Chapter blocks when course changes
  useEffect(() => {
    if (!course?.courseId) return;
    let cancelled = false;
    getChaptersByCourse(course.courseId)
      .then((allChapters) => {
        if (cancelled) return;
        const chap = allChapters.find(
          (c) => c.chapterNumber === currentChapterIndex + 1,
        );
        setChapterBlocks(chap?.blocks?.length > 0 ? chap.blocks : null);
      })
      .catch(() => setChapterBlocks(null));
    return () => { cancelled = true; };
  }, [course?.courseId, currentChapterIndex]);

  const hasBlocks = Array.isArray(chapterBlocks) && chapterBlocks.length > 0;

  const handleOpenInPlayground = (block) => {
    dispatch(setPlaygroundTask(block));
    navigate(`/playground/${course.linkedPlayground || "python"}`);
  };

  const handlePracticeLinkedProblem = (problem) => {
    dispatch(setPlaygroundTask(problem));
    navigate(`/playground/${course?.linkedPlayground || "python"}?problem=${problem.id}`);
  };

  // Load ALL linked curriculum problems for this course once, grouped by chapterIndex
  useEffect(() => {
    const lang = course?.linkedPlayground;
    if (!course?.courseId || !lang) {
      setLinkedByChapter({});
      setLinkedProblems([]);
      return;
    }
    let cancelled = false;
    getCurriculum(lang)
      .then((res) => {
        if (cancelled) return;
        const allProblems = (res?.curriculum?.chapters || []).flatMap((ch) => ch.problems || []);
        const grouped = {};
        allProblems.forEach((p) => {
          if (p.courseChapterLink?.courseId === course.courseId && p.courseChapterLink?.chapterIndex != null) {
            const ci = p.courseChapterLink.chapterIndex;
            if (!grouped[ci]) grouped[ci] = [];
            grouped[ci].push(p);
          }
        });
        setLinkedByChapter(grouped);
        setLinkedProblems(grouped[currentChapterIndex] || []);
      })
      .catch(() => { setLinkedByChapter({}); setLinkedProblems([]); });
    return () => { cancelled = true; };
  }, [course?.courseId, course?.linkedPlayground]);

  // Swap current chapter's problems when navigating
  useEffect(() => {
    setLinkedProblems(linkedByChapter[currentChapterIndex] || []);
  }, [currentChapterIndex, linkedByChapter]);

  // Hero image — use Lorem Picsum with a seed based on chapter name for consistency
  // Pollinations AI was returning 530 errors so we switched to a reliable provider
  const chapterSeed =
    currentChapter?.chapterName?.replace(/\s+/g, "-") ||
    `chapter-${currentChapterIndex}`;
  const heroImage = `https://picsum.photos/seed/${encodeURIComponent(chapterSeed)}/1440/720`;

  const [imgError, setImgError] = useState(false);

  // Reset imgError and close slideshow when chapter changes
  useEffect(() => {
    setImgError(false);
    setShowSlideshow(false);
  }, [currentChapterIndex]);

  const handleMarkCompleted = async () => {
    if (!enrollment?._id) return;
    try {
      const response = await api.post("/ai/mark-chapter-completed", {
        enrollmentId: enrollment._id,
        chapterName: currentChapter.chapterName,
        userEmail: user?.email,
      });

      if (response?.data?.user) {
        const prevUser = user;
        dispatch(updateUserStats(response.data.user));
        emit({ type: "xp", amount: response.data.xpAwarded });
        if (response.data.user.level > (prevUser?.level ?? 0)) {
          emit({ type: "levelUp", level: response.data.user.level });
        }
        if (response.data.user.league !== prevUser?.league) {
          emit({ type: "rankUp", league: response.data.user.league });
        }
        const prevBadges = prevUser?.badges ?? [];
        (response.data.user.badges ?? [])
          .filter((b) => !prevBadges.find((pb) => pb.title === b.title))
          .forEach((b) => emit({ type: "badge", ...b }));
      }

      onProgressUpdate();

      // Auto-advance if not final
      if (currentChapterIndex < chapters.length - 1) {
        onNavigate(currentChapterIndex + 1);
      } else {
        onNavigate("overview"); // go back
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  // Generate flashcards for the current chapter
  const handleGenerateFlashcards = async () => {
    setGeneratingFlashcards(true);
    setFlashcardGenStep(0);
    try {
      // Animate through steps while API call is in flight
      const stepInterval = setInterval(() => {
        setFlashcardGenStep((prev) =>
          prev < flashcardLoadingStates.length - 1 ? prev + 1 : prev,
        );
      }, 2500);

      const res = await api.post(
        "/ai/generate-flashcards",
        {
          courseId: course?.courseId,
          chapterIndex: currentChapterIndex,
        },
      );

      clearInterval(stepInterval);

      if (res.success && res.data.flashcards?.length > 0) {
        setFlashcards(res.data.flashcards);
        setGeneratingFlashcards(false);
        setShowFlashcards(true);
      } else {
        setGeneratingFlashcards(false);
        console.error("No flashcards returned");
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      setGeneratingFlashcards(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen flex font-space-grotesk">
      <div className="flex-1 flex flex-col w-full min-h-screen">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#111111]/90 backdrop-blur-xl px-6 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button
                onClick={() => onNavigate("overview")}
                className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
              <div className="hidden lg:flex items-center gap-6">
                <h2 className="text-xl font-bold tracking-tight text-white line-clamp-1">
                  {course?.name || "Course Content"}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Gamification Elements */}
              <div className="flex items-center gap-4 bg-red-600/10 px-4 py-1.5 rounded-full border border-red-500/20">
                <div className="flex items-center gap-1.5">
                  <Zap
                    className="text-yellow-500 w-4 h-4"
                    fill="currentColor"
                  />
                  <span className="text-sm font-bold">
                    {user?.xp?.toLocaleString() || 0} XP
                  </span>
                </div>
                <div className="w-px h-4 bg-red-600/30"></div>
                <div className="flex items-center gap-1.5">
                  <Flame
                    className="text-orange-500 w-4 h-4"
                    fill="currentColor"
                  />
                  <span className="text-sm font-bold">
                    {user?.dayStreak || 0} Days
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="p-2 rounded-full hover:bg-red-600/10 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <div
                  className="w-10 h-10 rounded-full border-2 border-red-500 overflow-hidden cursor-pointer"
                  onClick={() => onNavigate("overview")}
                >
                  <img
                    src={
                      user?.avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?._id}`
                    }
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Full-screen Loading Overlay for Auto-Generation */}
        {isGenerating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]/95 backdrop-blur-sm">
            <div className="text-center flex flex-col items-center">
              <Loader2 className="w-16 h-16 text-red-400 animate-spin mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Generating content...
              </h3>
              <p className="text-zinc-400">
                Preparing chapter content, key concepts, and assets.
              </p>
            </div>
          </div>
        )}

        <div className="max-w-[1440px] mx-auto w-full flex-1 flex gap-0 lg:gap-8 p-0 lg:p-6 items-start">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:flex flex-col w-80 shrink-0 gap-5 sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl no-scrollbar">
            <div className="bg-[#111111] rounded-2xl border border-white/10 p-5 shadow-lg shadow-black/50 ">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1">Course Progress</h3>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-zinc-400 ">
                    {completedChaptersCount}/{totalChapters} Lessons
                  </span>
                  <span className="font-bold text-red-400">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2 bg-red-600/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <nav className="flex flex-col gap-1">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2 ml-2">
                  {course?.name}
                </p>

                {chapters.map((chap, idx) => {
                  const isCompleted = enrollment?.completedChapters?.includes(
                    chap.chapterName,
                  );
                  const isActive = idx === currentChapterIndex;
                  // Unlock all lessons for open exploration
                  const isLocked = false;

                  // Icon mapping
                  let IconClass = Info;
                  if (idx === 1) IconClass = Cpu;
                  if (idx === 2) IconClass = Layers;
                  if (idx === chapters.length - 1) IconClass = HelpCircle;

                  return (
                    <button
                      key={idx}
                      onClick={() => !isLocked && onNavigate(idx)}
                      disabled={isLocked}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group text-left w-full",
                        isActive
                          ? "bg-red-600 text-white shadow-lg shadow-[#8c2bee]/20"
                          : isLocked
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-red-600/10 text-white ",
                      )}
                    >
                      <IconClass
                        className={cn(
                          "w-5 h-5",
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-red-400",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium line-clamp-1 flex-1",
                          isActive && "font-bold",
                        )}
                      >
                        {chap.chapterName}
                      </span>
                      {linkedByChapter[idx]?.length > 0 && (
                        <span className={cn(
                          "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                          isActive ? "bg-white/20 text-white" : "bg-indigo-500/20 text-indigo-400"
                        )}>
                          <Gamepad2 className="w-3 h-3" />
                          {linkedByChapter[idx].length}
                        </span>
                      )}
                      {isCompleted && (
                        <CheckCircle2 className="text-green-500 w-4 h-4 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Helpful Resources Card */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-md shadow-black/50 ">
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                <BookOpen className="text-red-400 w-5 h-5" />
                Resources
              </h4>
              <ul className="text-xs space-y-2 text-zinc-400 ">
                <li className="flex items-center gap-2 hover:text-red-400 cursor-pointer">
                  <Paperclip className="w-4 h-4" /> Course Spec.pdf
                </li>
                <li className="flex items-center gap-2 hover:text-red-400 cursor-pointer">
                  <LinkIcon className="w-4 h-4" /> Official Documentation
                </li>
              </ul>
            </div>

            {/* ⚡ Flashcards Button */}
            <button
              onClick={handleGenerateFlashcards}
              disabled={generatingFlashcards}
              className="w-full flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
            >
              <CreditCard className="w-5 h-5" />
              <span className="flex-1 text-left">
                {generatingFlashcards ? "Loading..." : "Generate Flashcards"}
              </span>
            </button>

            {/* Course Guide Button */}
            <button
              onClick={() => setShowMentor(true)}
              className="w-full flex items-center gap-3 px-5 py-4 bg-[#111111] dark:bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-2xl font-bold text-sm hover:-translate-y-0.5 transition-all active:scale-[0.98] shadow-md shadow-black/50 hover:shadow-lg"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="flex-1 text-left">Course Guide</span>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                LIVE
              </span>
            </button>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-[#111111] lg:rounded-2xl border border-white/10 flex flex-col shadow-xl shadow-black/50 mb-20">
            
            {/* Article Content */}
            <article className="py-12 px-8 lg:px-12 max-w-3xl mx-auto w-full font-sans">
              <header className="mb-16 border-b border-white/10 pb-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="bg-red-600/10 text-red-400 px-4 py-1.5 rounded-full border border-red-500/20 text-sm font-bold mb-6 inline-block">
                      MODULE {currentChapterIndex + 1}
                    </span>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight font-space-grotesk">
                      {currentChapter?.chapterName}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 mt-2">
                    <button
                      onClick={() => setShowSlideshow(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-500/20 hover:-translate-y-0.5 active:scale-95"
                    >
                      <Play className="w-4 h-4" fill="currentColor" />
                      Play Chapter
                    </button>
                    {course?.linkedPlayground && (
                      <button
                        onClick={() => navigate(`/playground/${course.linkedPlayground}`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition-all"
                      >
                        <Terminal className="w-4 h-4" />
                        Practice
                      </button>
                    )}
                  </div>
                </div>
              </header>

              <div className="flex flex-col gap-16">
                {hasBlocks ? (
                  <BlockRenderer
                    blocks={chapterBlocks}
                    chapterIndex={currentChapterIndex}
                    onOpenInPlayground={handleOpenInPlayground}
                  />
                ) : (
                  <div className="py-16 text-center text-zinc-500 italic bg-[#0f0f0f] rounded-2xl border border-white/5">
                    Chapter content is loading…
                  </div>
                )}
              </div>

              {/* Linked Practice Problems */}
              {linkedProblems.length > 0 && (
                <div className="mt-12 border border-indigo-500/30 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 bg-indigo-950/60 border-b border-indigo-500/20 flex items-center gap-3">
                    <Gamepad2 className="w-5 h-5 text-indigo-400" />
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-white">Practice This Chapter</h3>
                      <p className="text-xs text-indigo-400/70 mt-0.5 capitalize">
                        {linkedProblems.length} {linkedProblems.length === 1 ? "activity" : "activities"} · {course?.linkedPlayground} playground
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col divide-y divide-white/5 bg-indigo-950/20">
                    {linkedProblems.map((prob, i) => (
                      <div key={prob.id} className="flex items-center gap-4 px-6 py-4 hover:bg-indigo-950/30 transition-colors">
                        <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">{prob.title}</p>
                          {prob.description && (
                            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{prob.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            prob.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            prob.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            prob.difficulty === "Hard" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                            "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          }`}>{prob.difficulty}</span>
                          <span className="text-xs font-bold text-[#2cf07d]">+{prob.xp} XP</span>
                          <button
                            onClick={() => handlePracticeLinkedProblem(prob)}
                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                          >
                            <Play className="w-3 h-3 fill-white" /> Solve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Action */}
              <div className="mt-20 pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      currentChapterIndex > 0
                        ? onNavigate(currentChapterIndex - 1)
                        : onNavigate("overview")
                    }
                    className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous Lesson
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleMarkCompleted}
                    disabled={enrollment?.completedChapters?.includes(
                      currentChapter?.chapterName,
                    )}
                    className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-red-500/20 hover:-translate-y-0.5 hover:shadow-2xl transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:grayscale disabled:hover:translate-y-0 disabled:hover:shadow-xl"
                  >
                    {enrollment?.completedChapters?.includes(
                      currentChapter?.chapterName,
                    )
                      ? "Lesson Completed"
                      : "Mark Lesson Complete"}
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      currentChapterIndex < chapters.length - 1
                        ? onNavigate(currentChapterIndex + 1)
                        : onNavigate("overview")
                    }
                    className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    {currentChapterIndex < chapters.length - 1
                      ? "Next Lesson"
                      : "Finish Course"}
                    <ArrowRight className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>
              </div>
            </article>
          </main>
        </div>

        {/* Multi-Step Loader for Flashcard Generation */}
        <MultiStepLoader
          loadingStates={flashcardLoadingStates}
          loading={generatingFlashcards}
          duration={999999}
          loop={false}
          value={flashcardGenStep}
        />

        {/* Flashcard Viewer Modal */}
        {showFlashcards && flashcards.length > 0 && (
          <FlashcardViewer
            flashcards={flashcards}
            onClose={() => setShowFlashcards(false)}
          />
        )}

        {/* Course Guide Chat Panel */}
        {showMentor && (
          <CourseMentor
            courseId={course?.courseId}
            chapterIndex={currentChapterIndex}
            chapterName={currentChapter?.chapterName}
            onClose={() => setShowMentor(false)}
          />
        )}

        {/* Slideshow Player Modal */}
        {showSlideshow && (
          <SlideshowPlayer
            chapter={currentChapter}
            onClose={() => setShowSlideshow(false)}
          />
        )}
      </div>
    </div>
  );
}
