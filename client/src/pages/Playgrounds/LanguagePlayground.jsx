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
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { updateUserStats } from "../../features/auth/authSlice";
import {
  getPlaygroundProgress,
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
  const isMobile = useIsMobile();

  const data = PLAYGROUND_DATA[language?.toLowerCase()];
  const isLivePreview = data?.livePreview === true;

  // Fetch progress; redirect to topics page if not yet enrolled
  useEffect(() => {
    const initProgress = async () => {
      if (!user || !language) return;

      try {
        setIsLoadingProgress(true);
        const { progress } = await getPlaygroundProgress();
        const currentProgress = progress.find((p) => p.language === language);

        if (currentProgress) {
          const completedSet = new Set(currentProgress.completedProblems);
          setCompletedProblems(completedSet);

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
          // Not enrolled — send them to the topic overview to enroll from there
          navigate(`/playground/${language}/topics`, { replace: true });
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

  // On mobile, start with sidebar closed so content is visible
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white p-6">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/95 shadow-xl">
          <CardHeader className="space-y-1 text-center pb-2">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Language Not Found
            </h1>
            <p className="text-sm text-zinc-400">
              The playground for &quot;{language}&quot; is not available yet.
            </p>
          </CardHeader>
          <CardContent className="flex justify-center pt-2">
            <Button
              onClick={() => navigate("/playground")}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Back to Playgrounds
            </Button>
          </CardContent>
        </Card>
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
    <div className="flex h-screen min-h-dvh bg-zinc-950 text-white overflow-hidden">
      {/* Mobile backdrop when sidebar open */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* ===== SIDEBAR ===== */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "h-full border-r border-zinc-800 flex flex-col overflow-hidden shrink-0",
              isMobile
                ? "fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-zinc-900 shadow-xl md:relative md:inset-auto md:z-auto md:w-auto md:max-w-none md:shadow-none"
                : "bg-zinc-900/98",
            )}
          >
            <div className="p-4 flex justify-between items-start shrink-0">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-sm text-white truncate tracking-tight">
                  {data.title}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5 truncate">
                  {data.subtitle}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
                className="h-8 w-8 shrink-0 ml-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Separator className="bg-zinc-800" />

            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700">
              {data.chapters.map((chapter, idx) => {
                const chapterCompleted = chapter.problems.filter((p) =>
                  completedProblems.has(p.id),
                ).length;
                return (
                  <div key={chapter.id}>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-orange-500/20 text-orange-400 text-[10px] font-semibold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {chapter.title}
                      </span>
                      <span className="text-[10px] text-zinc-600 tabular-nums">
                        {chapterCompleted}/{chapter.problems.length}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {chapter.problems.map((prob) => {
                        const isActive = currentProblem?.id === prob.id;
                        const isDone = completedProblems.has(prob.id);
                        return (
                          <Button
                            key={prob.id}
                            variant="ghost"
                            onClick={() => selectProblem(prob)}
                            className={cn(
                              "w-full justify-start gap-2.5 h-auto py-2 px-3 rounded-lg text-[13px] font-normal transition-all",
                              isActive &&
                                "bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20 hover:text-orange-400",
                              isDone &&
                                !isActive &&
                                "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-300",
                              !isDone &&
                                !isActive &&
                                "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300",
                            )}
                          >
                            <span
                              className={cn(
                                "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                                isDone && "bg-emerald-500/20 text-emerald-400",
                                isActive &&
                                  !isDone &&
                                  "bg-orange-500/20 text-orange-400",
                                !isActive &&
                                  !isDone &&
                                  "bg-zinc-800 text-zinc-600",
                              )}
                            >
                              {isDone ? (
                                <CheckCircle className="h-2.5 w-2.5" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              )}
                            </span>
                            <span className="truncate flex-1 text-left">
                              {prob.title}
                            </span>
                            {isDone && (
                              <span className="text-[10px] text-emerald-500/80">
                                ✓
                              </span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className="bg-zinc-800" />
            <div className="p-3 bg-zinc-900/50 shrink-0">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-2">
                <span>Progress</span>
                <span className="tabular-nums">
                  {completedCount}/{totalProblems}
                </span>
              </div>
              <Progress
                value={progressPercent}
                className="h-1.5 bg-zinc-800"
                indicatorClassName="rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-11 sm:h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2 px-3 sm:px-4 shrink-0 min-h-0">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1 overflow-hidden">
            {(isMobile || !isSidebarOpen) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="h-8 w-8 shrink-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            <h1 className="font-medium text-xs sm:text-sm text-white truncate tracking-tight min-w-0">
              {currentProblem?.title}
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wide border-0",
                  currentProblem?.difficulty === "Easy" &&
                    "bg-emerald-500/15 text-emerald-400",
                  currentProblem?.difficulty === "Medium" &&
                    "bg-amber-500/15 text-amber-400",
                  currentProblem?.difficulty === "Hard" &&
                    "bg-red-500/15 text-red-400",
                )}
              >
                {currentProblem?.difficulty}
              </Badge>
              {completedProblems.has(currentProblem?.id) && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border-0 gap-1"
                >
                  <CheckCircle className="h-3 w-3" /> SOLVED
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Badge
              variant="outline"
              className="text-[10px] sm:text-[11px] font-medium text-orange-400 bg-orange-500/10 border-orange-500/20 hidden sm:inline-flex"
            >
              +{currentProblem?.xp} XP
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetCode}
              title="Reset code"
              className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleRunCode}
              disabled={isRunning}
              className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 sm:px-4 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                  <span className="hidden sm:inline">Running…</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current shrink-0" />
                  <span className="hidden sm:inline">Run Code</span>
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-hidden min-h-0">
          {currentProblem &&
            (isMobile ? (
              /* Mobile: vertical stack */
              <PanelGroup direction="vertical">
                <Panel defaultSize={30} minSize={15} maxSize={50}>
                  <Card className="h-full rounded-none border-0 border-b border-zinc-800 bg-zinc-900 flex flex-col shadow-none">
                    <CardHeader className="px-3 sm:px-4 py-2.5 sm:py-3 flex flex-row items-center justify-between space-y-0 border-b border-zinc-800 shrink-0">
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        <BookOpen className="h-3.5 w-3.5" />
                        Instructions
                      </div>
                      {completedProblems.has(currentProblem.id) && (
                        <Button
                          variant="secondary"
                          size="sm"
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
                          className="h-7 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium gap-1"
                        >
                          Next <ChevronRight className="h-3 w-3" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap m-0">
                          {currentProblem.description}
                        </p>
                      </div>
                      {currentProblem.hints &&
                        currentProblem.hints.length > 0 && (
                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowHints(!showHints)}
                              className="h-auto py-1 px-0 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-transparent gap-2 -ml-1"
                            >
                              <Lightbulb className="h-3.5 w-3.5" />
                              {showHints ? "Hide" : "Show"} Hints (
                              {currentProblem.hints.length})
                            </Button>
                            <AnimatePresence>
                              {showHints && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="space-y-2 overflow-hidden mt-2"
                                >
                                  {currentProblem.hints.map((hint, i) => (
                                    <Card
                                      key={i}
                                      className="bg-amber-500/5 border-amber-500/20 rounded-lg p-3"
                                    >
                                      <CardContent className="p-0 text-xs text-amber-200/90 flex gap-2">
                                        <span className="text-amber-500 font-semibold shrink-0">
                                          {i + 1}.
                                        </span>
                                        <span>{hint}</span>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </Panel>
                <PanelResizeHandle className="h-1.5 bg-zinc-800 hover:bg-orange-500/80 transition-colors cursor-row-resize data-[resize-handle-active]:bg-orange-500" />
                <Panel defaultSize={45} minSize={25} maxSize={70}>
                  <div className="h-full flex flex-col bg-[#1e1e1e]">
                    <div className="px-3 sm:px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                        </div>
                        <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wide">
                          {language} Editor
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-normal text-zinc-500 border-zinc-700 bg-transparent hidden sm:inline-flex"
                      >
                        Ctrl+Enter to run
                      </Badge>
                    </div>
                    <div className="flex-1 min-h-0">
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
                <PanelResizeHandle className="h-1.5 bg-zinc-800 hover:bg-orange-500/80 transition-colors cursor-row-resize data-[resize-handle-active]:bg-orange-500" />
                <Panel defaultSize={25} minSize={15} maxSize={45}>
                  {isLivePreview ? (
                    <Card className="h-full rounded-none border-0 flex flex-col bg-white shadow-none">
                      <CardHeader className="px-3 sm:px-4 py-2 flex flex-row items-center justify-between space-y-0 border-b border-zinc-200 bg-zinc-50 shrink-0">
                        <span className="text-[11px] text-zinc-600 font-semibold uppercase tracking-wider">
                          Live Preview
                        </span>
                        <div className="flex items-center gap-2">
                          {testResult && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-semibold border-0",
                                testResult.success
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700",
                              )}
                            >
                              {testResult.success ? "✓ PASSED" : "✗ FAILED"}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border-0 gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-auto p-0 min-h-0">
                        <iframe
                          ref={iframeRef}
                          className="w-full h-full border-0 min-h-[160px]"
                          title="Live Preview"
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </CardContent>
                      {testResult && (
                        <div
                          className={cn(
                            "px-3 sm:px-4 py-2 border-t text-xs shrink-0",
                            testResult.success
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-red-50 border-red-200 text-red-700",
                          )}
                        >
                          <div className="flex items-center gap-2 font-medium">
                            {testResult.success ? (
                              <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                            ) : (
                              <X className="h-3.5 w-3.5 shrink-0" />
                            )}
                            {testResult.message}
                          </div>
                        </div>
                      )}
                    </Card>
                  ) : (
                    <div className="h-full bg-zinc-950 flex flex-col">
                      <div className="px-3 sm:px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                          Output
                        </span>
                        {testResult && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-semibold border-0",
                              testResult.success
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-red-500/15 text-red-400",
                            )}
                          >
                            {testResult.success ? "✓ PASSED" : "✗ FAILED"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 sm:p-4 font-mono text-sm min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700">
                        {isRunning ? (
                          <div className="flex items-center gap-2 text-zinc-500">
                            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                            <span className="text-sm">Executing…</span>
                          </div>
                        ) : output === null ? (
                          <p className="text-zinc-500 text-xs">
                            Tap <strong className="text-zinc-400">Run</strong>{" "}
                            or{" "}
                            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 text-[10px] font-mono">
                              Ctrl+Enter
                            </kbd>
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {output.text && (
                              <pre className="text-zinc-300 whitespace-pre-wrap text-xs leading-relaxed m-0">
                                {output.text}
                              </pre>
                            )}
                            {output.error && (
                              <Card className="bg-red-500/5 border-red-500/20">
                                <CardContent className="p-3">
                                  <pre className="text-red-400 whitespace-pre-wrap text-xs leading-relaxed m-0 font-mono">
                                    {output.error}
                                  </pre>
                                </CardContent>
                              </Card>
                            )}
                            {testResult && (
                              <Card
                                className={cn(
                                  "border",
                                  testResult.success
                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                    : "bg-red-500/5 border-red-500/20",
                                )}
                              >
                                <CardContent className="p-3">
                                  <div className="font-semibold mb-1 flex items-center gap-2 text-xs">
                                    {testResult.success ? (
                                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                                    ) : (
                                      <X className="h-3.5 w-3.5 text-red-400" />
                                    )}
                                    Validation Result
                                  </div>
                                  <p
                                    className={cn(
                                      "text-xs m-0",
                                      testResult.success
                                        ? "text-emerald-400/90"
                                        : "text-red-400/90",
                                    )}
                                  >
                                    {testResult.message}
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Panel>
              </PanelGroup>
            ) : (
              /* Desktop: horizontal then vertical */
              <PanelGroup direction="horizontal">
                {/* LEFT: Description */}
                <Panel defaultSize={35} minSize={20}>
                  <Card className="h-full rounded-none border-0 border-r border-zinc-800 bg-zinc-900 flex flex-col shadow-none">
                    <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 border-b border-zinc-800 shrink-0">
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        <BookOpen className="h-3.5 w-3.5" />
                        Instructions
                      </div>
                      {completedProblems.has(currentProblem.id) && (
                        <Button
                          variant="secondary"
                          size="sm"
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
                          className="h-7 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium gap-1"
                        >
                          Next <ChevronRight className="h-3 w-3" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap m-0">
                          {currentProblem.description}
                        </p>
                      </div>

                      {currentProblem.hints &&
                        currentProblem.hints.length > 0 && (
                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowHints(!showHints)}
                              className="h-auto py-1 px-0 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-transparent gap-2 -ml-1"
                            >
                              <Lightbulb className="h-3.5 w-3.5" />
                              {showHints ? "Hide" : "Show"} Hints (
                              {currentProblem.hints.length})
                            </Button>
                            <AnimatePresence>
                              {showHints && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="space-y-2 overflow-hidden mt-2"
                                >
                                  {currentProblem.hints.map((hint, i) => (
                                    <Card
                                      key={i}
                                      className="bg-amber-500/5 border-amber-500/20 rounded-lg p-3"
                                    >
                                      <CardContent className="p-0 text-xs text-amber-200/90 flex gap-2">
                                        <span className="text-amber-500 font-semibold shrink-0">
                                          {i + 1}.
                                        </span>
                                        <span>{hint}</span>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </Panel>

                <PanelResizeHandle className="w-1.5 bg-zinc-800 hover:bg-orange-500/80 transition-colors cursor-col-resize rounded-px data-[resize-handle-active]:bg-orange-500" />

                {/* RIGHT: Editor + Output */}
                <Panel defaultSize={65} minSize={40}>
                  <PanelGroup direction="vertical">
                    {/* Editor */}
                    <Panel defaultSize={60} minSize={30}>
                      <div className="h-full min-h-0 flex flex-col bg-[#1e1e1e]">
                        <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                            </div>
                            <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wide">
                              {language} Editor
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-normal text-zinc-500 border-zinc-700 bg-transparent"
                          >
                            Ctrl+Enter to run
                          </Badge>
                        </div>
                        <div className="flex-1 min-h-0">
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

                    <PanelResizeHandle className="h-1.5 bg-zinc-800 hover:bg-orange-500/80 transition-colors cursor-row-resize data-[resize-handle-active]:bg-orange-500" />

                    {/* Output / Live Preview */}
                    <Panel defaultSize={40} minSize={15}>
                      {isLivePreview ? (
                        <Card className="h-full rounded-none border-0 flex flex-col bg-white shadow-none">
                          <CardHeader className="px-4 py-2 flex flex-row items-center justify-between space-y-0 border-b border-zinc-200 bg-zinc-50 shrink-0">
                            <span className="text-[11px] text-zinc-600 font-semibold uppercase tracking-wider">
                              Live Preview
                            </span>
                            <div className="flex items-center gap-2">
                              {testResult && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] font-semibold border-0",
                                    testResult.success
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-red-100 text-red-700",
                                  )}
                                >
                                  {testResult.success ? "✓ PASSED" : "✗ FAILED"}
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border-0 gap-1"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="flex-1 overflow-auto p-0 min-h-0">
                            <iframe
                              ref={iframeRef}
                              className="w-full h-full border-0 min-h-[200px]"
                              title="Live Preview"
                              sandbox="allow-scripts allow-same-origin"
                            />
                          </CardContent>
                          {testResult && (
                            <div
                              className={cn(
                                "px-4 py-2 border-t text-xs shrink-0",
                                testResult.success
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                  : "bg-red-50 border-red-200 text-red-700",
                              )}
                            >
                              <div className="flex items-center gap-2 font-medium">
                                {testResult.success ? (
                                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                                ) : (
                                  <X className="h-3.5 w-3.5 shrink-0" />
                                )}
                                {testResult.message}
                              </div>
                            </div>
                          )}
                        </Card>
                      ) : (
                        <div className="h-full bg-zinc-950 flex flex-col">
                          <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex items-center gap-3 shrink-0">
                            <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                              Output
                            </span>
                            {testResult && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] font-semibold border-0",
                                  testResult.success
                                    ? "bg-emerald-500/15 text-emerald-400"
                                    : "bg-red-500/15 text-red-400",
                                )}
                              >
                                {testResult.success
                                  ? "✓ ALL TESTS PASSED"
                                  : "✗ TESTS FAILED"}
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700">
                            {isRunning ? (
                              <div className="flex items-center gap-2 text-zinc-500">
                                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                                <span className="text-sm">Executing…</span>
                              </div>
                            ) : output === null ? (
                              <p className="text-zinc-500 text-xs">
                                Click{" "}
                                <strong className="text-zinc-400">
                                  Run Code
                                </strong>{" "}
                                or press{" "}
                                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 text-[10px] font-mono">
                                  Ctrl+Enter
                                </kbd>{" "}
                                to execute your code.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {output.text && (
                                  <pre className="text-zinc-300 whitespace-pre-wrap text-xs leading-relaxed m-0">
                                    {output.text}
                                  </pre>
                                )}
                                {output.error && (
                                  <Card className="bg-red-500/5 border-red-500/20">
                                    <CardContent className="p-3">
                                      <pre className="text-red-400 whitespace-pre-wrap text-xs leading-relaxed m-0 font-mono">
                                        {output.error}
                                      </pre>
                                    </CardContent>
                                  </Card>
                                )}
                                {testResult && (
                                  <Card
                                    className={cn(
                                      "border",
                                      testResult.success
                                        ? "bg-emerald-500/5 border-emerald-500/20"
                                        : "bg-red-500/5 border-red-500/20",
                                    )}
                                  >
                                    <CardContent className="p-3">
                                      <div className="font-semibold mb-1 flex items-center gap-2 text-xs">
                                        {testResult.success ? (
                                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                                        ) : (
                                          <X className="h-3.5 w-3.5 text-red-400" />
                                        )}
                                        Validation Result
                                      </div>
                                      <p
                                        className={cn(
                                          "text-xs m-0",
                                          testResult.success
                                            ? "text-emerald-400/90"
                                            : "text-red-400/90",
                                        )}
                                      >
                                        {testResult.message}
                                      </p>
                                    </CardContent>
                                  </Card>
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
            ))}
        </div>
      </div>
    </div>
  );
};

export default LanguagePlayground;
