import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { executeCode } from "../../../lib/piston";
import { updateUserStats } from "../../../features/auth/authSlice";
import { store } from "@/store/store";
import { emit } from "@/lib/gamificationBus";
import api from "../../../features/auth/authApi";
import {
  completeProblem as completeProb,
  trackLinkedAttempt,
} from "../../../features/playground/playgroundApi";
import { parseRawError, buildReactDoc } from "../utils/playgroundUtils";

export function useCodeExecution({
  language,
  currentProblem,
  isLivePreview,
  isReact,
  executionMode,
  dsaLang,
  data,
  iframeRef,
  activeTask,
  setCompletedProblems,
  setSessionXP,
  setSessionSolved,
}) {
  const dispatch = useDispatch();
  const pendingTestRef = useRef(null);
  const currentProblemRef = useRef(null);
  const showHintsRef = useRef(false);
  const problemStartTimeRef = useRef(null);

  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [taskTestResults, setTaskTestResults] = useState([]);
  const [isRunningTask, setIsRunningTask] = useState(false);

  // Keep refs in sync
  useEffect(() => { currentProblemRef.current = currentProblem; }, [currentProblem]);
  useEffect(() => { showHintsRef.current = showHints; }, [showHints]);
  useEffect(() => { if (currentProblem?.id) problemStartTimeRef.current = Date.now(); }, [currentProblem?.id]);

  // Pre-load starter code when a course task is dispatched
  useEffect(() => {
    if (activeTask?.starterCode) {
      setCode(activeTask.starterCode);
      setOutput(null);
      setTestResult(null);
    }
  }, [activeTask]);

  const fireBonusToasts = useCallback((response) => {
    if (response.earnedSpeedBonus) toast.success("Speed bonus earned!");
    if (response.chapterCompleted) toast.success("Chapter complete! +100 XP bonus");
    if (response.languageCompleted) toast.success("Language mastered! +500 XP bonus");
  }, []);

  const handleGamificationReward = useCallback(
    (response) => {
      const prevUser = store.getState().auth.user;
      dispatch(updateUserStats(response.user));
      emit({ type: "xp", amount: response.xp });
      setSessionXP((prev) => prev + (response.xp || 0));
      setSessionSolved((prev) => prev + 1);
      if (response.user.level > (prevUser?.level || 1)) {
        emit({ type: "levelUp", level: response.user.level });
      }
      if (response.user.league !== prevUser?.league) {
        emit({ type: "rankUp", league: response.user.league });
      }
      const prevBadges = prevUser?.badges || [];
      (response.user.badges || [])
        .filter((b) => !prevBadges.find((pb) => pb.title === b.title))
        .forEach((b) => emit({ type: "badge", ...b }));
    },
    [dispatch, setSessionXP, setSessionSolved],
  );

  // Live preview: update iframe when code changes
  useEffect(() => {
    if (isReact && iframeRef.current && currentProblem) {
      const reactDebounceRef = setTimeout(() => {
        if (iframeRef.current)
          iframeRef.current.srcdoc = buildReactDoc(code, window.location.origin);
      }, 500);
      return () => clearTimeout(reactDebounceRef);
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
  }, [code, currentProblem, isLivePreview, isReact, language, iframeRef]);

  // postMessage bridge for iframe-based tests (React + HTML/CSS)
  useEffect(() => {
    if (!isReact && !isLivePreview) return;
    const handler = async (e) => {
      if (e.origin !== window.location.origin) return;
      if (!e.data?.type) return;
      if (e.data.type === "IFRAME_READY" && pendingTestRef.current) {
        const fn = pendingTestRef.current;
        pendingTestRef.current = null;
        setTimeout(() => {
          iframeRef.current?.contentWindow?.postMessage({ type: "RUN_TEST", fn }, "*");
        }, 100);
      }
      if (e.data.type === "TEST_RESULT") {
        const { success, message } = e.data;
        setTestResult({ success, message });
        setIsRunning(false);
        const prob = currentProblemRef.current;
        if (!prob) return;
        if (prob.courseChapterLink?.courseId) {
          trackLinkedAttempt({
            exerciseId: prob.id,
            courseId: prob.courseChapterLink.courseId,
            chapterIndex: prob.courseChapterLink.chapterIndex,
            passed: success,
          }).catch(() => {});
        }
        if (success) {
          try {
            const response = await completeProb(language, prob.id, {
              usedHints: showHintsRef.current,
              solveTimeMs: problemStartTimeRef.current
                ? Date.now() - problemStartTimeRef.current
                : null,
            });
            if (!response.alreadyCompleted) {
              handleGamificationReward(response);
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
              fireBonusToasts(response);
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
  }, [isReact, isLivePreview, handleGamificationReward, language, iframeRef, setCompletedProblems, fireBonusToasts]);

  const resetCode = useCallback(() => {
    if (currentProblem) {
      setCode(
        typeof currentProblem.starterCode === "object"
          ? currentProblem.starterCode[dsaLang] || ""
          : currentProblem.starterCode,
      );
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
      if (!iframeRef.current) { setIsRunning(false); return; }
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
          const testBridge = `<script>
            window.__runTest__=function(s){try{var r=new Function("doc",s)(document);window.parent.postMessage({type:"TEST_RESULT",success:r.success,message:r.message},"*");}catch(e){window.parent.postMessage({type:"TEST_RESULT",success:false,message:"Test error: "+e.message},"*");}};
            window.addEventListener("message",function(e){if(e.data&&e.data.type==="RUN_TEST")window.__runTest__(e.data.fn);});
            window.parent.postMessage({type:"IFRAME_READY"},"*");
          <\/script>`;
          if (language === "css")
            iframe.srcdoc = `<!DOCTYPE html><html><head><style>${code}</style></head><body>${currentProblem?.baseHtml || ""}${testBridge}</body></html>`;
          else
            iframe.srcdoc = `<!DOCTYPE html><html><head></head><body>${code}${testBridge}</body></html>`;
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
    const pistonLang = data?.pistonLanguage || language;
    const execLanguage =
      executionMode === "dsa" || typeof currentProblem.starterCode === "object"
        ? dsaLang
        : pistonLang;

    if (currentProblem.testFunction) codeToRun = code + "\n" + currentProblem.testFunction;
    try {
      const result = await executeCode(execLanguage, codeToRun);
      let displayOutput = result.output || "";
      let parsedTest = null;
      if (displayOutput) {
        const lines = displayOutput.split("\n");
        const jsonLineIdx = lines.findIndex((l) => l.trim().startsWith('{"success":'));
        if (jsonLineIdx !== -1) {
          try {
            parsedTest = JSON.parse(lines[jsonLineIdx].trim());
            const cleanLines = lines.filter(
              (l, i) => i !== jsonLineIdx && !l.includes("--- TEST RESULTS ---"),
            );
            displayOutput = cleanLines.join("\n").trim();
          } catch (e) {}
        }
      }
      setOutput({
        text:
          displayOutput ||
          (result.error ? "" : "Code executed successfully (no console output)"),
        error: result.error ? parseRawError(result.error, execLanguage) : null,
        success: result.success,
      });
      if (parsedTest) {
        setTestResult(parsedTest);
        if (currentProblem.courseChapterLink?.courseId) {
          trackLinkedAttempt({
            exerciseId: currentProblem.id,
            courseId: currentProblem.courseChapterLink.courseId,
            chapterIndex: currentProblem.courseChapterLink.chapterIndex,
            passed: parsedTest.success,
          }).catch(() => {});
        }
        if (parsedTest.success) {
          try {
            const response = await completeProb(language, currentProblem.id, {
              usedHints: showHintsRef.current,
              solveTimeMs: problemStartTimeRef.current
                ? Date.now() - problemStartTimeRef.current
                : null,
            });
            if (!response.alreadyCompleted) {
              handleGamificationReward(response);
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
              fireBonusToasts(response);
            } else {
              toast.success("Problem solved! (XP already earned)");
            }
            setCompletedProblems((prev) => new Set([...prev, currentProblem.id]));
          } catch (error) {
            console.error("[Playground] Error saving progress:", error?.response?.data || error.message);
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
  }, [
    code, currentProblem, isRunning, language, isLivePreview, isReact,
    executionMode, dsaLang, data, iframeRef,
    setCompletedProblems, fireBonusToasts, handleGamificationReward,
  ]);

  const handleInteractiveSolve = useCallback(async () => {
    if (!currentProblem) return;
    try {
      const response = await completeProb(language, currentProblem.id, {
        usedHints: showHintsRef.current,
        solveTimeMs: problemStartTimeRef.current
          ? Date.now() - problemStartTimeRef.current
          : null,
      });
      if (!response.alreadyCompleted) {
        handleGamificationReward(response);
        confetti({ particleCount: 130, spread: 80, origin: { y: 0.7 } });
        fireBonusToasts(response);
      } else {
        toast.success("Already solved! (XP already earned)");
      }
      setCompletedProblems((prev) => new Set([...prev, currentProblem.id]));
      setTestResult({ success: true, message: "Correct!" });
    } catch {
      toast.error("Failed to save progress");
    }
  }, [currentProblem, language, fireBonusToasts, handleGamificationReward, setCompletedProblems]);

  const handleRunTask = useCallback(async () => {
    if (!activeTask || isRunningTask) return;
    setIsRunningTask(true);
    setTaskTestResults([]);
    try {
      const execLang =
        executionMode === "dsa" || language === "dsa"
          ? dsaLang
          : (data?.pistonLanguage || language)?.toLowerCase();
      const res = await api.post("/code/run-task", {
        language: execLang,
        code,
        testCases: activeTask.testCases || [],
      });
      setTaskTestResults(res.testResults || []);
    } catch (err) {
      toast.error("Failed to run task tests");
    } finally {
      setIsRunningTask(false);
    }
  }, [activeTask, code, language, dsaLang, isRunningTask, executionMode, data]);

  // Keyboard shortcut Ctrl/Cmd+Enter to run code
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

  return {
    code,
    setCode,
    output,
    setOutput,
    testResult,
    setTestResult,
    showHints,
    setShowHints,
    isRunning,
    taskTestResults,
    isRunningTask,
    resetCode,
    handleRunCode,
    handleInteractiveSolve,
    handleRunTask,
  };
}
