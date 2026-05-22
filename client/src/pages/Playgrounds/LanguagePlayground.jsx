import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Loader2, MessageCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { trackLinkedAttempt } from "../../features/playground/playgroundApi";

import { getLanguageIconUrl } from "./utils/playgroundUtils";
import { usePlaygroundData } from "./hooks/usePlaygroundData";
import { useCodeExecution } from "./hooks/useCodeExecution";

import PlaygroundNavbar from "./components/PlaygroundNavbar";
import PlaygroundSidebar from "./components/PlaygroundSidebar";
import RightSidebar from "./components/RightSidebar";
import MobileHeader from "./components/MobileHeader";
import MobileBottomBar from "./components/MobileBottomBar";
import LessonBadge from "./components/LessonBadge";
import CourseTaskBanner from "./components/CourseTaskBanner";
import TaskCard from "./components/TaskCard";
import HintsPanel from "./components/HintsPanel";
import CodeEditor from "./components/CodeEditor";
import LivePreview from "./components/LivePreview";
import OutputPanel from "./components/OutputPanel";
import TaskTestResults from "./components/TaskTestResults";
import NextLessonBanner from "./components/NextLessonBanner";
import InteractiveProblem from "./components/InteractiveProblem";
import DiscussionPanel from "./components/discussion/DiscussionPanel";
import SessionCompletionOverlay from "./components/SessionCompletionOverlay";

const LanguagePlayground = () => {
  const { language } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const user = useSelector((state) => state.auth.user);
  const activeTask = useSelector((state) => state.playgroundTask?.activeTask ?? null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isSidebarCompact, setIsSidebarCompact] = useState(true);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [dsaLang, setDsaLang] = useState("javascript");
  const [sessionXP, setSessionXP] = useState(0);
  const [sessionSolved, setSessionSolved] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  const iframeRef = useRef(null);

  const {
    data, currentProblem, completedProblems, setCompletedProblems,
    expandedChapterId, setExpandedChapterId, isLoadingProgress, selectProblem,
    totalProblems, completedCount, progressPercent,
    currentChapterIdx, currentProblemIdx,
    executionMode, editorLang, fileName,
  } = usePlaygroundData({
    user, language, location, dsaLang,
    setCode: (v) => exec.setCode(v),
    setOutput: (v) => exec.setOutput(v),
    setTestResult: (v) => exec.setTestResult(v),
    setShowCompletion,
  });

  const isLivePreview = executionMode === "livepreview";
  const isReact = executionMode === "react";

  const exec = useCodeExecution({
    language, currentProblem, isLivePreview, isReact, executionMode,
    dsaLang, data, iframeRef, activeTask,
    setCompletedProblems, setSessionXP, setSessionSolved,
  });

  useEffect(() => { if (isMobile) setIsSidebarOpen(false); }, [isMobile]);

  const goToNextProblem = useCallback(() => {
    if (!data) return;
    const allProblems = data.chapters.flatMap((ch) => ch.problems);
    const next = allProblems[allProblems.findIndex((p) => p.id === currentProblem?.id) + 1];
    if (next) selectProblem(next);
    else toast.success("You've completed all problems in this course!");
  }, [data, currentProblem, selectProblem]);

  if (isLoadingProgress) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#111111] border border-white/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
          <p className="text-white font-semibold text-base capitalize">{language} Playground</p>
          <p className="text-zinc-500 text-sm">Loading your progress…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-6">
        <div className="w-full max-w-md border border-white/10 bg-[#111111] rounded-2xl p-8 text-center space-y-4">
          <h1 className="text-2xl font-semibold text-white">Language Not Found</h1>
          <p className="text-sm text-zinc-400">The playground for &quot;{language}&quot; is not available yet.</p>
          <button onClick={() => navigate("/playground")} className="bg-red-600 hover:bg-red-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors">
            Back to Playgrounds
          </button>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-red-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen min-h-dvh bg-[#0a0a0a] text-white overflow-hidden">

      {!isMobile && (
        <PlaygroundNavbar
          isSidebarCompact={isSidebarCompact} setIsSidebarCompact={setIsSidebarCompact}
          language={language} getLanguageIconUrl={getLanguageIconUrl} user={user}
          sessionXP={sessionXP} sessionSolved={sessionSolved}
          currentChapterIdx={currentChapterIdx} currentProblemIdx={currentProblemIdx}
          progressPercent={progressPercent} onBackToHub={() => navigate("/playground")}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        <PlaygroundSidebar
          isMobile={isMobile} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
          isSidebarCompact={isSidebarCompact} setIsSidebarCompact={setIsSidebarCompact}
          language={language} getLanguageIconUrl={getLanguageIconUrl} data={data}
          progressPercent={progressPercent} completedCount={completedCount} totalProblems={totalProblems}
          currentProblem={currentProblem} completedProblems={completedProblems}
          expandedChapterId={expandedChapterId} setExpandedChapterId={setExpandedChapterId}
          selectProblem={selectProblem}
        />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {isMobile && (
            <MobileHeader title={data.title} xp={currentProblem?.xp} progressPercent={progressPercent} />
          )}

          <div className="flex-1 overflow-y-auto thin-scroll">
            <div className={cn("mx-auto space-y-5", isMobile ? "px-4 py-4" : "max-w-4xl px-8 py-8")}>

              <CourseTaskBanner activeTask={activeTask} />

              {!isMobile && !activeTask && (
                <LessonBadge
                  chapterIdx={currentChapterIdx} problemIdx={currentProblemIdx}
                  xp={currentProblem?.xp} isSolved={completedProblems.has(currentProblem?.id)}
                />
              )}

              <h1 className={cn("font-bold text-metallic leading-tight", isMobile ? "text-xl mb-4" : "text-3xl mb-6")}>
                {currentProblem?.title}
              </h1>

              <TaskCard currentProblem={currentProblem} isMobile={isMobile} />

              <HintsPanel
                hints={currentProblem?.hints} showHints={exec.showHints}
                setShowHints={exec.setShowHints} isMobile={isMobile}
              />

              {currentProblem?.type === "interactive" ? (
                <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden p-1">
                  <InteractiveProblem
                    key={currentProblem.id}
                    problem={currentProblem}
                    onSolve={exec.handleInteractiveSolve}
                    isAlreadySolved={completedProblems.has(currentProblem.id)}
                    onAttempt={
                      currentProblem.courseChapterLink?.courseId
                        ? (correct) => trackLinkedAttempt({
                            exerciseId: currentProblem.id,
                            courseId: currentProblem.courseChapterLink.courseId,
                            chapterIndex: currentProblem.courseChapterLink.chapterIndex,
                            passed: correct,
                          }).catch(() => {})
                        : undefined
                    }
                  />
                </div>
              ) : (
                <CodeEditor
                  code={exec.code} setCode={exec.setCode}
                  editorLang={editorLang} fileName={fileName}
                  isMobile={isMobile} isRunning={exec.isRunning} testResult={exec.testResult}
                  executionMode={executionMode} currentProblem={currentProblem}
                  dsaLang={dsaLang} setDsaLang={setDsaLang}
                  setOutput={exec.setOutput} setTestResult={exec.setTestResult}
                  resetCode={exec.resetCode} handleRunCode={exec.handleRunCode}
                  goToNextProblem={goToNextProblem}
                />
              )}

              {(isLivePreview || isReact) && currentProblem?.type !== "interactive" && (
                <LivePreview iframeRef={iframeRef} testResult={exec.testResult} isMobile={isMobile} />
              )}

              {isReact && !isLivePreview && (
                <iframe ref={iframeRef} className="hidden" title="React Runner" sandbox="allow-scripts allow-same-origin" />
              )}

              {!isLivePreview && !isReact && currentProblem?.type !== "interactive" && (
                <OutputPanel output={exec.output} testResult={exec.testResult} isRunning={exec.isRunning} currentProblem={currentProblem} />
              )}

              {activeTask && (
                <TaskTestResults
                  handleRunTask={exec.handleRunTask}
                  isRunningTask={exec.isRunningTask}
                  taskTestResults={exec.taskTestResults}
                />
              )}

              <div className="mt-4">
                <button
                  onClick={() => setShowDiscussion(!showDiscussion)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-semibold transition-colors px-4 py-2.5 rounded-xl border",
                    showDiscussion
                      ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/10",
                  )}
                >
                  <MessageCircle className="w-4 h-4" /> Discussion
                </button>
                {showDiscussion && (
                  <div className="mt-3 rounded-xl border border-white/10 overflow-hidden h-[500px]">
                    <DiscussionPanel language={language} problemId={currentProblem?.id} problemTitle={currentProblem?.title} />
                  </div>
                )}
              </div>

              {completedProblems.has(currentProblem?.id) && (
                <NextLessonBanner onNext={goToNextProblem} />
              )}
            </div>
          </div>

          {isMobile && currentProblem?.type !== "interactive" && (
            <MobileBottomBar
              isRunning={exec.isRunning} testResult={exec.testResult}
              handleRunCode={exec.handleRunCode} goToNextProblem={goToNextProblem}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          )}
        </div>

        {!isMobile && (
          <RightSidebar
            user={user} data={data} currentProblem={currentProblem}
            completedProblems={completedProblems} sessionXP={sessionXP} sessionSolved={sessionSolved}
            progressPercent={progressPercent} completedCount={completedCount}
            totalProblems={totalProblems} selectProblem={selectProblem}
          />
        )}
      </div>

      <AnimatePresence>
        {showCompletion && (
          <SessionCompletionOverlay
            language={language} totalXP={sessionXP} solved={sessionSolved}
            onClose={() => setShowCompletion(false)}
            onNavigate={() => { setShowCompletion(false); navigate("/playground"); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguagePlayground;
