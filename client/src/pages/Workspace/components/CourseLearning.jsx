import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Rocket,
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
  Lightbulb,
  Server,
  Activity,
  Loader2,
  Sparkles,
  Bot,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/features/auth/authApi";
import { useDispatch } from "react-redux";
import { grantXP } from "../../../../../server/utils/gamificationHelper.js";
import FlashcardViewer from "./FlashcardViewer";
import CourseMentor from "./CourseMentor";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

export default function CourseLearning({
  course,
  enrollment,
  currentChapterIndex,
  onProgressUpdate,
  onNavigate,
}) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isGenerating, setIsGenerating] = useState(false);

  // Flashcard state
  const [flashcards, setFlashcards] = useState([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [flashcardGenStep, setFlashcardGenStep] = useState(0);

  // Mentor chat state
  const [showMentor, setShowMentor] = useState(false);

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

  // Topic and content from standard Chapter schema
  const topics = currentChapter?.topics || [];

  // Calculate Progress
  const totalChapters = course?.noOfChapters || chapters.length || 1;
  const completedChaptersCount = enrollment?.completedChapters?.length || 0;
  const progressPercent = Math.round(
    (completedChaptersCount / totalChapters) * 100,
  );

  // Check if content needs to be generated (if topics array contains strings instead of objects)
  const isContentPending = topics.length > 0 && typeof topics[0] === "string";

  useEffect(() => {
    const generateContent = async () => {
      if (isContentPending && !isGenerating && course?.courseId) {
        setIsGenerating(true);
        try {
          await api.post(
            "http://localhost:8080/api/v1/ai/generate-chapter-content",
            {
              courseId: course.courseId,
              chapter: currentChapter,
              index: currentChapterIndex,
            },
          );
          onProgressUpdate(); // Refresh course data with new JSON objects
        } catch (error) {
          console.error("Failed to generate chapter content:", error);
        } finally {
          setIsGenerating(false);
        }
      }
    };
    generateContent();
  }, [currentChapterIndex, isContentPending, course?.courseId]);

  // Hero image — use Lorem Picsum with a seed based on chapter name for consistency
  // Pollinations AI was returning 530 errors so we switched to a reliable provider
  const chapterSeed =
    currentChapter?.chapterName?.replace(/\s+/g, "-") ||
    `chapter-${currentChapterIndex}`;
  const heroImage = `https://picsum.photos/seed/${encodeURIComponent(chapterSeed)}/1440/720`;

  const [imgError, setImgError] = useState(false);

  // Reset imgError when chapter changes
  useEffect(() => {
    setImgError(false);
  }, [currentChapterIndex]);

  const handleMarkCompleted = async () => {
    if (!enrollment?._id) return;
    try {
      await api.post("http://localhost:8080/api/v1/ai/mark-chapter-completed", {
        enrollmentId: enrollment._id,
        chapterName: currentChapter.chapterName,
        userEmail: user?.email,
      });

      // Grant XP
      await grantXP(dispatch, 150);
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
        "http://localhost:8080/api/v1/ai/generate-flashcards",
        {
          courseId: course?.courseId,
          chapterIndex: currentChapterIndex,
        },
      );

      clearInterval(stepInterval);

      if (res.data.success && res.data.flashcards?.length > 0) {
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
    <div className="bg-slate-100 dark:bg-[#12091b] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-space-grotesk">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-[#8c2bee]/15 bg-white/90 dark:bg-[#160d22]/90 backdrop-blur-xl px-6 py-3 shadow-sm dark:shadow-black/10">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate("overview")}
              className="flex items-center gap-3 text-[#8c2bee] hover:scale-105 transition-transform"
            >
              <Rocket className="w-8 h-8" />
              <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#8c2bee] to-[#b06aff] bg-clip-text text-transparent">
                EduQuest
              </h2>
            </button>
            <div className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => onNavigate("overview")}
                className="text-sm font-medium hover:text-[#8c2bee] transition-colors"
              >
                Dashboard
              </button>
              <button className="text-sm font-medium text-[#8c2bee]">
                Courses
              </button>
              <button className="text-sm font-medium hover:text-[#8c2bee] transition-colors">
                Community
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Gamification Elements */}
            <div className="flex items-center gap-4 bg-[#8c2bee]/10 px-4 py-1.5 rounded-full border border-[#8c2bee]/20">
              <div className="flex items-center gap-1.5">
                <Zap className="text-yellow-500 w-4 h-4" fill="currentColor" />
                <span className="text-sm font-bold">
                  {user?.xp?.toLocaleString() || 0} XP
                </span>
              </div>
              <div className="w-px h-4 bg-[#8c2bee]/30"></div>
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
              <button className="p-2 rounded-full hover:bg-[#8c2bee]/10 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div
                className="w-10 h-10 rounded-full border-2 border-[#8c2bee] overflow-hidden cursor-pointer"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#191022]/90 backdrop-blur-sm">
          <div className="text-center flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-[#8c2bee] animate-spin mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Gemini AI is crafting this lesson...
            </h3>
            <p className="text-slate-400">
              Generating pro tips, conceptual cards, and image assets.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto w-full flex-1 flex gap-0 lg:gap-8 p-0 lg:p-6 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col w-80 shrink-0 gap-5">
          <div className="bg-white dark:bg-[#1e1230] rounded-2xl border border-slate-200/80 dark:border-[#8c2bee]/15 p-5 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-1">Course Progress</h3>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-500 dark:text-slate-400">
                  {completedChaptersCount}/{totalChapters} Lessons
                </span>
                <span className="font-bold text-[#8c2bee]">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#8c2bee]/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8c2bee]"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-2">
                {course?.name}
              </p>

              {chapters.map((chap, idx) => {
                const isCompleted = enrollment?.completedChapters?.includes(
                  chap.chapterName,
                );
                const isActive = idx === currentChapterIndex;
                const isLocked =
                  idx > enrollment?.completedChapters?.length &&
                  !isCompleted &&
                  !isActive;

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
                        ? "bg-[#8c2bee] text-white shadow-lg shadow-[#8c2bee]/20"
                        : isLocked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-[#8c2bee]/10 text-slate-900 dark:text-slate-100",
                    )}
                  >
                    <IconClass
                      className={cn(
                        "w-5 h-5",
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-[#8c2bee]",
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
                    {isCompleted && (
                      <CheckCircle2 className="text-green-500 w-4 h-4 ml-auto" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Helpful Resources Card */}
          <div className="bg-white dark:bg-[#1e1230] border border-slate-200/80 dark:border-[#8c2bee]/15 rounded-2xl p-5 shadow-md shadow-slate-200/50 dark:shadow-black/20">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
              <BookOpen className="text-[#8c2bee] w-5 h-5" />
              Resources
            </h4>
            <ul className="text-xs space-y-2 text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2 hover:text-[#8c2bee] cursor-pointer">
                <Paperclip className="w-4 h-4" /> Course Spec.pdf
              </li>
              <li className="flex items-center gap-2 hover:text-[#8c2bee] cursor-pointer">
                <LinkIcon className="w-4 h-4" /> Official Documentation
              </li>
            </ul>
          </div>

          {/* ⚡ Flashcards Button */}
          <button
            onClick={handleGenerateFlashcards}
            disabled={generatingFlashcards}
            className="w-full flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#8c2bee] to-[#6b1fb8] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#8c2bee]/30 hover:shadow-xl hover:shadow-[#8c2bee]/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            <CreditCard className="w-5 h-5" />
            <span className="flex-1 text-left">
              {generatingFlashcards ? "Generating..." : "Generate Flashcards"}
            </span>
            <Sparkles className="w-4 h-4 opacity-60" />
          </button>

          {/* 🤖 AI Mentor Button */}
          <button
            onClick={() => setShowMentor(true)}
            className="w-full flex items-center gap-3 px-5 py-4 bg-white dark:bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-2xl font-bold text-sm hover:-translate-y-0.5 transition-all active:scale-[0.98] shadow-md shadow-slate-200/50 dark:shadow-black/20 hover:shadow-lg"
          >
            <Bot className="w-5 h-5" />
            <span className="flex-1 text-left">AI Mentor</span>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
              LIVE
            </span>
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white dark:bg-[#160d22] lg:rounded-2xl border border-slate-200/80 dark:border-[#8c2bee]/15 overflow-y-auto flex flex-col shadow-xl shadow-slate-200/50 dark:shadow-black/30">
          {/* Hero Image Section */}
          <div className="relative h-72 w-full bg-slate-300 dark:bg-slate-800 overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 dark:from-[#12091b] via-[#8c2bee]/20 to-transparent z-10"></div>
            {!imgError ? (
              <img
                src={heroImage}
                alt={currentChapter?.chapterName || "Chapter hero"}
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
                onError={() => setImgError(true)}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#8c2bee]/30 to-[#12091b] flex items-center justify-center">
                <BookOpen className="w-20 h-20 text-white/20" />
              </div>
            )}
            <div className="absolute bottom-8 left-8 z-20">
              <span className="bg-[#8c2bee] px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest text-white mb-2 inline-block">
                Module {currentChapterIndex + 1}
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-none drop-shadow-md">
                {currentChapter?.chapterName}
              </h1>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8 lg:p-12 max-w-4xl overflow-y-auto">
            <div className="flex flex-col gap-10">
              {topics.map((topicNode, idx) => (
                <div key={idx} className="space-y-8">
                  {/* Topic Title & Description */}
                  <div className="flex flex-col gap-4">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      {typeof topicNode === "object"
                        ? topicNode.topic
                        : topicNode}
                    </h2>

                    {/* Render raw HTML content from Gemini */}
                    {topicNode.content && (
                      <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-lg prose-headings:font-space-grotesk prose-a:text-[#8c2bee]">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: topicNode.content,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Pro Tip Callout */}
                  {topicNode.proTip && (
                    <div className="bg-gradient-to-r from-[#8c2bee]/10 to-[#8c2bee]/5 dark:from-[#8c2bee]/15 dark:to-[#8c2bee]/5 border-l-4 border-[#8c2bee] p-6 rounded-r-2xl shadow-md shadow-[#8c2bee]/10">
                      <div className="flex items-start gap-4">
                        <Lightbulb className="text-[#8c2bee] w-8 h-8 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-[#8c2bee] text-sm uppercase tracking-wider mb-1">
                            Pro Tip
                          </h4>
                          <p className="text-slate-600 dark:text-slate-300">
                            {topicNode.proTip}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Concept Cards Grid */}
                  {topicNode.keyConcepts?.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {topicNode.keyConcepts.map((concept, cidx) => (
                        <div
                          key={cidx}
                          className="bg-slate-50 dark:bg-[#1e1230] p-6 rounded-2xl border border-slate-200/80 dark:border-[#8c2bee]/15 shadow-md shadow-slate-200/50 dark:shadow-black/20 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-[#8c2bee]/30"
                        >
                          {/* Map Gemini icon string to basic Lucide or fallback */}
                          {cidx % 2 === 0 ? (
                            <Server className="text-[#8c2bee] mb-3 w-6 h-6" />
                          ) : (
                            <Activity className="text-[#8c2bee] mb-3 w-6 h-6" />
                          )}
                          <h5 className="font-bold mb-2">{concept.title}</h5>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {concept.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Footer Action */}
              <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-[#8c2bee]/15 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      currentChapterIndex > 0
                        ? onNavigate(currentChapterIndex - 1)
                        : onNavigate("overview")
                    }
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#8c2bee] transition-colors"
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
                    className="bg-gradient-to-r from-[#8c2bee] to-[#6b1fb8] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-[#8c2bee]/30 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#8c2bee]/40 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:grayscale disabled:hover:translate-y-0 disabled:hover:shadow-xl"
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
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#8c2bee] transition-colors"
                  >
                    {currentChapterIndex < chapters.length - 1
                      ? "Next Lesson"
                      : "Finish Course"}
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
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

      {/* AI Mentor Chat Panel */}
      {showMentor && (
        <CourseMentor
          courseId={course?.courseId}
          chapterIndex={currentChapterIndex}
          chapterName={currentChapter?.chapterName}
          onClose={() => setShowMentor(false)}
        />
      )}
    </div>
  );
}
