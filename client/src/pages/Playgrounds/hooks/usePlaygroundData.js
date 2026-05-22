import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getMonacoLanguage } from "../../../lib/piston";
import {
  getCurriculum,
  getLanguageProgress,
  enrollInPlayground,
  clearPlaygroundCache,
} from "../../../features/playground/playgroundApi";

export function usePlaygroundData({ user, language, location, dsaLang, setCode, setOutput, setTestResult, setShowCompletion }) {
  const navigate = useNavigate();
  const requestedProblemIdRef = useRef(
    new URLSearchParams(location.search).get("problem"),
  );
  const completionFiredRef = useRef(false);

  const [data, setData] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [completedProblems, setCompletedProblems] = useState(new Set());
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // Fetch curriculum + progress on mount
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      if (!user || !language) return;
      try {
        setIsLoadingProgress(true);
        const curRes = await getCurriculum(language);
        if (!isMounted) return;
        if (curRes.curriculum) {
          setData(curRes.curriculum);
          const { progress: currentProgress } = await getLanguageProgress(language);
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
            const found = chapter.problems.find((p) => !completedSet.has(p.id));
            if (found) { firstUnsolved = found; break; }
          }

          let targetProblem;
          const reqId = requestedProblemIdRef.current;
          if (reqId) {
            let requested = null;
            for (const ch of curRes.curriculum.chapters) {
              requested = ch.problems.find((p) => p.id === reqId);
              if (requested) break;
            }
            targetProblem = requested || firstUnsolved || curRes.curriculum.chapters[0].problems[0];
          } else {
            targetProblem = firstUnsolved || curRes.curriculum.chapters[0].problems[0];
          }

          setCurrentProblem(targetProblem);
          if (!firstUnsolved) setExpandedChapterId(curRes.curriculum.chapters[0].id);
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

  // Reset code/output when problem changes
  useEffect(() => {
    if (!currentProblem) return;
    setCode(
      typeof currentProblem.starterCode === "object"
        ? currentProblem.starterCode[dsaLang] || ""
        : currentProblem.starterCode || "",
    );
    setOutput(null);
    setTestResult(null);
  }, [currentProblem?.id]);

  const selectProblem = useCallback((prob, chapterId) => {
    setCurrentProblem(prob);
    if (chapterId) setExpandedChapterId(chapterId);
  }, []);

  // Derived progress stats
  const { totalProblems, completedCount, progressPercent } = useMemo(() => {
    const total = data?.chapters?.reduce((sum, ch) => sum + ch.problems.length, 0) || 0;
    const completed = completedProblems.size;
    return {
      totalProblems: total,
      completedCount: completed,
      progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [data, completedProblems]);

  // Lesson position (e.g. chapter 2, problem 1)
  const { currentChapterIdx, currentProblemIdx } = useMemo(() => {
    let cIdx = 0, pIdx = 0;
    if (currentProblem && data) {
      for (let ci = 0; ci < data.chapters.length; ci++) {
        const pi = data.chapters[ci].problems.findIndex((p) => p.id === currentProblem.id);
        if (pi !== -1) { cIdx = ci; pIdx = pi; break; }
      }
    }
    return { currentChapterIdx: cIdx, currentProblemIdx: pIdx };
  }, [currentProblem, data]);

  // Session completion trigger
  useEffect(() => {
    if (data && totalProblems > 0 && completedCount === totalProblems && !completionFiredRef.current) {
      completionFiredRef.current = true;
      const t = setTimeout(() => setShowCompletion(true), 900);
      return () => clearTimeout(t);
    }
  }, [data, totalProblems, completedCount]);

  // Execution mode derived from curriculum or language name
  const executionMode =
    data?.executionMode ||
    (["html", "css"].includes(language?.toLowerCase())
      ? "livepreview"
      : language?.toLowerCase() === "react"
        ? "react"
        : language?.toLowerCase() === "dsa"
          ? "dsa"
          : "piston");

  // Monaco language for the editor
  const editorLang =
    executionMode === "dsa" || typeof currentProblem?.starterCode === "object"
      ? getMonacoLanguage(dsaLang)
      : executionMode === "react"
        ? "javascript"
        : executionMode === "livepreview"
          ? language === "css" ? "css" : "html"
          : getMonacoLanguage(data?.pistonLanguage || language);

  // File name shown in editor tab
  const fileName = useMemo(() => {
    const extMap = { python: "py", javascript: "js", html: "html", css: "css", react: "jsx", java: "java" };
    const activeLang = typeof currentProblem?.starterCode === "object" ? dsaLang : language?.toLowerCase();
    return `main.${extMap[activeLang] || activeLang}`;
  }, [currentProblem, dsaLang, language]);

  return {
    data,
    currentProblem,
    setCurrentProblem,
    completedProblems,
    setCompletedProblems,
    expandedChapterId,
    setExpandedChapterId,
    isLoadingProgress,
    selectProblem,
    totalProblems,
    completedCount,
    progressPercent,
    currentChapterIdx,
    currentProblemIdx,
    executionMode,
    editorLang,
    fileName,
  };
}
