import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getMonacoLanguage } from "../../../lib/piston";
import { useCurriculum, useLanguageProgress } from "../../../features/playground/usePlayground";
import { enrollInPlayground } from "../../../features/playground/playgroundApi";

export function usePlaygroundData({ user, language, location, setCode, setOutput, setTestResult, setShowCompletion }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const requestedProblemIdRef = useRef(
    new URLSearchParams(location.search).get("problem"),
  );
  const completionFiredRef   = useRef(false);
  const enrollInitiatedRef   = useRef(false);
  const hasInitializedRef    = useRef(false);

  const [data, setData]                       = useState(null);
  const [currentProblem, setCurrentProblem]   = useState(null);
  const [completedProblems, setCompletedProblems] = useState(new Set());
  const [expandedChapterId, setExpandedChapterId] = useState(null);

  const { data: curRes,      isLoading: curriculumLoading } = useCurriculum(language);
  const { data: progressRes, isLoading: progressLoading   } = useLanguageProgress(language);

  const isLoadingProgress = curriculumLoading || progressLoading;

  // Initialise curriculum, completed set, and starting problem once queries resolve
  useEffect(() => {
    if (!curRes?.curriculum || progressLoading) return;

    const curriculum = curRes.curriculum;
    setData(curriculum);

    if (hasInitializedRef.current) return;

    const currentProgress = progressRes?.progress;
    let completedSet = new Set();

    if (currentProgress) {
      completedSet = new Set(currentProgress.completedProblems);
    } else if (!enrollInitiatedRef.current) {
      enrollInitiatedRef.current = true;
      enrollInPlayground(language)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["playground", "progress", language] });
          queryClient.invalidateQueries({ queryKey: ["playground", "progress"] });
          toast.success("Enrolled! Let's begin 🚀");
        })
        .catch((err) => {
          enrollInitiatedRef.current = false;
          console.error("[Playground] Auto-enroll failed:", err);
        });
      return;
    } else {
      return;
    }

    setCompletedProblems(completedSet);

    let firstUnsolved = null;
    for (const chapter of curriculum.chapters) {
      const found = chapter.problems.find((p) => !completedSet.has(p.id));
      if (found) { firstUnsolved = found; break; }
    }

    let targetProblem;
    const reqId = requestedProblemIdRef.current;
    if (reqId) {
      let requested = null;
      for (const ch of curriculum.chapters) {
        requested = ch.problems.find((p) => p.id === reqId);
        if (requested) break;
      }
      targetProblem = requested || firstUnsolved || curriculum.chapters[0]?.problems[0];
    } else {
      targetProblem = firstUnsolved || curriculum.chapters[0]?.problems[0];
    }

    if (targetProblem) setCurrentProblem(targetProblem);
    if (!firstUnsolved) setExpandedChapterId(curriculum.chapters[0]?.id);
    hasInitializedRef.current = true;
  }, [curRes, progressRes, progressLoading, language, queryClient]);

  // Navigate away if curriculum not found
  useEffect(() => {
    if (!curriculumLoading && curRes && !curRes.curriculum) {
      toast.error("Curriculum not found");
      navigate("/playground");
    }
  }, [curRes, curriculumLoading, navigate]);

  // Reset editor when problem changes
  useEffect(() => {
    if (!currentProblem) return;
    setCode(
      typeof currentProblem.starterCode === "string"
        ? currentProblem.starterCode
        : "",
    );
    setOutput(null);
    setTestResult(null);
  }, [currentProblem?.id]);

  const selectProblem = useCallback((prob, chapterId) => {
    setCurrentProblem(prob);
    if (chapterId) setExpandedChapterId(chapterId);
  }, []);

  const { totalProblems, completedCount, progressPercent } = useMemo(() => {
    const total     = data?.chapters?.reduce((sum, ch) => sum + ch.problems.length, 0) || 0;
    const completed = completedProblems.size;
    return {
      totalProblems:   total,
      completedCount:  completed,
      progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [data, completedProblems]);

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

  useEffect(() => {
    if (data && totalProblems > 0 && completedCount === totalProblems && !completionFiredRef.current) {
      completionFiredRef.current = true;
      const t = setTimeout(() => setShowCompletion(true), 900);
      return () => clearTimeout(t);
    }
  }, [data, totalProblems, completedCount]);

  // Execution mode: read from curriculum doc, fall back based on language slug
  const executionMode =
    data?.executionMode ||
    (["html", "css"].includes(language?.toLowerCase())
      ? "livepreview"
      : language?.toLowerCase() === "react"
        ? "react"
        : "piston");

  // Monaco editor language
  const editorLang =
    executionMode === "react"
      ? "javascript"
      : executionMode === "livepreview"
        ? language?.toLowerCase() === "css" ? "css" : "html"
        : getMonacoLanguage(data?.pistonLanguage || language);

  // File name shown in editor toolbar
  const fileName = useMemo(() => {
    const extMap = {
      javascript: "js", typescript: "ts", python: "py",  python3: "py",
      java: "java",     "c++": "cpp",     cpp: "cpp",    c: "c",
      go: "go",         rust: "rs",       kotlin: "kt",  ruby: "rb",
      php: "php",       csharp: "cs",     swift: "swift",dart: "dart",
      html: "html",     css: "css",       react: "jsx",
    };
    const activeLang = (data?.pistonLanguage || language)?.toLowerCase();
    return `main.${extMap[activeLang] || activeLang || "txt"}`;
  }, [data?.pistonLanguage, language]);

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
