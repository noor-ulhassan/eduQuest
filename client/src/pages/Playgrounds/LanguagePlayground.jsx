import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { PLAYGROUND_DATA } from "../../data/playgroundData";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Editor from "@monaco-editor/react";
import { executeCode } from "../../lib/piston";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  Lightbulb,
  Loader2,
  Menu,
  Play,
  RotateCcw,
  Trophy,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateUserStats } from "../../features/auth/authSlice";
import {
  getPlaygroundProgress,
  enrollInPlayground,
  completeProblem as completeProb,
} from "../../features/playground/playgroundApi";

const LanguagePlayground = () => {
  const { language } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [completedProblems, setCompletedProblems] = useState(new Set());
  const [showHints, setShowHints] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const iframeRef = useRef(null);

  const data = PLAYGROUND_DATA[language?.toLowerCase()];
  const isLivePreview = data?.livePreview === true;

  // Fetch progress and auto-enroll on mount
  useEffect(() => {
    const initProgress = async () => {
      if (!user || !language) return;
      console.log("[Playground] initProgress called for language:", language);

      try {
        setIsLoadingProgress(true);
        // Fetch all progress
        const { progress } = await getPlaygroundProgress();
        console.log("[Playground] fetched progress:", progress);
        const currentProgress = progress.find((p) => p.language === language);
        console.log(
          "[Playground] currentProgress for",
          language,
          ":",
          currentProgress,
        );

        if (currentProgress) {
          const completedSet = new Set(currentProgress.completedProblems);
          setCompletedProblems(completedSet);
          console.log("[Playground] completedProblems:", [...completedSet]);

          // Auto-open first unsolved problem
          if (data && data.chapters) {
            let firstUnsolved = null;
            for (const chapter of data.chapters) {
              const found = chapter.problems.find(
                (p) => !completedSet.has(p.id),
              );
              if (found) {
                firstUnsolved = found;
                break;
              }
            }

            if (firstUnsolved) {
              setCurrentProblem(firstUnsolved);
              setCode(firstUnsolved.starterCode);
              setOutput(null);
              setTestResult(null);
              setShowHints(false);
            }
          }
        } else {
          // Auto-enroll if not enrolled
          console.log(
            "[Playground] Not enrolled, auto-enrolling for:",
            language,
          );
          try {
            const enrollResult = await enrollInPlayground(language);
            console.log("[Playground] Enrollment result:", enrollResult);
          } catch (enrollErr) {
            console.error(
              "[Playground] Enrollment FAILED:",
              enrollErr?.response?.data || enrollErr.message,
            );
          }
        }
      } catch (error) {
        console.error(
          "[Playground] Error loading progress:",
          error?.response?.data || error.message,
        );
      } finally {
        setIsLoadingProgress(false);
      }
    };

    initProgress();
  }, [user, language]);

  useEffect(() => {
    // Only set default if no problem selected yet
    if (data && !currentProblem) {
      const firstProblem = data.chapters[0].problems[0];
      setCurrentProblem(firstProblem);
      setCode(firstProblem.starterCode);
      setOutput(null);
      setTestResult(null);
      setShowHints(false);
    }
  }, [language, data, currentProblem]);

  const selectProblem = useCallback((prob) => {
    setCurrentProblem(prob);
    setCode(prob.starterCode);
    setOutput(null);
    setTestResult(null);
    setShowHints(false);
  }, []);

  // Live preview: update iframe when code changes
  useEffect(() => {
    if (!isLivePreview || !iframeRef.current) return;
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument;
    if (!doc) return;
    if (language === "css") {
      doc.open();
      doc.write(
        `<!DOCTYPE html><html><head><style>${code}</style></head><body>${currentProblem?.baseHtml || ""}</body></html>`,
      );
      doc.close();
    } else {
      // HTML
      doc.open();
      doc.write(code);
      doc.close();
    }
  }, [code, currentProblem, isLivePreview, language]);

  const resetCode = useCallback(() => {
    if (currentProblem) {
      setCode(currentProblem.starterCode);
      setOutput(null);
      setTestResult(null);
    }
  }, [currentProblem]);

  const handleRunCode = useCallback(async () => {
    if (!currentProblem || isRunning) return;
    setIsRunning(true);
    setOutput(null);
    setTestResult(null);

    if (isLivePreview) {
      // Client-side validation for HTML/CSS
      try {
        const iframe = iframeRef.current;
        const doc = iframe?.contentDocument;
        if (!doc) throw new Error("Preview not ready");
        if (currentProblem.testFunction) {
          const testFn = new Function("doc", currentProblem.testFunction);
          const result = testFn(doc);
          setTestResult(result);
          if (result.success) {
            // Call backend to save progress and update XP
            try {
              const response = await completeProb(
                language,
                currentProblem.id,
                currentProblem.xp,
              );

              if (!response.alreadyCompleted) {
                dispatch(updateUserStats(response.user));
                toast.success(`${result.message} +${currentProblem.xp} XP!`);
                confetti({
                  particleCount: 120,
                  spread: 80,
                  origin: { y: 0.7 },
                });
              } else {
                toast.success("Problem solved! (XP already earned)");
              }

              setCompletedProblems(
                (prev) => new Set([...prev, currentProblem.id]),
              );
            } catch (error) {
              console.error("Error saving progress:", error);
              toast.error("Tests passed but failed to save progress");
            }
          } else {
            toast.error(result.message || "Tests failed");
          }
        }
      } catch (err) {
        setTestResult({ success: false, message: err.message });
        toast.error("Validation error");
      } finally {
        setIsRunning(false);
      }
      return;
    }

    // Piston execution for JS & Python
    let codeToRun = code;
    if (currentProblem.testFunction) {
      codeToRun = code + "\n" + currentProblem.testFunction;
    }

    try {
      console.log("[Playground] Executing code via Piston for:", language);
      const result = await executeCode(language, codeToRun);
      console.log(
        "[Playground] Piston result:",
        JSON.stringify(result).slice(0, 500),
      );
      let displayOutput = result.output || "";
      let parsedTest = null;

      // Always try to parse test results from output, even if there were warnings
      if (displayOutput) {
        const lines = displayOutput.split("\n");
        const jsonLineIdx = lines.findIndex((l) =>
          l.trim().startsWith('{"success":'),
        );
        if (jsonLineIdx !== -1) {
          try {
            parsedTest = JSON.parse(lines[jsonLineIdx].trim());
            const cleanLines = lines.filter(
              (l, i) =>
                i !== jsonLineIdx && !l.includes("--- TEST RESULTS ---"),
            );
            displayOutput = cleanLines.join("\n").trim();
          } catch (e) {}
        }
      }

      setOutput({
        text:
          displayOutput ||
          (result.error
            ? ""
            : "Code executed successfully (no console output)"),
        error: result.error || null,
        success: result.success,
      });

      console.log("[Playground] parsedTest:", parsedTest);
      if (parsedTest) {
        setTestResult(parsedTest);
        if (parsedTest.success) {
          console.log("[Playground] Test PASSED. Saving progress...");
          // Call backend to save progress and update XP
          try {
            const response = await completeProb(
              language,
              currentProblem.id,
              currentProblem.xp,
            );

            if (!response.alreadyCompleted) {
              // Update Redux with new user stats
              dispatch(updateUserStats(response.user));
              toast.success(`${parsedTest.message} +${currentProblem.xp} XP!`);
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
            } else {
              toast.success("Problem solved! (XP already earned)");
            }

            setCompletedProblems(
              (prev) => new Set([...prev, currentProblem.id]),
            );
          } catch (error) {
            console.error(
              "[Playground] Error saving progress:",
              error?.response?.data || error.message,
            );
            toast.error("Tests passed but failed to save progress");
          }
        } else {
          toast.error(parsedTest.message || "Tests failed");
        }
      } else if (!result.success) {
        toast.error("Execution error");
      }
    } catch (err) {
      setOutput({ text: "", error: err.message, success: false });
      toast.error("Failed to run code");
    } finally {
      setIsRunning(false);
    }
  }, [code, currentProblem, isRunning, language, isLivePreview]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRunCode]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Language Not Found</h1>
          <p className="text-zinc-400 mb-6">
            The playground for "{language}" is not available yet.
          </p>
          <button
            onClick={() => navigate("/playground")}
            className="px-6 py-2 bg-orange-500 rounded-lg hover:bg-orange-600 transition"
          >
            Back to Playgrounds
          </button>
        </div>
      </div>
    );
  }

  const totalProblems = data.chapters.reduce(
    (sum, ch) => sum + ch.problems.length,
    0,
  );
  const completedCount = completedProblems.size;
  const progressPercent =
    totalProblems > 0 ? Math.round((completedCount / totalProblems) * 100) : 0;

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* ===== SIDEBAR ===== */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-hidden shrink-0"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-zinc-800 flex justify-between items-start">
              <div className="min-w-0">
                <h2 className="font-bold text-base text-white truncate">
                  {data.title}
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                  {data.subtitle}
                </p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300 transition shrink-0 ml-2"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chapters & Problems */}
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5 scrollbar-thin scrollbar-thumb-zinc-700">
              {data.chapters.map((chapter, idx) => {
                const chapterCompleted = chapter.problems.filter((p) =>
                  completedProblems.has(p.id),
                ).length;
                return (
                  <div key={chapter.id}>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded bg-orange-500/20 text-orange-400 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {chapter.title}
                      </span>
                      <span className="text-[10px] text-zinc-600">
                        {chapterCompleted}/{chapter.problems.length}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {chapter.problems.map((prob) => {
                        const isActive = currentProblem?.id === prob.id;
                        const isDone = completedProblems.has(prob.id);
                        return (
                          <button
                            key={prob.id}
                            onClick={() => selectProblem(prob)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${
                              isActive
                                ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                                : isDone
                                  ? "text-zinc-400 hover:bg-zinc-800/60 border border-transparent"
                                  : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300 border border-transparent"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                isDone
                                  ? "bg-green-500/20 text-green-400"
                                  : isActive
                                    ? "bg-orange-500/20 text-orange-400"
                                    : "bg-zinc-800 text-zinc-600"
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle size={10} />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                              )}
                            </div>
                            <span className="truncate">{prob.title}</span>
                            {isDone && (
                              <span className="ml-auto text-[10px] text-green-500/70">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress Footer */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1.5">
                <span>Progress</span>
                <span>
                  {completedCount}/{totalProblems}
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
              >
                <Menu size={16} />
              </button>
            )}
            <h1 className="font-semibold text-sm text-white truncate">
              {currentProblem?.title}
            </h1>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                currentProblem?.difficulty === "Easy"
                  ? "bg-green-500/15 text-green-400"
                  : currentProblem?.difficulty === "Medium"
                    ? "bg-yellow-500/15 text-yellow-400"
                    : "bg-red-500/15 text-red-400"
              }`}
            >
              {currentProblem?.difficulty}
            </span>
            {completedProblems.has(currentProblem?.id) && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/15 text-green-400 flex items-center gap-1">
                <CheckCircle size={10} /> SOLVED
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-orange-400 font-semibold bg-orange-500/10 px-2.5 py-1 rounded border border-orange-500/20">
              +{currentProblem?.xp} XP
            </span>
            <button
              onClick={resetCode}
              className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition"
              title="Reset code"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-xs font-semibold px-4 py-1.5 rounded-md transition-all active:scale-95"
            >
              {isRunning ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Play size={13} fill="currentColor" />
                  Run Code
                </>
              )}
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-hidden">
          {currentProblem && (
            <PanelGroup direction="horizontal">
              {/* LEFT: Description */}
              <Panel defaultSize={35} minSize={20}>
                <div className="h-full bg-zinc-900 flex flex-col">
                  <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      <BookOpen size={13} />
                      Instructions
                    </div>

                    {/* Next Problem Button */}
                    {completedProblems.has(currentProblem.id) && (
                      <button
                        onClick={() => {
                          const allProblems = data.chapters.flatMap(
                            (ch) => ch.problems,
                          );
                          const currentIdx = allProblems.findIndex(
                            (p) => p.id === currentProblem.id,
                          );
                          const nextProblem = allProblems[currentIdx + 1];
                          if (nextProblem) {
                            selectProblem(nextProblem);
                          } else {
                            toast.success(
                              "You've completed all problems in this course!",
                            );
                          }
                        }}
                        className="flex items-center gap-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors"
                      >
                        Next <ChevronRight size={10} />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-zinc-700">
                    {/* Description */}
                    <div className="prose prose-invert prose-sm max-w-none">
                      <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {currentProblem.description}
                      </div>
                    </div>

                    {/* Hints */}
                    {currentProblem.hints &&
                      currentProblem.hints.length > 0 && (
                        <div>
                          <button
                            onClick={() => setShowHints(!showHints)}
                            className="flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition mb-2"
                          >
                            <Lightbulb size={13} />
                            {showHints ? "Hide" : "Show"} Hints (
                            {currentProblem.hints.length})
                          </button>
                          <AnimatePresence>
                            {showHints && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-2 overflow-hidden"
                              >
                                {currentProblem.hints.map((hint, i) => (
                                  <div
                                    key={i}
                                    className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-200/80 flex gap-2"
                                  >
                                    <span className="text-amber-500 font-bold shrink-0">
                                      {i + 1}.
                                    </span>
                                    {hint}
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-orange-500 transition-colors cursor-col-resize" />

              {/* RIGHT: Editor + Output */}
              <Panel defaultSize={65} minSize={40}>
                <PanelGroup direction="vertical">
                  {/* Editor */}
                  <Panel defaultSize={60} minSize={30}>
                    <div className="h-full flex flex-col bg-[#1e1e1e]">
                      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                          </div>
                          <span className="text-[11px] text-zinc-500 font-medium ml-2 uppercase">
                            {language} Editor
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-600">
                          Ctrl+Enter to run
                        </span>
                      </div>
                      <div className="flex-1">
                        <Editor
                          height="100%"
                          language={
                            language === "javascript"
                              ? "javascript"
                              : language === "css"
                                ? "css"
                                : "html"
                          }
                          value={code}
                          onChange={(val) => setCode(val || "")}
                          theme="vs-dark"
                          options={{
                            fontSize: 14,
                            lineNumbers: "on",
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 12 },
                            fontFamily:
                              "'JetBrains Mono', 'Fira Code', monospace",
                            renderLineHighlight: "all",
                            bracketPairColorization: { enabled: true },
                            cursorBlinking: "smooth",
                            smoothScrolling: true,
                          }}
                        />
                      </div>
                    </div>
                  </Panel>

                  <PanelResizeHandle className="h-1 bg-zinc-800 hover:bg-orange-500 transition-colors cursor-row-resize" />

                  {/* Output / Live Preview */}
                  <Panel defaultSize={40} minSize={15}>
                    {isLivePreview ? (
                      <div className="h-full bg-white flex flex-col">
                        <div className="px-4 py-2 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
                          <span className="text-[11px] text-zinc-600 font-semibold uppercase tracking-wider">
                            Live Preview
                          </span>
                          <div className="flex items-center gap-2">
                            {testResult && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${testResult.success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                              >
                                {testResult.success ? "✓ PASSED" : "✗ FAILED"}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                              Live
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                          <iframe
                            ref={iframeRef}
                            className="w-full h-full border-0"
                            title="Live Preview"
                            sandbox="allow-scripts allow-same-origin"
                          />
                        </div>
                        {testResult && (
                          <div
                            className={`px-4 py-2 border-t text-xs ${testResult.success ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}
                          >
                            <div className="flex items-center gap-1.5 font-semibold">
                              {testResult.success ? (
                                <CheckCircle size={12} />
                              ) : (
                                <X size={12} />
                              )}
                              {testResult.message}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full bg-zinc-950 flex flex-col">
                        <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex items-center gap-3 shrink-0">
                          <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                            Output
                          </span>
                          {testResult && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${testResult.success ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}
                            >
                              {testResult.success
                                ? "✓ ALL TESTS PASSED"
                                : "✗ TESTS FAILED"}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm scrollbar-thin scrollbar-thumb-zinc-700">
                          {isRunning ? (
                            <div className="flex items-center gap-2 text-zinc-500">
                              <Loader2 size={14} className="animate-spin" />
                              Executing…
                            </div>
                          ) : output === null ? (
                            <p className="text-zinc-600 text-xs">
                              Click <strong>Run Code</strong> or press{" "}
                              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 text-[10px]">
                                Ctrl+Enter
                              </kbd>{" "}
                              to execute your code.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {output.text && (
                                <pre className="text-zinc-300 whitespace-pre-wrap text-xs leading-relaxed">
                                  {output.text}
                                </pre>
                              )}
                              {output.error && (
                                <pre className="text-red-400 whitespace-pre-wrap text-xs leading-relaxed bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                                  {output.error}
                                </pre>
                              )}
                              {testResult && (
                                <div
                                  className={`rounded-lg p-3 border text-xs ${testResult.success ? "bg-green-500/5 border-green-500/20 text-green-400" : "bg-red-500/5 border-red-500/20 text-red-400"}`}
                                >
                                  <div className="font-semibold mb-1 flex items-center gap-1.5">
                                    {testResult.success ? (
                                      <CheckCircle size={12} />
                                    ) : (
                                      <X size={12} />
                                    )}
                                    Validation Result
                                  </div>
                                  <p className="text-zinc-400">
                                    {testResult.message}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguagePlayground;
