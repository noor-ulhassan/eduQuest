import React, { useEffect, useRef, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

// SlideshowPlayer renders a fullscreen modal that walks through each
// topic in the chapter one at a time, with optional text-to-speech narration.
export default function SlideshowPlayer({ chapter, onClose }) {
  const topics = chapter?.topics || [];
  const total = topics.length;

  // ── State ────────────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [slideVisible, setSlideVisible] = useState(true);

  // ── Refs ─────────────────────────────────────────────────────────────────
  // Mirrors of state values so that setTimeout / speechSynthesis callbacks
  // always read the current value without causing stale closures.
  const currentIndexRef = useRef(0);
  const isPausedRef = useRef(false);
  const isAudioOnRef = useRef(true);
  // Holds the auto-advance setTimeout id so we can cancel it at any time.
  const timerRef = useRef(null);
  // Holds the latest nav handler functions so the keyboard listener
  // (registered once) always calls the up-to-date version.
  const handlersRef = useRef({});

  // Keep refs in sync on every render (no useEffect needed — refs are mutable).
  currentIndexRef.current = currentIndex;
  isPausedRef.current = isPaused;
  isAudioOnRef.current = isAudioOn;

  // ── Utilities ─────────────────────────────────────────────────────────────

  // Clears any pending auto-advance timer.
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Stops all ongoing speech immediately.
  const cancelSpeech = () => window.speechSynthesis.cancel();

  // Advances to the next slide, or marks the chapter done if on the last slide.
  const advance = () => {
    const next = currentIndexRef.current + 1;
    if (next >= total) {
      setIsDone(true);
    } else {
      setCurrentIndex(next);
    }
  };

  // ── Core: begin a slide ───────────────────────────────────────────────────
  // Animates the slide in, then either speaks the topic aloud (audio ON)
  // or sets a 5-second fallback timer (audio OFF).
  const startSlide = (topic) => {
    cancelSpeech();
    clearTimer();

    // Brief fade: hide → show so the new content feels like a transition.
    setSlideVisible(false);
    setTimeout(() => setSlideVisible(true), 150);

    if (!isAudioOnRef.current) {
      // Audio is off — auto-advance after 5 seconds.
      timerRef.current = setTimeout(() => {
        if (!isPausedRef.current) advance();
      }, 5000);
      return;
    }

    // Build the narration script: topic name → key concept titles → pro tip.
    const lines = [topic.topic];
    if (topic.keyConcepts?.length > 0) {
      lines.push("Key concepts:");
      topic.keyConcepts.forEach((c) => lines.push(c.title));
    }
    if (topic.proTip) lines.push("Pro tip. " + topic.proTip);

    const utterance = new SpeechSynthesisUtterance(lines.join(". "));
    utterance.rate = 0.95;

    // When speech finishes naturally, wait 1 second then go to the next slide.
    utterance.onend = () => {
      if (!isPausedRef.current) {
        timerRef.current = setTimeout(advance, 1000);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // ── Effect: react to slide changes ────────────────────────────────────────
  // Runs whenever the active slide index changes (including on initial mount).
  useEffect(() => {
    if (isDone) return;
    const topic = topics[currentIndex];
    if (!topic || isPausedRef.current) return;
    startSlide(topic);
  }, [currentIndex, isDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect: cleanup on unmount ────────────────────────────────────────────
  // Ensures speech and timers never outlive the component.
  useEffect(() => {
    return () => {
      cancelSpeech();
      clearTimer();
    };
  }, []);

  // ── Navigation handlers ───────────────────────────────────────────────────

  const goToSlide = (index) => {
    if (index < 0 || index >= total) return;
    cancelSpeech();
    clearTimer();
    setIsPaused(false);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndexRef.current + 1 >= total) {
      cancelSpeech();
      clearTimer();
      setIsDone(true);
    } else {
      goToSlide(currentIndexRef.current + 1);
    }
  };

  const handlePrevious = () => {
    goToSlide(currentIndexRef.current - 1);
  };

  const handlePauseResume = () => {
    if (isPausedRef.current) {
      // ── Resume ──
      setIsPaused(false);
      if (isAudioOnRef.current) {
        window.speechSynthesis.resume();
        // If speech already finished while paused, re-speak the current slide.
        if (!window.speechSynthesis.speaking) {
          startSlide(topics[currentIndexRef.current]);
        }
      } else {
        // Audio off — restart the 5-second fallback timer.
        timerRef.current = setTimeout(advance, 5000);
      }
    } else {
      // ── Pause ──
      setIsPaused(true);
      clearTimer();
      window.speechSynthesis.pause();
    }
  };

  const handleToggleAudio = () => {
    const wasAudioOn = isAudioOnRef.current;
    setIsAudioOn(!wasAudioOn);
    cancelSpeech();
    clearTimer();

    if (!isPausedRef.current) {
      if (!wasAudioOn) {
        // Audio was off, now on → speak the current slide.
        startSlide(topics[currentIndexRef.current]);
      } else {
        // Audio was on, now off → use the 5-second timer instead.
        timerRef.current = setTimeout(advance, 5000);
      }
    }
  };

  const handleClose = () => {
    cancelSpeech();
    clearTimer();
    onClose();
  };

  // ── Effect: keyboard shortcuts ─────────────────────────────────────────────
  // Registered once on mount. Uses handlersRef so it always calls the
  // latest handler version without needing to re-register the listener.
  handlersRef.current = { handleNext, handlePrevious, handlePauseResume };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") handlersRef.current.handleNext();
      else if (e.key === "ArrowLeft") handlersRef.current.handlePrevious();
      else if (e.key === " ") {
        e.preventDefault();
        handlersRef.current.handlePauseResume();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const topic = topics[currentIndex];
  const progressPercent =
    total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl bg-[#111111] border border-white/10 rounded-2xl shadow-2xl shadow-black/70 flex flex-col overflow-hidden"
        style={{ minHeight: "500px", maxHeight: "90vh" }}
      >
        {/* ── Close button ── */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
          aria-label="Close slideshow"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── Chapter Complete screen ── */}
        {isDone ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 px-12 py-20 text-center">
            <span className="text-6xl select-none">🎉</span>
            <h2 className="text-3xl font-bold text-white font-space-grotesk">
              Chapter Complete!
            </h2>
            <p className="text-zinc-400">
              You've reviewed all topics in this chapter.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20"
            >
              Back to Chapter
            </button>
          </div>
        ) : (
          <>
            {/* ── Progress bar + controls ── */}
            <div className="px-8 pt-6 pb-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-zinc-400">
                  Topic {currentIndex + 1} of {total}
                </span>

                {/* Audio toggle and pause/resume sit together in the top-right */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleToggleAudio}
                    className="p-1.5 rounded-full hover:bg-white/5 transition-colors"
                    title={isAudioOn ? "Mute narration" : "Unmute narration"}
                    aria-label={isAudioOn ? "Mute narration" : "Unmute narration"}
                  >
                    {isAudioOn ? (
                      <Volume2 className="w-4 h-4 text-red-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-zinc-500" />
                    )}
                  </button>
                  <button
                    onClick={handlePauseResume}
                    className="p-1.5 rounded-full hover:bg-white/5 transition-colors"
                    title={isPaused ? "Resume" : "Pause"}
                    aria-label={isPaused ? "Resume narration" : "Pause narration"}
                  >
                    {isPaused ? (
                      <Play className="w-4 h-4 text-red-400" />
                    ) : (
                      <Pause className="w-4 h-4 text-red-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Thin progress bar */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* ── Slide content ── */}
            <div
              className={`flex-1 px-8 py-8 flex flex-col gap-6 overflow-y-auto transition-opacity duration-300 ${
                slideVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Topic title */}
              <h2 className="text-3xl font-bold text-white font-space-grotesk leading-tight">
                {topic?.topic}
              </h2>

              {/* Key concepts as bullet list */}
              {topic?.keyConcepts?.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Key Concepts
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {topic.keyConcepts.map((concept, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-2 h-2 shrink-0 rounded-full bg-red-500" />
                        <span className="text-zinc-300 font-medium">
                          {concept.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pro tip — pinned to the bottom of the slide */}
              {topic?.proTip && (
                <div className="mt-auto bg-red-600/10 border border-red-500/20 rounded-xl p-5 flex items-start gap-3">
                  <span className="text-xl select-none shrink-0">💡</span>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {topic.proTip}
                  </p>
                </div>
              )}
            </div>

            {/* ── Navigation controls ── */}
            <div className="px-8 py-5 border-t border-white/10 flex items-center justify-between">
              {/* Previous */}
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {/* Dot indicators — click any dot to jump to that slide */}
              <div className="flex items-center gap-1.5">
                {topics.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? "w-4 h-2 bg-red-500"
                        : "w-2 h-2 bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to topic ${i + 1}`}
                  />
                ))}
              </div>

              {/* Next / Finish */}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20"
              >
                {currentIndex === total - 1 ? "Finish" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
