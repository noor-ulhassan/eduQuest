import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Loader2, MessageCircle, Terminal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [isSidebarCompact, setIsSidebarCompact] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
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
    user, language, location,
    setCode: (v) => exec.setCode(v),
    setOutput: (v) => exec.setOutput(v),
    setTestResult: (v) => exec.setTestResult(v),
    setShowCompletion,
  });

  const isLivePreview = executionMode === "livepreview";
  const isReact = executionMode === "react";

  const exec = useCodeExecution({
    language, currentProblem, isLivePreview, isReact, executionMode,
    data, iframeRef, activeTask,
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
        <div className="flex flex-col items-center gap-6 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #141414, #111111)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {getLanguageIconUrl?.(language) ? (
              <img
                src={getLanguageIconUrl(language)}
                alt={language}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <Terminal className="w-9 h-9 text-red-400" />
            )}
            {/* Animated border */}
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-2xl"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                border: "1px solid rgba(239,68,68,0.35)",
                boxShadow: "inset 0 0 20px rgba(239,68,68,0.08)",
              }}
            />
          </div>
          <div className="space-y-1">
            <p className="text-metallic font-bold text-base capitalize">{language} Playground</p>
            <p className="text-zinc-600 text-[12px] font-mono tracking-wider">Loading your progress…</p>
          </div>
          {/* Three-dot loader */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-red-500"
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
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
          <motion.button
            onClick={() => navigate("/playground")}
            whileHover={{ scale: 1.03 }}
            className="text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors"
            style={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              boxShadow: "0 2px 14px rgba(239,68,68,0.32)",
            }}
          >
            Back to Playgrounds
          </motion.button>
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
    <div 
      className="flex flex-col h-screen min-h-dvh text-white overflow-hidden"
      style={{ background: "radial-gradient(circle at 50% -20%, #1a1a1a 0%, #050505 100%)" }}
    >

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

              <motion.h1
                key={currentProblem?.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={cn("font-bold text-metallic leading-tight", isMobile ? "text-xl mb-4" : "text-3xl mb-6")}
              >
                {currentProblem?.title}
              </motion.h1>

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
                <motion.button
                  onClick={() => setShowDiscussion(!showDiscussion)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-all px-4 py-2.5 rounded-xl border"
                  style={
                    showDiscussion
                      ? {
                          background: "rgba(249,115,22,0.10)",
                          border: "1px solid rgba(249,115,22,0.25)",
                          color: "#fb923c",
                          boxShadow: "0 0 14px rgba(249,115,22,0.12)",
                        }
                      : {
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#71717a",
                        }
                  }
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Discussion
                </motion.button>
                {showDiscussion && (
                  <div
                    className="mt-3 rounded-xl border border-white/[0.08] overflow-hidden h-[500px]"
                    style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
                  >
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
