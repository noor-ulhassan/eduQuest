import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { PLAYGROUND_DATA } from "../../data/playground";
import Editor from "@monaco-editor/react";
import { executeCode } from "../../lib/piston";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  Award,
  BarChart2,
  Bell,
  BookOpen,
  CheckCircle,
  ChevronRight,
  FileCode2,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Loader2,
  Lock,
  MessageCircle,
  Play,
  RotateCcw,
  Settings,
  Star,
  Terminal,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { updateUserStats } from "../../features/auth/authSlice";
import {
  getPlaygroundProgress,
  completeProblem as completeProb,
} from "../../features/playground/playgroundApi";
import InteractiveProblem from "./components/InteractiveProblem";
import {
  Terminal as MagicTerminal,
  TypingAnimation,
  AnimatedSpan,
} from "@/components/ui/terminal";

// ─── Helper: Format Task Text ──────────────────────────────────────────────
const formatTaskText = (text, isMobile = false) => {
  if (!text) return "";
  // Escape angle brackets so things like <div> or <CustomComponent> are visible text, not DOM nodes
  const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Wrap text in backticks with syntax-highlighted spans
  const spanClass = isMobile
    ? "text-purple-400 bg-purple-500/10 px-1 py-0.5 rounded font-mono"
    : "bg-[#2d2755] text-purple-300 px-1.5 py-0.5 rounded font-mono text-sm";

  return safeText.replace(/`([^`]+)`/g, `<span class="${spanClass}">$1</span>`);
};

// ─── React iframe document builder ─────────────────────────────────────────
const buildReactDoc = (userCode) => `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,system-ui,sans-serif;background:#fff;color:#1a1a1a;padding:16px}button{cursor:pointer}.done{text-decoration:line-through;color:#6b7280}.error{color:#e53e3e}<\/style>
</head><body><div id="root"><\/div>
<script>const{useState,useEffect,useRef,useCallback,useMemo,useReducer}=React;<\/script>
<script type="text/babel">
${userCode}
try{ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));}catch(e){document.getElementById("root").innerHTML='<div style="color:#c0392b;background:#fff5f5;border:1px solid #f5c6cb;border-radius:4px;padding:10px;font-family:monospace;font-size:12px;white-space:pre-wrap"><b>Error:<\/b> '+e.message+'<\/div>';}
<\/script>
<script>
window.__runTest__=function(s){try{var r=new Function("win","doc",s)(window,document);window.parent.postMessage({type:"TEST_RESULT",success:r.success,message:r.message},"*");}catch(e){window.parent.postMessage({type:"TEST_RESULT",success:false,message:"Test error: "+e.message},"*");}};
window.addEventListener("message",function(e){if(e.data&&e.data.type==="RUN_TEST")window.__runTest__(e.data.fn);});
setTimeout(function(){window.parent.postMessage({type:"IFRAME_READY"},"*");},250);
<\/script></body></html>`;

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
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const iframeRef = useRef(null);
  const isMobile = useIsMobile();
  const pendingTestRef = useRef(null);
  const currentProblemRef = useRef(null);
  const [dsaLang, setDsaLang] = useState("javascript");
  const reactDebounceRef = useRef(null);

  const data = PLAYGROUND_DATA[language?.toLowerCase()];
  const isLivePreview = data?.livePreview === true;
  const isReact = language?.toLowerCase() === "react";

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
              if (typeof firstUnsolved.starterCode === "object") {
                setCode(firstUnsolved.starterCode[dsaLang] || "");
              } else {
                setCode(firstUnsolved.starterCode || "");
              }
              setOutput(null);
              setTestResult(null);
              setShowHints(false);
            }
          }
        } else {
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
    if (data && !currentProblem) {
      const firstChapter = data.chapters[0];
      const firstProblem = firstChapter.problems[0];
      setCurrentProblem(firstProblem);
      setExpandedChapterId(firstChapter.id);
      if (typeof firstProblem.starterCode === "object") {
        setCode(firstProblem.starterCode[dsaLang] || "");
      } else {
        setCode(firstProblem.starterCode);
      }
      setOutput(null);
      setTestResult(null);
      setShowHints(false);
    }
  }, [language, data, currentProblem]);

  const selectProblem = useCallback(
    (prob, chapterId) => {
      setCurrentProblem(prob);
      if (chapterId) setExpandedChapterId(chapterId);
      if (typeof prob.starterCode === "object") {
        setCode(prob.starterCode[dsaLang] || "");
      } else {
        setCode(prob.starterCode);
      }
      setOutput(null);
      setTestResult(null);
      setShowHints(false);
    },
    [dsaLang],
  );

  useEffect(() => {
    currentProblemRef.current = currentProblem;
  }, [currentProblem]);

  // Live preview: update iframe when code changes
  useEffect(() => {
    if (isReact && iframeRef.current && currentProblem) {
      if (reactDebounceRef.current) clearTimeout(reactDebounceRef.current);
      reactDebounceRef.current = setTimeout(() => {
        if (iframeRef.current) iframeRef.current.srcdoc = buildReactDoc(code);
      }, 500);
      return () => clearTimeout(reactDebounceRef.current);
    }
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
      doc.open();
      doc.write(code);
      doc.close();
    }
  }, [code, currentProblem, isLivePreview, isReact, language]);

  // React postMessage bridge
  useEffect(() => {
    if (!isReact) return;
    const handler = async (e) => {
      if (!e.data?.type) return;
      if (e.data.type === "IFRAME_READY" && pendingTestRef.current) {
        const fn = pendingTestRef.current;
        pendingTestRef.current = null;
        setTimeout(() => {
          iframeRef.current?.contentWindow?.postMessage(
            { type: "RUN_TEST", fn },
            "*",
          );
        }, 100);
      }
      if (e.data.type === "TEST_RESULT") {
        const { success, message } = e.data;
        setTestResult({ success, message });
        setIsRunning(false);
        const prob = currentProblemRef.current;
        if (!prob) return;
        if (success) {
          try {
            const response = await completeProb("react", prob.id, prob.xp);
            if (!response.alreadyCompleted) {
              dispatch(updateUserStats(response.user));
              toast.success(`${message} +${prob.xp} XP!`);
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
            } else {
              toast.success("Problem solved! (XP already earned)");
            }
            setCompletedProblems((prev) => new Set([...prev, prob.id]));
          } catch {
            toast.error("Tests passed but failed to save progress");
          }
        } else {
          toast.error(message || "Tests failed");
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [isReact, dispatch]);

  const resetCode = useCallback(() => {
    if (currentProblem) {
      if (typeof currentProblem.starterCode === "object") {
        setCode(currentProblem.starterCode[dsaLang] || "");
      } else {
        setCode(currentProblem.starterCode);
      }
      setOutput(null);
      setTestResult(null);
    }
  }, [currentProblem]);

  const handleRunCode = useCallback(async () => {
    if (!currentProblem || isRunning) return;
    setIsRunning(true);
    setOutput(null);
    setTestResult(null);

    if (isReact) {
      if (!iframeRef.current) {
        setIsRunning(false);
        return;
      }
      pendingTestRef.current = currentProblem.testFunction;
      iframeRef.current.srcdoc = buildReactDoc(code);
      return;
    }

    if (isLivePreview) {
      try {
        const iframe = iframeRef.current;
        const doc = iframe?.contentDocument;
        if (!doc) throw new Error("Preview not ready");
        if (currentProblem.testFunction) {
          const testFn = new Function("doc", currentProblem.testFunction);
          const result = testFn(doc);
          setTestResult(result);
          if (result.success) {
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

    // Piston execution
    let codeToRun = code;
    // For DSA multi-language problems, send the exact dsaLang instead of the playground's overarching language
    const execLanguage =
      typeof currentProblem.starterCode === "object" ? dsaLang : language;

    if (currentProblem.testFunction)
      codeToRun = code + "\n" + currentProblem.testFunction;
    try {
      const result = await executeCode(execLanguage, codeToRun);
      let displayOutput = result.output || "";
      let parsedTest = null;
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
      if (parsedTest) {
        setTestResult(parsedTest);
        if (parsedTest.success) {
          try {
            const response = await completeProb(
              language,
              currentProblem.id,
              currentProblem.xp,
            );
            if (!response.alreadyCompleted) {
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
  }, [code, currentProblem, isRunning, language, isLivePreview, isReact]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if (currentProblem?.type === "interactive") return;
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRunCode, currentProblem]);

  // Interactive problem solve handler
  const handleInteractiveSolve = useCallback(async () => {
    if (!currentProblem) return;
    try {
      const response = await completeProb(
        language,
        currentProblem.id,
        currentProblem.xp,
      );
      if (!response.alreadyCompleted) {
        dispatch(updateUserStats(response.user));
        toast.success(`Correct! +${currentProblem.xp} XP!`);
        confetti({ particleCount: 130, spread: 80, origin: { y: 0.7 } });
      } else {
        toast.success("Already solved! (XP already earned)");
      }
      setCompletedProblems((prev) => new Set([...prev, currentProblem.id]));
      setTestResult({ success: true, message: "Correct!" });
    } catch {
      toast.error("Failed to save progress");
    }
  }, [currentProblem, language, dispatch]);

  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  // ── Not found ──────────────────────────────────────────
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0b1a] text-white p-6">
        <div className="w-full max-w-md border border-[#2d2755] bg-[#13112a] rounded-2xl shadow-2xl p-8 text-center space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Language Not Found
          </h1>
          <p className="text-sm text-zinc-400">
            The playground for &quot;{language}&quot; is not available yet.
          </p>
          <button
            onClick={() => navigate("/playground")}
            className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Back to Playgrounds
          </button>
        </div>
      </div>
    );
  }

  // ── Computed values ────────────────────────────────────
  const totalProblems = data.chapters.reduce(
    (sum, ch) => sum + ch.problems.length,
    0,
  );
  const completedCount = completedProblems.size;
  const progressPercent =
    totalProblems > 0 ? Math.round((completedCount / totalProblems) * 100) : 0;

  // Lesson number (e.g. "2.1")
  let currentChapterIdx = 0;
  let currentProblemIdx = 0;
  if (currentProblem) {
    for (let ci = 0; ci < data.chapters.length; ci++) {
      const pi = data.chapters[ci].problems.findIndex(
        (p) => p.id === currentProblem.id,
      );
      if (pi !== -1) {
        currentChapterIdx = ci;
        currentProblemIdx = pi;
        break;
      }
    }
  }

  // Derive filename from language
  const fileExtMap = {
    python: "py",
    javascript: "js",
    html: "html",
    css: "css",
    react: "jsx",
    java: "java",
  };
  const activeLang =
    typeof currentProblem?.starterCode === "object"
      ? dsaLang
      : language?.toLowerCase();
  const fileName = `main.${fileExtMap[activeLang] || activeLang}`;

  // Go to next problem
  const goToNextProblem = () => {
    const allProblems = data.chapters.flatMap((ch) => ch.problems);
    const currentIdx = allProblems.findIndex(
      (p) => p.id === currentProblem?.id,
    );
    const nextProblem = allProblems[currentIdx + 1];
    if (nextProblem) selectProblem(nextProblem);
    else toast.success("You've completed all problems in this course!");
  };

  // ── Editor language mapping ────────────────────────────
  const editorLang =
    typeof currentProblem?.starterCode === "object"
      ? dsaLang === "java"
        ? "java"
        : dsaLang === "python"
          ? "python"
          : "javascript"
      : isReact || language === "javascript"
        ? "javascript"
        : language === "css"
          ? "css"
          : language === "python"
            ? "python"
            : "html";

  // ── Loading state ──────────────────────────────────────
  if (isLoadingProgress || !currentProblem) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0b1a] text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <span className="text-sm text-zinc-400">Loading workspace…</span>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
   *  RENDER
   * ════════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col h-screen min-h-dvh bg-[#0d0b1a] text-white overflow-hidden">
      {/* ═══════════ DESKTOP NAVBAR ═══════════ */}
      {!isMobile && (
        <header className="h-[60px] shrink-0 border-b border-[#2d2755] bg-[#0d0b1a] flex items-center justify-between px-6 z-10">
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-wide">
              {language.charAt(0).toUpperCase() + language.slice(1)} Playground
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-8 h-full">
            {["Home", "Courses", "Playgrounds", "Community"].map((link) => {
              const isActive = link === "Courses";
              return (
                <button
                  key={link}
                  onClick={() => {
                    if (link === "Home") navigate("/");
                    if (link === "Playgrounds") navigate("/playground");
                    if (link === "Community") navigate("/community");
                  }}
                  className={cn(
                    "h-full px-1 text-[13px] font-bold tracking-wide transition-colors relative flex items-center",
                    isActive
                      ? "text-purple-400"
                      : "text-zinc-400 hover:text-white",
                  )}
                >
                  {link}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-[#2d1b69] border border-purple-500/20 px-3 py-1.5 rounded-full">
              <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
              <span className="text-purple-300 font-bold text-xs tracking-wide">
                {(user?.stats?.totalXp || 0).toLocaleString()} XP
              </span>
            </div>
            <button className="w-9 h-9 rounded-full bg-[#1e1b38] hover:bg-[#2d2755] flex items-center justify-center transition-colors">
              <Bell className="w-4 h-4 text-purple-400" />
            </button>
            <button className="w-9 h-9 rounded-full bg-[#1e1b38] hover:bg-[#2d2755] flex items-center justify-center transition-colors">
              <Settings className="w-4 h-4 text-purple-400" />
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="w-9 h-9 rounded-full overflow-hidden border border-[#2d2755] flex items-center justify-center"
            >
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </button>
          </div>
        </header>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile backdrop */}
        <AnimatePresence>
          {isMobile && isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ═══════════ LEFT SIDEBAR ═══════════ */}
        <AnimatePresence>
          {(isSidebarOpen || !isMobile) && (
            <motion.aside
              initial={isMobile ? { x: -280, opacity: 0 } : false}
              animate={isMobile ? { x: 0, opacity: 1 } : false}
              exit={isMobile ? { x: -280, opacity: 0 } : undefined}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={cn(
                "h-full flex flex-col overflow-hidden shrink-0 bg-[#13112a] border-r border-[#2d2755]",
                isMobile
                  ? "fixed inset-y-0 left-0 z-50 w-[280px] shadow-2xl"
                  : "w-[250px] hidden md:flex",
              )}
            >
              {/* Course header */}
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center shrink-0">
                  <FileCode2 className="w-5 h-5 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-sm text-white truncate">
                    {data.title}
                  </h2>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                    {data.subtitle || "BEGINNER LEVEL"}
                  </span>
                </div>
                {isMobile && (
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-zinc-500 hover:text-zinc-300 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Progress */}
              <div className="px-4 pb-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-widest font-semibold mb-2">
                  <span className="text-zinc-500">Course Progress</span>
                  <span className="text-white font-bold">
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-1.5 bg-[#1e1b38] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-600 mt-2 block">
                  {completedCount} of {totalProblems} lessons completed
                </span>
              </div>

              <div className="h-px bg-[#2d2755]" />

              {/* Topic / chapter list */}
              <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#2d2755]">
                {data.chapters.map((chapter, idx) => {
                  const isActiveChapter = chapter.problems.some(
                    (p) => p.id === currentProblem?.id,
                  );
                  const chapterDone = chapter.problems.every((p) =>
                    completedProblems.has(p.id),
                  );
                  const chapterHasProgress = chapter.problems.some((p) =>
                    completedProblems.has(p.id),
                  );

                  // All chapters are now fully unlocked for open exploration
                  const isLocked = false;

                  const isExpanded = expandedChapterId === chapter.id;

                  return (
                    <div key={chapter.id} className="mb-2">
                      <button
                        onClick={() => {
                          if (isLocked) return;
                          setExpandedChapterId(isExpanded ? null : chapter.id);
                        }}
                        disabled={isLocked}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left",
                          isActiveChapter && "text-purple-300",
                          chapterDone &&
                            !isActiveChapter &&
                            "text-zinc-400 hover:bg-[#1e1b38]",
                          isLocked &&
                            "text-zinc-600 cursor-not-allowed opacity-60",
                          !isActiveChapter &&
                            !chapterDone &&
                            !isLocked &&
                            "text-zinc-300 hover:bg-[#1e1b38]",
                        )}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span
                            className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px]",
                              isActiveChapter
                                ? "bg-[#2d1b69] text-purple-400"
                                : "bg-[#1e1b38] text-zinc-500",
                            )}
                          >
                            {chapterDone ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            ) : isActiveChapter ? (
                              <Play className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                            ) : (
                              <BookOpen className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <span className="flex-1 truncate font-bold text-[14px]">
                            {chapter.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {chapterDone && (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          )}
                          {isLocked && (
                            <Lock className="w-3.5 h-3.5 text-zinc-600" />
                          )}
                          {!isLocked && (
                            <ChevronRight
                              className={cn(
                                "w-4 h-4 text-zinc-500 transition-transform",
                                isExpanded && "rotate-90",
                              )}
                            />
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && !isLocked && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-11 pr-2 py-1 flex flex-col gap-1">
                              {chapter.problems.map((prob, pIdx) => {
                                const isProbActive =
                                  currentProblem?.id === prob.id;
                                const isProbDone = completedProblems.has(
                                  prob.id,
                                );

                                // All problems unlocked globally
                                const isProbLocked = false;

                                return (
                                  <button
                                    key={prob.id}
                                    onClick={() => {
                                      if (!isProbLocked) {
                                        selectProblem(prob, chapter.id);
                                        if (isMobile) setIsSidebarOpen(false);
                                      }
                                    }}
                                    disabled={isProbLocked}
                                    className={cn(
                                      "flex items-center justify-between w-full text-left py-2 px-3 rounded-lg text-sm transition-colors",
                                      isProbActive
                                        ? "bg-[#2d1b69]/40 text-purple-300 font-semibold border border-purple-500/20"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1e1b38]",
                                      isProbLocked &&
                                        "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-zinc-400",
                                      isProbDone &&
                                        !isProbActive &&
                                        "text-emerald-400/70",
                                    )}
                                  >
                                    <span className="truncate">
                                      {prob.title}
                                    </span>
                                    {isProbDone && (
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                                    )}
                                    {isProbLocked && (
                                      <Lock className="w-3 h-3 text-zinc-600 shrink-0 ml-2" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <div className="h-px bg-[#2d2755]" />

              {/* View Curriculum */}
              <div className="p-3">
                <button
                  onClick={() => navigate(`/playground/${language}/topics`)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2d1b69]/40 hover:bg-[#2d1b69]/60 text-purple-400 text-sm font-medium transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  View Curriculum
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ═══════════ MAIN CONTENT ═══════════ */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* ── Mobile top bar ── */}
          {isMobile && (
            <header className="flex items-center justify-between px-4 py-3 bg-[#0d0b1a] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => navigate(-1)}
                  className="text-zinc-300 hover:text-white p-0.5"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="font-semibold text-[15px] text-white truncate">
                  {data.title}
                </h1>
              </div>
              <span className="flex items-center gap-2 bg-[#2d1b69] text-[#b794f4] text-xs font-bold px-3 py-1.5 rounded-full border border-purple-500/20 shrink-0">
                <span className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Star className="w-2.5 h-2.5 text-black fill-current" />
                </span>
                {currentProblem?.xp} XP
              </span>
            </header>
          )}

          {/* ── Mobile progress bar ── */}
          {isMobile && (
            <div className="px-4 pb-3 shrink-0">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.15em] font-bold mb-2">
                <span className="text-purple-500">Lesson Progress</span>
                <span className="text-white">{progressPercent}%</span>
              </div>
              <div className="h-2.5 bg-[#1e1b38] rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#2d2755]">
            <div
              className={cn(
                "mx-auto space-y-5",
                isMobile ? "px-4 py-4" : "max-w-4xl px-8 py-8",
              )}
            >
              {/* Desktop: Lesson badge + XP reward */}
              {!isMobile && (
                <div className="flex items-center justify-between">
                  <span className="bg-[#2d1b69] text-purple-400 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                    Lesson {currentChapterIdx + 1}.{currentProblemIdx + 1}
                  </span>
                  <span className="text-emerald-400 text-sm font-bold flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> +{currentProblem?.xp} XP
                    Reward
                  </span>
                </div>
              )}

              {/* Lesson title */}
              <h1
                className={cn(
                  "font-bold text-white leading-tight",
                  isMobile ? "text-xl mb-4" : "text-3xl mb-6",
                )}
              >
                {currentProblem?.title}
              </h1>

              {/* ── Task Card ── */}
              <div
                className={cn(
                  "rounded-[24px]",
                  isMobile
                    ? "bg-[#1f1b38] border border-[#2d2755] p-5"
                    : "bg-transparent p-0",
                )}
              >
                {isMobile ? (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <span className="inline-block bg-[#a855f7] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                        Task
                      </span>
                      <div className="w-12 h-10 rounded-xl bg-[#2d2755] flex items-center justify-center shrink-0">
                        <Terminal className="w-6 h-6 text-zinc-500" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {currentProblem?.title}
                      </h3>
                      <div
                        className="text-zinc-300 text-[15px] leading-relaxed whitespace-pre-wrap font-medium"
                        dangerouslySetInnerHTML={{
                          __html: formatTaskText(
                            currentProblem?.description,
                            true,
                          ),
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="bg-[#1a1730]/40 border border-[#2d2755]/50 rounded-xl p-5 mb-2">
                    <span className="text-purple-400 text-[14px] font-bold flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4" /> Your Task:
                    </span>
                    <div
                      className="text-white text-[15px] leading-relaxed whitespace-pre-wrap font-medium"
                      dangerouslySetInnerHTML={{
                        __html: formatTaskText(
                          currentProblem?.description,
                          false,
                        ),
                      }}
                    />
                  </div>
                )}
              </div>

              {/* ── Hints ── */}
              {currentProblem?.hints &&
                currentProblem.hints.length > 0 &&
                (isMobile ? (
                  /* Mobile: hint card with toggle */
                  <div className="bg-[#1f1b38] border border-[#2d2755] rounded-[24px] p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#2d1b69] flex items-center justify-center shrink-0">
                          <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-[17px] font-bold text-white mb-0.5">
                            Need a hint?
                          </h4>
                          <p className="text-[13px] text-zinc-400">
                            Reveal a tip to help you solve it
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowHints(!showHints)}
                        className={cn(
                          "w-12 h-7 rounded-full transition-colors relative shrink-0",
                          showHints
                            ? "bg-purple-500"
                            : "bg-[#2d1b69] border border-white/10",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-5 h-5 rounded-full bg-white transition-transform shadow-md",
                            showHints ? "translate-x-6" : "translate-x-1",
                          )}
                        />
                      </button>
                    </div>
                    <AnimatePresence>
                      {showHints && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-4 space-y-2"
                        >
                          {currentProblem.hints.map((hint, i) => (
                            <p
                              key={i}
                              className="text-sm text-purple-200/90 pl-3 border-l-2 border-purple-500 py-1"
                            >
                              {hint}
                            </p>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* Desktop: tip text */
                  <div>
                    <p className="text-emerald-400/80 text-sm italic">
                      Tip: {currentProblem.hints[0]}
                    </p>
                    {currentProblem.hints.length > 1 && (
                      <>
                        <button
                          onClick={() => setShowHints(!showHints)}
                          className="text-amber-400 hover:text-amber-300 text-xs mt-2 flex items-center gap-1"
                        >
                          <Lightbulb className="w-3 h-3" />
                          {showHints ? "Hide" : "Show"}{" "}
                          {currentProblem.hints.length - 1} more hint
                          {currentProblem.hints.length > 2 ? "s" : ""}
                        </button>
                        <AnimatePresence>
                          {showHints && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden space-y-1.5 mt-2"
                            >
                              {currentProblem.hints.slice(1).map((hint, i) => (
                                <p
                                  key={i}
                                  className="text-emerald-400/60 text-sm italic"
                                >
                                  Tip: {hint}
                                </p>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                ))}

              {/* ── Code Editor / Interactive Problem ── */}
              {currentProblem?.type === "interactive" ? (
                <div className="bg-[#1a1730] border border-[#2d2755] rounded-xl overflow-hidden p-1">
                  <InteractiveProblem
                    key={currentProblem.id}
                    problem={currentProblem}
                    onSolve={handleInteractiveSolve}
                    isAlreadySolved={completedProblems.has(currentProblem.id)}
                  />
                </div>
              ) : (
                <div className="bg-[#1f1b38] rounded-2xl border border-[#2d2755]/60 overflow-hidden shadow-lg">
                  {/* Editor toolbar */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2755]/60 bg-[#1f1b38]/80">
                    <div className="flex items-center gap-3 w-full">
                      {isMobile ? (
                        <>
                          <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                          </div>
                          <span className="flex-1 text-right text-[11px] text-zinc-500 font-bold uppercase tracking-[0.15em] ml-auto">
                            {fileName}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                            <FileCode2 className="w-4 h-4 text-zinc-400" />
                            {fileName}
                          </div>

                          {typeof currentProblem?.starterCode === "object" && (
                            <select
                              value={dsaLang}
                              onChange={(e) => {
                                const newLang = e.target.value;
                                setDsaLang(newLang);
                                setCode(
                                  currentProblem.starterCode[newLang] || "",
                                );
                                setOutput(null);
                                setTestResult(null);
                              }}
                              className="ml-4 bg-[#13112a] border border-[#2d2755] text-zinc-300 text-xs px-2 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                              <option value="javascript">JavaScript</option>
                              <option value="python">Python</option>
                              <option value="java">Java</option>
                            </select>
                          )}

                          <div className="flex items-center gap-3 ml-auto">
                            <button
                              onClick={resetCode}
                              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Reset
                            </button>

                            <div className="flex gap-2">
                              {testResult?.success && (
                                <button
                                  onClick={goToNextProblem}
                                  className="flex items-center gap-2 bg-[#34d399] hover:bg-[#10b981] text-black font-bold text-sm px-5 py-2 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                                >
                                  Next Question{" "}
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={handleRunCode}
                                disabled={isRunning || testResult?.success}
                                className="flex items-center gap-2 bg-[#a855f7] hover:bg-[#9333ea] disabled:opacity-50 text-white font-bold text-sm px-5 py-2 rounded-xl transition-colors shadow-lg shadow-purple-500/20"
                              >
                                {isRunning ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />{" "}
                                    Running…
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 fill-white" /> Run
                                    Code
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Monaco editor */}
                  <div className={isMobile ? "h-[220px]" : "h-[320px]"}>
                    <Editor
                      height="100%"
                      language={editorLang}
                      value={code}
                      onChange={(val) => setCode(val || "")}
                      theme="vs-dark"
                      options={{
                        fontSize: isMobile ? 13 : 14,
                        lineNumbers: "on",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 12, bottom: 12 },
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        renderLineHighlight: "all",
                        bracketPairColorization: { enabled: true },
                        cursorBlinking: "smooth",
                        smoothScrolling: true,
                        lineDecorationsWidth: 0,
                        overviewRulerLanes: 0,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ── Live Preview (HTML/CSS/React) ── */}
              {(isLivePreview || isReact) &&
                currentProblem?.type !== "interactive" && (
                  <div className="bg-white rounded-xl border border-[#2d2755] overflow-hidden">
                    <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-600 font-semibold uppercase tracking-wider">
                        Live Preview
                      </span>
                      <div className="flex items-center gap-2">
                        {testResult && (
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded",
                              testResult.success
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700",
                            )}
                          >
                            {testResult.success ? "✓ PASSED" : "✗ FAILED"}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live
                        </span>
                      </div>
                    </div>
                    <iframe
                      ref={iframeRef}
                      className="w-full border-0"
                      style={{ height: isMobile ? 180 : 250 }}
                      title="Live Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                    {testResult && (
                      <div
                        className={cn(
                          "px-4 py-2 border-t text-xs font-medium flex items-center gap-2",
                          testResult.success
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-red-50 border-red-200 text-red-700",
                        )}
                      >
                        {testResult.success ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        {testResult.message}
                      </div>
                    )}
                  </div>
                )}

              {/* Hidden iframe for non-preview React */}
              {isReact && !isLivePreview && (
                <iframe
                  ref={iframeRef}
                  className="hidden"
                  title="React Runner"
                  sandbox="allow-scripts allow-same-origin"
                />
              )}

              {/* ── Output (non-preview languages) ── */}
              {!isLivePreview &&
                !isReact &&
                currentProblem?.type !== "interactive" && (
                  <div>
                    {isRunning && (
                      <div className="flex items-center gap-2 text-zinc-500 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Executing…
                      </div>
                    )}
                    {output && !isRunning && (
                      <div className="space-y-4 my-2">
                        {output.text && (
                          <MagicTerminal className="w-full max-w-full bg-[#13112a] border-[#2d2755]/60 shadow-xl">
                            <AnimatedSpan className="text-zinc-400 mb-2 font-mono">
                              Output:
                            </AnimatedSpan>
                            <TypingAnimation
                              className="text-emerald-400 whitespace-pre-wrap font-mono mt-2 block"
                              duration={10}
                            >
                              {output.text}
                            </TypingAnimation>
                          </MagicTerminal>
                        )}
                        {output.error && (
                          <MagicTerminal className="w-full max-w-full bg-red-950/10 border-red-500/20 shadow-xl">
                            <AnimatedSpan className="text-red-400/80 mb-2 font-mono">
                              Error:
                            </AnimatedSpan>
                            <TypingAnimation
                              className="text-red-400 whitespace-pre-wrap font-mono mt-2 block"
                              duration={10}
                            >
                              {output.error}
                            </TypingAnimation>
                          </MagicTerminal>
                        )}
                        {testResult && (
                          <div
                            className={cn(
                              "rounded-xl p-4 border flex items-center gap-2 text-sm font-medium",
                              testResult.success
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                : "bg-red-500/5 border-red-500/20 text-red-400",
                            )}
                          >
                            {testResult.success ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            {testResult.message}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* ── Next problem button (after completion) ── */}
              {completedProblems.has(currentProblem?.id) && (
                <button
                  onClick={goToNextProblem}
                  className="flex items-center gap-2 text-sm font-semibold text-purple-300 hover:text-purple-200 transition-colors group"
                >
                  Next Problem
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>

          {/* ── Mobile: Fixed RUN CODE button ── */}
          {isMobile && currentProblem?.type !== "interactive" && (
            <div className="px-4 pb-4 pt-2 bg-[#0d0b1a] shrink-0 flex gap-3">
              <button
                onClick={handleRunCode}
                disabled={isRunning || testResult?.success}
                className="flex-1 h-[56px] bg-[#2cf07d] hover:bg-[#2cf09d] disabled:opacity-50 text-black font-bold text-[17px] tracking-wide rounded-[20px] flex items-center justify-center gap-2.5 transition-colors shadow-lg shadow-purple-900/20"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> RUNNING…
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" /> RUN CODE
                  </>
                )}
              </button>
              {testResult?.success && (
                <button
                  onClick={goToNextProblem}
                  className="flex-1 h-[56px] bg-[#34d399] hover:bg-[#10b981] text-black font-bold text-[17px] tracking-wide rounded-[20px] flex items-center justify-center gap-2.5 transition-colors shadow-lg shadow-emerald-900/20 animate-in slide-in-from-right-4"
                >
                  NEXT <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* ── Mobile: Bottom navigation ── */}
          {isMobile && (
            <nav className="flex items-center justify-around py-3 border-t border-[#2d2755] bg-[#13112a] shrink-0">
              {[
                {
                  icon: GraduationCap,
                  label: "LEARN",
                  active: true,
                  action: () => setIsSidebarOpen(true),
                },
                {
                  icon: Terminal,
                  label: "PRACTICE",
                  active: false,
                  action: () => navigate("/playground"),
                },
                {
                  icon: BarChart2,
                  label: "RANKING",
                  active: false,
                  action: () => navigate("/leaderboard"),
                },
                {
                  icon: User,
                  label: "PROFILE",
                  active: false,
                  action: () => navigate("/profile"),
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={cn(
                    "flex flex-col items-center gap-1.5 text-[10px] font-bold tracking-widest transition-colors",
                    item.active
                      ? "text-purple-400"
                      : "text-zinc-500 hover:text-zinc-400",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-6 h-6",
                      item.active && "fill-purple-400/20",
                    )}
                  />
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* ═══════════ RIGHT FABs (desktop) ═══════════ */}
        {!isMobile && (
          <div className="hidden lg:flex flex-col gap-3 py-6 pr-4 pl-2 shrink-0">
            {[
              { icon: MessageCircle, color: "text-zinc-400" },
              { icon: Lightbulb, color: "text-yellow-400" },
              { icon: Users, color: "text-zinc-400" },
              { icon: HelpCircle, color: "text-zinc-400" },
            ].map((fab, i) => (
              <button
                key={i}
                className="w-12 h-12 rounded-full bg-[#1a1730] border border-[#2d2755] flex items-center justify-center hover:bg-[#1e1b38] transition-colors"
              >
                <fab.icon className={cn("w-5 h-5", fab.color)} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguagePlayground;
