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
  Book,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/features/auth/authApi";
import { useDispatch } from "react-redux";
import { grantXP } from "@/utils/gamificationHelper.js";
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
        // Delay showing overlay — if server returns cached data (<800ms), skip overlay entirely
        const overlayTimer = setTimeout(() => setIsGenerating(true), 800);
        try {
          const res = await api.post(
            "http://localhost:8080/api/v1/ai/generate-chapter-content",
            {
              courseId: course.courseId,
              chapter: currentChapter,
              index: currentChapterIndex,
            },
          );
          clearTimeout(overlayTimer);
          // If server returned cached data, no need to show/hide overlay
          if (!res.data.cached) {
            onProgressUpdate(); // Refresh course data with new JSON objects
          } else {
            onProgressUpdate(); // Still refresh to get the object-form topics
          }
        } catch (error) {
          clearTimeout(overlayTimer);
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
    <div className="bg-[#0a0a0a] text-white min-h-screen flex font-space-grotesk">
      <div className="flex-1 flex flex-col w-full min-h-screen">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#111111]/90 /90 backdrop-blur-xl px-6 py-3 shadow-sm ">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#191022]/90 backdrop-blur-sm">
            <div className="text-center flex flex-col items-center">
              <Loader2 className="w-16 h-16 text-red-400 animate-spin mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Building this lesson...
              </h3>
              <p className="text-slate-400">
                Generating pro tips, conceptual cards, and image assets.
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
                {generatingFlashcards ? "Creating..." : "Generate Flashcards"}
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
                <span className="bg-red-600/10 text-red-400 px-4 py-1.5 rounded-full border border-red-500/20 text-sm font-bold mb-6 inline-block">
                  MODULE {currentChapterIndex + 1}
                </span>
                <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight font-space-grotesk">
                  {currentChapter?.chapterName}
                </h1>
              </header>

              <div className="flex flex-col gap-16">
                {topics.map((topicNode, idx) => (
                  <div key={idx} className="space-y-8">
                    {/* Topic Title & Description */}
                    <div className="flex flex-col gap-4">
                      <h2 className="text-2xl font-bold text-white mb-6 font-space-grotesk flex items-center gap-4">
                        <span className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-red-600/20 text-red-400 text-sm border border-red-500/30">
                          {idx + 1}
                        </span>
                        {typeof topicNode === "object"
                          ? topicNode.topic
                          : topicNode}
                      </h2>

                      {/* Render raw HTML content from Gemini */}
                      {topicNode.content && (
                        <div className="prose prose-zinc prose-invert max-w-none 
                        prose-p:text-lg prose-p:leading-relaxed prose-p:text-zinc-300
                        prose-headings:font-space-grotesk prose-headings:text-white
                        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                        prose-a:text-red-400 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-white prose-strong:font-semibold
                        prose-code:text-red-300 prose-code:bg-red-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-[#111111] prose-pre:border prose-pre:border-white/10
                        prose-ul:text-zinc-300 prose-li:marker:text-red-500">
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
                      <div className="bg-gradient-to-r from-red-600/10 to-red-500/5 dark:from-red-600/15 dark:to-red-500/5 border-l-4 border-red-500 p-6 rounded-r-2xl shadow-md shadow-red-500/10">
                        <div className="flex items-start gap-4">
                          <Lightbulb className="text-red-400 w-8 h-8 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-red-400 text-sm uppercase tracking-wider mb-1">
                              Pro Tip
                            </h4>
                            <p className="text-zinc-400 ">{topicNode.proTip}</p>
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
                            className="bg-[#111111] p-6 rounded-2xl border border-white/10 shadow-md shadow-black/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-red-500/30"
                          >
                            {/* Map Gemini icon string to basic Lucide or fallback */}
                            {cidx % 2 === 0 ? (
                              <Server className="text-red-400 mb-3 w-6 h-6" />
                            ) : (
                              <Activity className="text-red-400 mb-3 w-6 h-6" />
                            )}
                            <h5 className="font-bold mb-2">{concept.title}</h5>
                            <p className="text-sm text-zinc-400 ">
                              {concept.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

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
      </div>
    </div>
  );
}
