import React, { useState } from "react";
import {
 X,
 ChevronLeft,
 ChevronRight,
 Lightbulb,
 RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FlashcardViewer — A full-screen animated flashcard study component.
 *
 * Props:
 * - flashcards: Array<{ front, back, hint }>
 * - onClose: () => void
 */
export default function FlashcardViewer({ flashcards = [], onClose }) {
 const [currentIndex, setCurrentIndex] = useState(0);
 const [isFlipped, setIsFlipped] = useState(false);
 const [showHint, setShowHint] = useState(false);
 const [direction, setDirection] = useState(null); // 'left' | 'right' | null

 const card = flashcards[currentIndex];
 const total = flashcards.length;

 const goNext = () => {
  if (currentIndex < total - 1) {
   setDirection("right");
   setTimeout(() => {
    setCurrentIndex((i) => i + 1);
    setIsFlipped(false);
    setShowHint(false);
    setDirection(null);
   }, 200);
  }
 };

 const goPrev = () => {
  if (currentIndex > 0) {
   setDirection("left");
   setTimeout(() => {
    setCurrentIndex((i) => i - 1);
    setIsFlipped(false);
    setShowHint(false);
    setDirection(null);
   }, 200);
  }
 };

 const handleKeyDown = (e) => {
  if (e.key === "ArrowRight") goNext();
  if (e.key === "ArrowLeft") goPrev();
  if (e.key === " " || e.key === "Enter") setIsFlipped((f) => !f);
  if (e.key === "Escape") onClose();
 };

 if (!card) return null;

 return (
  <div
   className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center"
   onKeyDown={handleKeyDown}
   tabIndex={0}
   autoFocus
  >
   {/* Close Button */}
   <button
    onClick={onClose}
    className="absolute top-6 right-6 p-2 rounded-full bg-[#111111]/10 hover:bg-[#111111]/20 text-white transition-colors z-10"
   >
    <X className="w-6 h-6" />
   </button>

   {/* Progress */}
   <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
    <span className="text-white/70 text-sm font-bold tracking-widest uppercase">
     Flashcards
    </span>
    <div className="flex gap-1.5">
     {flashcards.map((_, i) => (
      <div
       key={i}
       className={cn(
        "w-2.5 h-2.5 rounded-full transition-all duration-300",
        i === currentIndex
         ? "bg-red-600 scale-125"
         : i < currentIndex
          ? "bg-red-600/50"
          : "bg-[#111111]/20",
       )}
      />
     ))}
    </div>
    <span className="text-white/50 text-sm font-mono">
     {currentIndex + 1}/{total}
    </span>
   </div>

   {/* Navigation Arrows */}
   <button
    onClick={goPrev}
    disabled={currentIndex === 0}
    className="absolute left-8 p-3 rounded-full bg-[#111111]/10 hover:bg-[#111111]/20 text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
   >
    <ChevronLeft className="w-8 h-8" />
   </button>

   <button
    onClick={goNext}
    disabled={currentIndex === total - 1}
    className="absolute right-8 p-3 rounded-full bg-[#111111]/10 hover:bg-[#111111]/20 text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
   >
    <ChevronRight className="w-8 h-8" />
   </button>

   {/* Card Container */}
   <div
    className={cn(
     "w-[500px] max-w-[90vw] h-[340px] cursor-pointer transition-transform duration-200",
     direction === "right" && "-translate-x-8 opacity-0",
     direction === "left" && "translate-x-8 opacity-0",
    )}
    style={{ perspective: "1200px" }}
    onClick={() => setIsFlipped((f) => !f)}
   >
    <div
     className="relative w-full h-full transition-transform duration-500"
     style={{
      transformStyle: "preserve-3d",
      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
     }}
    >
     {/* Front Face */}
     <div
      className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-600 to-orange-600 p-10 flex flex-col items-center justify-center text-center shadow-2xl shadow-red-500/20"
      style={{ backfaceVisibility: "hidden" }}
     >
      <span className="text-white/50 text-xs font-bold uppercase tracking-[0.3em] mb-4">
       Question
      </span>
      <p className="text-white text-2xl font-bold leading-relaxed">
       {card.front}
      </p>
      <span className="absolute bottom-5 text-white/30 text-xs">
       Click or press Space to flip
      </span>
     </div>

     {/* Back Face */}
     <div
      className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-10 flex flex-col items-center justify-center text-center shadow-2xl shadow-emerald-500/30"
      style={{
       backfaceVisibility: "hidden",
       transform: "rotateY(180deg)",
      }}
     >
      <span className="text-white/50 text-xs font-bold uppercase tracking-[0.3em] mb-4">
       Answer
      </span>
      <p className="text-white text-xl font-semibold leading-relaxed">
       {card.back}
      </p>
     </div>
    </div>
   </div>

   {/* Bottom Controls */}
   <div className="absolute bottom-8 flex items-center gap-4">
    <button
     onClick={(e) => {
      e.stopPropagation();
      setShowHint((h) => !h);
     }}
     className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111]/10 hover:bg-[#111111]/20 text-white text-sm font-medium transition-colors"
    >
     <Lightbulb className="w-4 h-4" />
     {showHint ? "Hide Hint" : "Show Hint"}
    </button>
    <button
     onClick={(e) => {
      e.stopPropagation();
      setIsFlipped(false);
      setCurrentIndex(0);
      setShowHint(false);
     }}
     className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111]/10 hover:bg-[#111111]/20 text-white text-sm font-medium transition-colors"
    >
     <RotateCcw className="w-4 h-4" />
     Restart
    </button>
   </div>

   {/* Hint toast */}
   {showHint && card.hint && (
    <div className="absolute bottom-24 bg-yellow-500/20 border border-yellow-500/30 text-yellow-200 px-6 py-3 rounded-xl text-sm font-medium max-w-md text-center backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
     💡 {card.hint}
    </div>
   )}
  </div>
 );
}
