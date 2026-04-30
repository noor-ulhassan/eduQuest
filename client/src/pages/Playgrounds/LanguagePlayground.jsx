import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Editor from "@monaco-editor/react";
import { executeCode } from "../../lib/piston";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  BarChart2,
  BookOpen,
  CheckCircle,
  ChevronRight,
  FileCode2,
  GraduationCap,
  Loader2,
  Lock,
  MessageCircle,
  Play,
  RotateCcw,
  Star,
  Terminal,
  User,
  X,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { updateUserStats } from "../../features/auth/authSlice";
import {
  getLanguageProgress,
  completeProblem as completeProb,
  getCurriculum,
  enrollInPlayground,
  clearPlaygroundCache
} from "../../features/playground/playgroundApi";
import InteractiveProblem from "./components/InteractiveProblem";
import DiscussionPanel from "@/components/playground/DiscussionPanel";
import {
  Terminal as MagicTerminal,
  TypingAnimation,
  AnimatedSpan,
} from "@/components/ui/terminal";

const getLanguageIconUrl = (lang) => {
  switch (lang?.toLowerCase()) {
    case "python":
      return "/python.png";
    case "javascript":
      return "/js.png";
    case "react":
      return "/react.png";
    case "html":
      return "/html.png";
    case "css":
      return "/css.png";
    case "java":
      return "/java.png";
    case "dsa":
      return "/dsa.png";
    default:
      return null;
  }
};

// ─── Helper: Format Task Text ──────────────────────────────────────────────
const FormattedTaskText = ({ text, isMobile = false, className = "" }) => {
  if (!text) return null;
  const codeClass = isMobile
    ? "text-red-400 bg-red-500/10 px-1 py-0.5 rounded font-mono"
    : "bg-white/10 text-red-300 px-1.5 py-0.5 rounded font-mono text-sm";
  const parts = text.split(/`([^`]+)`/);
  return (
    <div className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className={codeClass}>
            {part}
          </code>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </div>
  );
};

// ─── React iframe document builder ─────────────────────────────────────────
const buildReactDoc = (userCode, parentOrigin) => `<!DOCTYPE html>
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
var __origin__="${parentOrigin}";
window.__runTest__=function(s){try{var r=new Function("win","doc",s)(window,document);window.parent.postMessage({type:"TEST_RESULT",success:r.success,message:r.message},__origin__);}catch(e){window.parent.postMessage({type:"TEST_RESULT",success:false,message:"Test error: "+e.message},__origin__);}};
window.addEventListener("message",function(e){if(e.data&&e.data.type==="RUN_TEST")window.__runTest__(e.data.fn);});
setTimeout(function(){window.parent.postMessage({type:"IFRAME_READY"},__origin__);},250);
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
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [completedProblems, setCompletedProblems] = useState(new Set());
  const [showHints, setShowHints] = useState(false);
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const iframeRef = useRef(null);
  const pendingTestRef = useRef(null);
  const currentProblemRef = useRef(null);
  const [dsaLang, setDsaLang] = useState("javascript");
  const reactDebounceRef = useRef(null);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [data, setData] = useState(null);
  const isLivePreview =
    language?.toLowerCase() === "html" || language?.toLowerCase() === "css";
  const isReact = language?.toLowerCase() === "react";

  // Fetch curriculum and progress
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      if (!user || !language) return;
      try {
        setIsLoadingProgress(true);
        const curRes = await getCurriculum(language);
        if (!isMounted) return;
        if (curRes.success && curRes.curriculum) {
          setData(curRes.curriculum);
          const { progress: currentProgress } =
            await getLanguageProgress(language);
          if (!isMounted) return;

          let completedSet = new Set();
          if (currentProgress) {
            completedSet = new Set(currentProgress.completedProblems);
          } else {
            try {
              await enrollInPlayground(language);
              clearPlaygroundCache();
              toast.success("Enrolled! Let's begin 🚀");
            } catch (err) {
              console.error("[Playground] Auto-enroll failed:", err);
            }
          }
          setCompletedProblems(completedSet);
          
          let firstUnsolved = null;
          for (const chapter of curRes.curriculum.chapters) {
            const found = chapter.problems.find(
              (p) => !completedSet.has(p.id),
            );
            if (found) {
              firstUnsolved = found;
              break;
            }
          }

          const targetProblem = firstUnsolved || curRes.curriculum.chapters[0].problems[0];
          setCurrentProblem(targetProblem);
          setCode(
            typeof targetProblem.starterCode === "object"
              ? targetProblem.starterCode[dsaLang] || ""
              : targetProblem.starterCode || "",
          );
          setOutput(null);
          setTestResult(null);
          setShowHints(false);
          
          if (!firstUnsolved) {
            setExpandedChapterId(curRes.curriculum.chapters[0].id);
          }
        } else {
          toast.error("Curriculum not found");
          navigate("/playground");
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("[Playground] Error loading data:", error);
      } finally {
        if (isMounted) setIsLoadingProgress(false);
      }
    };
    initData();
    return () => { isMounted = false; };
  }, [user, language, navigate]);



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
        if (iframeRef.current) iframeRef.current.srcdoc = buildReactDoc(code, window.location.origin);
      }, 500);
      return () => clearTimeout(reactDebounceRef.current);
    }
    if (!isLivePreview || !iframeRef.current) return;
    const iframe = iframeRef.current;
    const origin = window.location.origin;
    const testBridge = `<script>
      var __origin__="${origin}";
      window.__runTest__=function(s){try{var r=new Function("doc",s)(document);window.parent.postMessage({type:"TEST_RESULT",success:r.success,message:r.message},__origin__);}catch(e){window.parent.postMessage({type:"TEST_RESULT",success:false,message:"Test error: "+e.message},__origin__);}};
      window.addEventListener("message",function(e){if(e.data&&e.data.type==="RUN_TEST")window.__runTest__(e.data.fn);});
      window.parent.postMessage({type:"IFRAME_READY"},__origin__);
    <\/script>`;
    if (language === "css") {
      iframe.srcdoc = `<!DOCTYPE html><html><head><style>${code}</style></head><body>${currentProblem?.baseHtml || ""}${testBridge}</body></html>`;
    } else {
      iframe.srcdoc = `<!DOCTYPE html><html><head></head><body>${code}${testBridge}</body></html>`;
    }
  }, [code, currentProblem, isLivePreview, isReact, language]);

  // postMessage bridge for iframe-based tests (React + HTML/CSS)
  useEffect(() => {
    if (!isReact && !isLivePreview) return;
    const handler = async (e) => {
      if (e.origin !== window.location.origin) return; // Fix Bug #26
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
            const response = await completeProb(language, prob.id);
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
  }, [currentProblem, dsaLang]);

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
      iframeRef.current.srcdoc = buildReactDoc(code, window.location.origin);
      return;
    }

    if (isLivePreview) {
      try {
        const iframe = iframeRef.current;
        if (!iframe) throw new Error("Preview not ready");
        if (currentProblem.testFunction) {
          pendingTestRef.current = currentProblem.testFunction;
          // Trigger IFRAME_READY -> RUN_TEST flow
          const testBridge = `<script>
            window.__runTest__=function(s){try{var r=new Function("doc",s)(document);window.parent.postMessage({type:"TEST_RESULT",success:r.success,message:r.message},"*");}catch(e){window.parent.postMessage({type:"TEST_RESULT",success:false,message:"Test error: "+e.message},"*");}};
            window.addEventListener("message",function(e){if(e.data&&e.data.type==="RUN_TEST")window.__runTest__(e.data.fn);});
            window.parent.postMessage({type:"IFRAME_READY"},"*");
          <\/script>`;
          if (language === "css") iframe.srcdoc = `<!DOCTYPE html><html><head><style>${code}</style></head><body>${currentProblem?.baseHtml || ""}${testBridge}</body></html>`;
          else iframe.srcdoc = `<!DOCTYPE html><html><head></head><body>${code}${testBridge}</body></html>`;
        } else {
          setIsRunning(false);
        }
      } catch (err) {
        setTestResult({ success: false, message: err.message });
        toast.error("Validation error");
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

  // ── Computed values ────────────────────────────────────
  const { totalProblems, completedCount, progressPercent } = useMemo(() => {
    const total =
      data?.chapters?.reduce((sum, ch) => sum + ch.problems.length, 0) || 0;
    const completed = completedProblems.size;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      totalProblems: total,
      completedCount: completed,
      progressPercent: percent,
    };
  }, [data, completedProblems]);

  // Lesson number (e.g. "2.1")
  const { currentChapterIdx, currentProblemIdx } = useMemo(() => {
    let cIdx = 0;
    let pIdx = 0;
    if (currentProblem && data) {
      for (let ci = 0; ci < data.chapters.length; ci++) {
        const pi = data.chapters[ci].problems.findIndex(
          (p) => p.id === currentProblem.id,
        );
        if (pi !== -1) {
          cIdx = ci;
          pIdx = pi;
          break;
        }
      }
    }
    return { currentChapterIdx: cIdx, currentProblemIdx: pIdx };
  }, [currentProblem, data]);

  const fileName = useMemo(() => {
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
    return `main.${fileExtMap[activeLang] || activeLang}`;
  }, [currentProblem, dsaLang, language]);

  // ── Not found ──────────────────────────────────────────
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-6">
        <div className="w-full max-w-md border border-white/10 bg-[#111111] rounded-2xl shadow-2xl p-8 text-center space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Language Not Found
          </h1>
          <p className="text-sm text-zinc-400">
            The playground for &quot;{language}&quot; is not available yet.
          </p>
          <button
            onClick={() => navigate("/playground")}
            className="bg-red-600 hover:bg-red-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Back to Playgrounds
          </button>
        </div>
      </div>
    );
  }



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
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-red-400" />
          <span className="text-sm text-zinc-400">Loading workspace…</span>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
   *  RENDER
   * ════════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col h-screen min-h-dvh bg-[#0a0a0a] text-white overflow-hidden">
      {/* ═══════════ DESKTOP NAVBAR ═══════════ */}
      {!isMobile && (
        <header className="h-[60px] shrink-0 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 ml-1">
              {getLanguageIconUrl(language) ? (
                <img
                  src={getLanguageIconUrl(language)}
                  alt={language}
                  className="w-5 h-5 object-contain drop-shadow-md"
                />
              ) : (
                <Terminal className="w-5 h-5 text-white" />
              )}
            </div>
            <span className="font-bold text-lg tracking-wide hidden sm:block">
              {language.charAt(0).toUpperCase() + language.slice(1)} Playground
            </span>
          </div>

          {/* Navigation Links */}

          {/* User actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex items-center justify-center"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-red-600 flex items-center justify-center">
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
        <AnimatePresence initial={false}>
          {(isSidebarOpen || isMobile) && (
            <motion.aside
              initial={
                isMobile ? { x: -280, opacity: 0 } : { width: 0, opacity: 0 }
              }
              animate={
                isMobile ? { x: 0, opacity: 1 } : { width: 250, opacity: 1 }
              }
              exit={
                isMobile ? { x: -280, opacity: 0 } : { width: 0, opacity: 0 }
              }
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className={cn(
                "h-full flex flex-col overflow-hidden shrink-0 bg-[#111111] border-r border-white/10",
                isMobile
                  ? "fixed inset-y-0 left-0 z-50 w-[280px] shadow-2xl"
                  : "hidden md:flex",
              )}
            >
              {/* Course header */}
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 drop-shadow-sm">
                  {getLanguageIconUrl(language) ? (
                    <img
                      src={getLanguageIconUrl(language)}
                      alt={language}
                      className="w-6 h-6 object-contain drop-shadow-md"
                    />
                  ) : (
                    <FileCode2 className="w-5 h-5 text-red-400" />
                  )}
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
                  <span className="text-[#2cf09d] font-bold">
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2cf09d] rounded-full transition-all duration-500 "
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-600 mt-2 block">
                  {completedCount} of {totalProblems} lessons completed
                </span>
              </div>

              <div className="h-px bg-white/10" />

              {/* Topic / chapter list */}
              <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10">
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
                          isActiveChapter && "text-red-300",
                          chapterDone &&
                            !isActiveChapter &&
                            "text-zinc-400 hover:bg-white/5",
                          isLocked &&
                            "text-zinc-600 cursor-not-allowed opacity-60",
                          !isActiveChapter &&
                            !chapterDone &&
                            !isLocked &&
                            "text-zinc-300 hover:bg-white/5",
                        )}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span
                            className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px]",
                              isActiveChapter
                                ? "bg-red-500/20 text-red-400"
                                : "bg-white/5 text-zinc-500",
                            )}
                          >
                            {chapterDone ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            ) : isActiveChapter ? (
                              <Play className="w-3.5 h-3.5 text-red-400 fill-red-400" />
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
                            <CheckCircle className="w-4 h-4 text-[#2cf07d]" />
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
                                        ? "bg-red-500/20 text-red-300 font-semibold border border-red-500/20"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
                                      isProbLocked &&
                                        "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-zinc-400",
                                      isProbDone &&
                                        !isProbActive &&
                                        "text-[#2cf07d] ",
                                    )}
                                  >
                                    <span className="truncate">
                                      {prob.title}
                                    </span>
                                    {isProbDone && (
                                      <CheckCircle className="w-3.5 h-3.5 text-[#2cf07d] shrink-0 ml-2" />
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


            </motion.aside>
          )}
        </AnimatePresence>

        {/* ═══════════ MAIN CONTENT ═══════════ */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* ── Mobile top bar ── */}
          {isMobile && (
            <header className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] shrink-0">
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
              <span className="flex items-center gap-2 bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full border border-red-500/20 shrink-0">
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
                <span className="text-red-500">Lesson Progress</span>
                <span className="text-white">{progressPercent}%</span>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10">
            <div
              className={cn(
                "mx-auto space-y-5",
                isMobile ? "px-4 py-4" : "max-w-4xl px-8 py-8",
              )}
            >
              {/* Desktop: Lesson badge + XP reward */}
              {!isMobile && (
                <div className="flex items-center justify-between">
                  <span className="bg-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                    Lesson {currentChapterIdx + 1}.{currentProblemIdx + 1}
                  </span>
                  <span className="text-[#2cf07d] text-sm font-bold flex items-center gap-1">
                    <img src="/xp.svg" className="w-7 h-7 animate-bounce"></img>{" "}
                    +{currentProblem?.xp} XP Reward
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
                    ? "bg-[#1a1a1a] border border-white/10 p-5"
                    : "bg-transparent p-0",
                )}
              >
                {isMobile ? (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <span className="inline-block bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                        Task
                      </span>
                      <div className="w-12 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <Terminal className="w-6 h-6 text-zinc-500" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {currentProblem?.title}
                      </h3>
                      <FormattedTaskText
                        text={currentProblem?.description}
                        isMobile={true}
                        className="text-zinc-300 text-[15px] leading-relaxed whitespace-pre-wrap font-medium"
                      />
                    </div>
                  </>
                ) : (
                  <div className="bg-[#111111]/40 border border-white/10 rounded-xl p-5 mb-2">
                    <span className="text-red-500 text-[16px] font-bold flex items-center gap-2 mb-3">
                      <img src="/task.svg" className="w-7 h-7"></img> Your Task:
                    </span>
                    <FormattedTaskText
                      text={currentProblem?.description}
                      isMobile={false}
                      className="text-white text-[15px] leading-relaxed whitespace-pre-wrap font-medium"
                    />
                  </div>
                )}
              </div>

              {/* ── Hints ── */}
              {currentProblem?.hints &&
                currentProblem.hints.length > 0 &&
                (isMobile ? (
                  /* Mobile: hint card with toggle */
                  <div className="bg-[#1a1a1a] border border-white/10 rounded-[24px] p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                          <img
                            src="/hint2.svg"
                            alt="Hint"
                            className="w-20 h-20 object-contain"
                          />
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
                            ? "bg-red-500"
                            : "bg-red-500/20 border border-white/10",
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
                              className="text-sm text-red-200/90 pl-3 border-l-2 border-purple-500 py-1"
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
                    <p className="text-[#2cf07d] text-md font-hand">
                      Tip: {currentProblem.hints[0]}
                    </p>
                    {currentProblem.hints.length > 1 && (
                      <>
                        <button
                          onClick={() => setShowHints(!showHints)}
                          className="text-amber-400 hover:text-amber-300 text-s font-bold font-hand mt-2 flex items-center"
                        >
                          <img
                            src="/hint2.svg"
                            alt="Hint"
                            className="w-12 h-12 object-contain"
                          />
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
                                  className="text-[#2cf07d] text-md font-hand"
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
                <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden p-1">
                  <InteractiveProblem
                    key={currentProblem.id}
                    problem={currentProblem}
                    onSolve={handleInteractiveSolve}
                    isAlreadySolved={completedProblems.has(currentProblem.id)}
                  />
                </div>
              ) : (
                <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden shadow-lg">
                  {/* Editor toolbar */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#1a1a1a]/80">
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
                              className="ml-4 bg-[#111111] border border-white/10 text-zinc-300 text-xs px-2 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                            >
                              <option value="javascript">JavaScript</option>
                              <option value="python">Python</option>
                              <option value="java">Java</option>
                            </select>
                          )}

                          <div className="flex items-center gap-3 ml-auto">
                            <button
                              onClick={resetCode}
                              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Reset
                            </button>

                            <div className="flex gap-2">
                              {testResult?.success && (
                                <button
                                  onClick={goToNextProblem}
                                  className="flex items-center gap-2 bg-[#34d399] hover:bg-[#10b981] text-black font-bold text-sm px-5 py-2 rounded-xl transition-colors shadow-lg shadow-[#2cf07d] "
                                >
                                  Next Question{" "}
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={handleRunCode}
                                disabled={isRunning || testResult?.success}
                                className="flex items-center gap-2 bg-[#2cf07d] hover:bg-[#2cf04d] disabled:opacity-50 text-black font-bold text-sm px-5 py-2 rounded-xl transition-colors shadow-lg shadow-purple-500/20 "
                              >
                                {isRunning ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />{" "}
                                    Running…
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 fill-white text-black" />{" "}
                                    Run Code
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
                  <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
                    {/* Browser chrome */}
                    <div className="px-4 py-2.5 bg-[#111111] border-b border-white/10 flex items-center gap-3">
                      <div className="flex gap-1.5 shrink-0">
                        <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-[11px] text-zinc-500 font-medium bg-[#1a1a1a] px-4 py-0.5 rounded border border-white/10">
                          preview
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {testResult && (
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded",
                              testResult.success
                                ? "bg-emerald-500/20 text-[#2cf07d]"
                                : "bg-red-500/20 text-red-400",
                            )}
                          >
                            {testResult.success ? "✓ PASSED" : "✗ FAILED"}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live
                        </span>
                      </div>
                    </div>
                    <iframe
                      ref={iframeRef}
                      className="w-full border-0 bg-[#1a1a1a]"
                      style={{ height: isMobile ? 180 : 250 }}
                      title="Live Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                    {testResult && (
                      <div
                        className={cn(
                          "px-4 py-2 border-t text-xs font-medium flex items-center gap-2",
                          testResult.success
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/5 border-red-500/20 text-red-400",
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
                          <MagicTerminal className="w-full max-w-full bg-[#111111] border-white/10 shadow-xl">
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

              {/* ── Discussion Section ── */}
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
                  <MessageCircle className="w-4 h-4" />
                  Discussion
                </button>
                {showDiscussion && (
                  <div className="mt-3 rounded-xl border border-white/10 overflow-hidden h-[500px]">
                    <DiscussionPanel
                      language={language}
                      problemId={currentProblem?.id}
                      problemTitle={currentProblem?.title}
                    />
                  </div>
                )}
              </div>

              {/* ── Next problem button (after completion) ── */}
              {completedProblems.has(currentProblem?.id) && (
                <button
                  onClick={goToNextProblem}
                  className="flex items-center gap-2 text-sm font-semibold text-red-300 hover:text-red-200 transition-colors group"
                >
                  Next Problem
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>

          {/* ── Mobile: Fixed RUN CODE button ── */}
          {isMobile && currentProblem?.type !== "interactive" && (
            <div className="px-4 pb-4 pt-2 bg-[#0a0a0a] shrink-0 flex gap-3">
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
            <nav className="flex items-center justify-around py-3 border-t border-white/10 bg-[#111111] shrink-0">
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
                      ? "text-red-400"
                      : "text-zinc-500 hover:text-zinc-400",
                  )}
                >
                  <item.icon
                    className={cn("w-6 h-6", item.active && "fill-red-400/20")}
                  />
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* ═══════════ RIGHT FABs (desktop) ═══════════ */}
      </div>
    </div>
  );
};

export default LanguagePlayground;
