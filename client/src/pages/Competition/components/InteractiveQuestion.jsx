import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, X, Code, Zap, Lightbulb, GripVertical, Send, SlidersHorizontal, Terminal,
} from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import VisualSequenceQuestion from "./visual/VisualSequenceQuestion";
import CodeTraceQuestion from "./visual/CodeTraceQuestion";

// ─── SHARED ANIMATIONS ─────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// ─── SHARED FEEDBACK ────────────────────────────────────────
const Feedback = ({ result, correctAnswerData }) => {
  if (!result) return null;
  const isCorrect = result.isCorrect;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={
        isCorrect
          ? { opacity: 1, y: 0, scale: [0.97, 1.05, 1], rotate: [0, -1, 1, 0] }
          : { opacity: 1, y: 0, scale: 1, x: [-8, 8, -8, 8, 0] }
      }
      transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.4 }}
      className={`mt-6 p-5 rounded-xl border backdrop-blur-sm relative overflow-hidden ${
        isCorrect
          ? "bg-green-500/10 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.15)]"
          : "bg-red-500/10 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
      }`}
    >
      <motion.div
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className={`absolute inset-0 pointer-events-none ${isCorrect ? "bg-green-500" : "bg-red-500"}`}
      />
      <div className="flex items-start gap-4 relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.1 }}
          className={`mt-0.5 p-2 rounded-full shrink-0 shadow-lg ${
            isCorrect
              ? "bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-green-500/30"
              : "bg-gradient-to-br from-red-400 to-rose-600 text-white shadow-red-500/30"
          }`}
        >
          {isCorrect ? <Check size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <p className={`font-black text-xl italic tracking-tight uppercase ${
              isCorrect
                ? "text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                : "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            }`}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>
            {result.pointsEarned > 0 && (
              <motion.span
                initial={{ scale: 0, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", delay: 0.2, stiffness: 300 }}
                className="flex items-center gap-1 text-sm font-black text-yellow-400 bg-yellow-500/20 px-3 py-0.5 rounded-full border border-yellow-500/30 italic"
              >
                <Zap size={14} className="fill-yellow-400" />+{result.pointsEarned} XP
              </motion.span>
            )}
          </div>
          {result.explanation && (
            <p className={`text-sm mt-2 leading-relaxed font-medium ${isCorrect ? "text-green-300" : "text-red-300"}`}>
              {result.explanation}
            </p>
          )}
          {!isCorrect && correctAnswerData && (
            <div className="mt-4 text-sm bg-black/40 p-4 rounded-xl border border-white/10 shadow-inner">
              <span className="font-bold text-zinc-400 text-xs uppercase tracking-wider flex items-center gap-2 mb-3">
                <Lightbulb size={14} className="text-yellow-400" /> Correct Answer
              </span>
              <div className="font-mono text-sm text-emerald-400 space-y-2">
                {Array.isArray(correctAnswerData) ? (
                  correctAnswerData.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-1 bg-emerald-500/5 px-3 rounded-lg border border-emerald-500/10">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      {typeof item === "object" ? JSON.stringify(item) : String(item)}
                    </div>
                  ))
                ) : (
                  <div className="bg-emerald-500/5 px-3 py-2 rounded-lg border border-emerald-500/10">
                    {String(correctAnswerData)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── COMPONENT: Classic MCQ ──────────────────────────────────
const MCQQuestion = ({ question, onSubmit, result, isSubmitting, selectedAnswer }) => {
  const quizizzColors = [
    { base: "bg-red-500", hover: "hover:bg-red-600", border: "border-red-600", activeBg: "bg-red-400", text: "text-white", shadow: "shadow-[0_8px_0_0_#991b1b]", activeShadow: "shadow-[0_2px_0_0_#991b1b]" },
    { base: "bg-blue-500", hover: "hover:bg-blue-600", border: "border-blue-600", activeBg: "bg-blue-400", text: "text-white", shadow: "shadow-[0_8px_0_0_#1e3a8a]", activeShadow: "shadow-[0_2px_0_0_#1e3a8a]" },
    { base: "bg-yellow-400", hover: "hover:bg-yellow-500", border: "border-yellow-500", activeBg: "bg-yellow-300", text: "text-black", shadow: "shadow-[0_8px_0_0_#a16207]", activeShadow: "shadow-[0_2px_0_0_#a16207]" },
    { base: "bg-green-500", hover: "hover:bg-green-600", border: "border-green-600", activeBg: "bg-green-400", text: "text-white", shadow: "shadow-[0_8px_0_0_#166534]", activeShadow: "shadow-[0_2px_0_0_#166534]" },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center min-h-[150px] mb-8 w-full">
        <motion.h3 variants={itemVariants} className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-center leading-tight tracking-tight drop-shadow-md select-text text-metallic">
          {question.question}
        </motion.h3>
        {question.imageUrl && (
          <motion.div variants={itemVariants} className="mt-6 w-full max-w-lg mx-auto rounded-2xl overflow-hidden border-4 border-zinc-800 shadow-2xl">
            <img src={question.imageUrl} alt="Question Visual" className="w-full h-auto object-contain max-h-[300px] bg-black/40" />
          </motion.div>
        )}
      </div>

      {question.scenario && (
        <motion.div variants={itemVariants} className="bg-zinc-800/30 border-l-4 border-orange-500 rounded-r-xl p-5 mb-6 max-w-4xl mx-auto w-full">
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{question.scenario}</p>
        </motion.div>
      )}

      {(question.buggyCode || question.contextCode) && (
        <motion.div variants={itemVariants} className="bg-zinc-950 border-2 border-zinc-800 rounded-2xl overflow-hidden mb-8 max-w-4xl mx-auto w-full shadow-lg">
          <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center gap-2">
            <Code size={16} className="text-orange-400" />
            <span className="text-[11px] text-zinc-400 uppercase tracking-widest font-black">{question.buggyCode ? "Code to Review" : "Context"}</span>
          </div>
          <pre className="p-5 text-[15px] text-zinc-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed custom-scrollbar">
            {question.buggyCode || question.contextCode}
          </pre>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-5xl mx-auto w-full mb-6">
        {question.options?.map((option, i) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = result?.correctAnswer === option;
          const showResult = !!result;
          const theme = quizizzColors[i % 4];
          let cardStyle = `${theme.base} ${theme.border} ${theme.text} ${theme.hover} ${theme.shadow} hover:-translate-y-1 hover:shadow-[0_12px_0_0_rgba(0,0,0,0.5)] active:translate-y-2 active:shadow-[0_0px_0_0_rgba(0,0,0,0)]`;

          if (showResult) {
            if (isCorrect) {
              cardStyle = "bg-green-500 border-green-600 text-white shadow-[0_8px_0_0_#166534] scale-[1.02] ring-4 ring-green-400/50 z-10";
            } else if (isSelected && !isCorrect) {
              cardStyle = "bg-red-500 border-red-600 text-white shadow-[0_4px_0_0_#991b1b] opacity-90 translate-y-2 opacity-50 grayscale-[50%]";
            } else {
              cardStyle = "bg-zinc-800 border-zinc-700 text-zinc-500 shadow-none opacity-40 grayscale pointer-events-none";
            }
          } else if (isSelected) {
            cardStyle = `${theme.activeBg} border-white text-white translate-y-2 ${theme.activeShadow} ring-4 ring-white/30`;
          }

          return (
            <motion.div key={i} variants={itemVariants} className="h-full flex flex-col">
              <button
                className={`w-full h-full min-h-[100px] text-center p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden group ${result ? "pointer-events-none cursor-default" : "cursor-pointer"} ${cardStyle}`}
                onClick={() => !result && onSubmit(option)}
                disabled={!!result || isSubmitting}
              >
                {!result && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
                {showResult && (isCorrect || (isSelected && !isCorrect)) && (
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm border-2 border-white text-white drop-shadow-md">
                    {isCorrect ? <Check size={18} strokeWidth={4} /> : <X size={18} strokeWidth={4} />}
                  </div>
                )}
                <span className="w-full break-words text-lg md:text-xl xl:text-2xl font-black drop-shadow-md select-none px-4">{option}</span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {!isSubmitting && <Feedback result={result} correctAnswerData={result?.correctAnswer} />}
    </motion.div>
  );
};

// ─── COMPONENT: Drag Order ──────────────────────────────────

// Pure visual card — used both in-list and in DragOverlay
function DragOrderCard({ index, label, isDragging, isDragOverlay, gripProps, disabled }) {
  return (
    <div
      className={`relative flex items-stretch rounded-2xl border-2 select-none overflow-hidden transition-colors duration-100 ${
        isDragOverlay
          ? "bg-zinc-800 border-orange-400/80 shadow-[0_28px_60px_rgba(0,0,0,0.85),0_0_0_1px_rgba(249,115,22,0.2)]"
          : isDragging
          ? "border-dashed border-zinc-700/50 bg-zinc-900/10 opacity-20"
          : disabled
          ? "bg-zinc-900/40 border-zinc-800/40 opacity-50"
          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 hover:shadow-[0_2px_20px_rgba(0,0,0,0.35)]"
      }`}
      style={isDragOverlay ? { transform: "scale(1.04) rotate(1.5deg)" } : {}}
    >
      {/* Number column */}
      <div
        className={`flex items-center justify-center w-14 shrink-0 border-r-2 ${
          isDragOverlay
            ? "border-orange-400/25 bg-orange-500/10"
            : isDragging
            ? "border-zinc-700/25"
            : "border-zinc-800 bg-zinc-950/60"
        }`}
      >
        <span
          className={`text-sm font-black tabular-nums leading-none ${
            isDragOverlay ? "text-orange-300" : isDragging ? "text-zinc-800" : "text-zinc-500"
          }`}
        >
          {index + 1}
        </span>
      </div>

      {/* Label */}
      <div className="flex-1 px-4 py-4">
        <span
          className={`text-sm font-semibold leading-snug ${
            isDragOverlay ? "text-white" : isDragging ? "text-zinc-800" : "text-zinc-200"
          }`}
        >
          {label}
        </span>
      </div>

      {/* Grip handle */}
      {!disabled && (
        <div
          {...(gripProps || {})}
          className={`flex items-center px-3.5 border-l-2 transition-colors ${
            isDragOverlay
              ? "border-orange-400/20 text-orange-400 cursor-grabbing"
              : isDragging
              ? "border-zinc-700/25 text-zinc-800"
              : "border-zinc-800/70 text-zinc-700 hover:text-zinc-300 hover:bg-zinc-700/25 cursor-grab active:cursor-grabbing"
          }`}
        >
          <GripVertical size={16} />
        </div>
      )}
    </div>
  );
}

// Sortable wrapper — gives the card its drag transform
function DragOrderItem({ id, index, label, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  return (
    <motion.div ref={setNodeRef} layout style={{ transform: CSS.Transform.toString(transform), transition }}>
      <DragOrderCard
        index={index}
        label={label}
        isDragging={isDragging}
        isDragOverlay={false}
        gripProps={{ ...attributes, ...listeners, tabIndex: -1 }}
        disabled={disabled}
      />
    </motion.div>
  );
}

const DragOrderQuestion = ({ question, onSubmit, result, isSubmitting }) => {
  const { items } = question;

  const [order, setOrder] = useState(() => {
    const idx = items.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  });
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback(({ active }) => setActiveId(active.id), []);
  const handleDragCancel = useCallback(() => setActiveId(null), []);
  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id || result) return;
    setOrder((prev) => {
      const from = prev.findIndex((v) => String(v) === active.id);
      const to   = prev.findIndex((v) => String(v) === over.id);
      return from === -1 || to === -1 ? prev : arrayMove(prev, from, to);
    });
  }, [result]);

  const handleSubmit = () => {
    if (result || isSubmitting) return;
    onSubmit({ value: order });
  };

  const activePos  = activeId !== null ? order.findIndex((v) => String(v) === activeId) : -1;
  const activeLabel = activeId !== null ? items[order[activePos]] : null;

  return (
    <div className="space-y-5 w-full">
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-extrabold text-center leading-tight text-white"
      >
        {question.question}
      </motion.h3>

      <div className="max-w-xl mx-auto space-y-4">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
          <GripVertical size={11} className="text-zinc-700" /> Drag to reorder
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={order.map(String)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2.5">
              {order.map((itemIdx, pos) => (
                <DragOrderItem
                  key={String(itemIdx)}
                  id={String(itemIdx)}
                  index={pos}
                  label={items[itemIdx]}
                  disabled={!!result}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
            {activeLabel !== null && (
              <DragOrderCard
                index={activePos}
                label={activeLabel}
                isDragging={false}
                isDragOverlay
                disabled={false}
              />
            )}
          </DragOverlay>
        </DndContext>

        {!result && (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm mt-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-[0_2px_20px_rgba(249,115,22,0.25)] active:scale-[0.99]"
          >
            <Send size={15} /> Submit Order
          </motion.button>
        )}
      </div>

      <Feedback result={result} correctAnswerData={result?.correctAnswer} />
    </div>
  );
};

// ─── COMPONENT: Drag Match ───────────────────────────────────

// Color palette — each matched pair gets its own color
const MATCH_COLORS = [
  { bar: "bg-violet-500",  bg: "bg-violet-500/15",  border: "border-violet-500/55",  text: "text-violet-200",  badge: "bg-violet-500 text-white"  },
  { bar: "bg-cyan-500",    bg: "bg-cyan-500/15",    border: "border-cyan-500/55",    text: "text-cyan-200",    badge: "bg-cyan-500 text-white"    },
  { bar: "bg-rose-500",    bg: "bg-rose-500/15",    border: "border-rose-500/55",    text: "text-rose-200",    badge: "bg-rose-500 text-white"    },
  { bar: "bg-amber-400",   bg: "bg-amber-500/15",   border: "border-amber-500/55",   text: "text-amber-200",   badge: "bg-amber-400 text-zinc-900" },
  { bar: "bg-emerald-500", bg: "bg-emerald-500/15", border: "border-emerald-500/55", text: "text-emerald-200", badge: "bg-emerald-500 text-white"  },
  { bar: "bg-orange-500",  bg: "bg-orange-500/15",  border: "border-orange-500/55",  text: "text-orange-200",  badge: "bg-orange-500 text-white"  },
];

const DragMatchQuestion = ({ question, onSubmit, result, isSubmitting }) => {
  const leftItems = question.pairs?.left || [];
  const rightItems = question.pairs?.right || [];

  // matches: leftIdx → rightIdx
  const [matches, setMatches] = useState({});
  const [selectedLeft, setSelectedLeft] = useState(null);

  // rightIdx → leftIdx (inverse map for quick lookup)
  const rightToLeft = Object.fromEntries(
    Object.entries(matches).map(([l, r]) => [r, Number(l)]),
  );

  const handleLeftClick = (idx) => {
    if (result) return;
    setSelectedLeft((prev) => (prev === idx ? null : idx));
  };

  const handleRightClick = (rightIdx) => {
    if (result || selectedLeft === null) return;
    setMatches((prev) => {
      const next = { ...prev };
      delete next[selectedLeft];
      for (const [k, v] of Object.entries(next)) {
        if (v === rightIdx) delete next[k];
      }
      next[selectedLeft] = rightIdx;
      return next;
    });
    setSelectedLeft(null);
  };

  const matchedCount = Object.keys(matches).length;
  const allMatched   = leftItems.length > 0 && matchedCount === leftItems.length;

  const handleSubmit = () => {
    if (!allMatched || result || isSubmitting) return;
    onSubmit({ value: leftItems.map((_, i) => matches[i] ?? -1) });
  };

  return (
    <div className="space-y-5 w-full">
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-extrabold text-center leading-tight text-white"
      >
        {question.question}
      </motion.h3>

      {/* Contextual hint line */}
      <AnimatePresence mode="wait">
        <motion.p
          key={selectedLeft !== null ? "sel" : "idle"}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="text-center text-sm font-medium min-h-[20px]"
        >
          {selectedLeft !== null ? (
            <span className="text-orange-300">
              Now pick a match for:{" "}
              <span className="text-white font-bold">{leftItems[selectedLeft]}</span>
            </span>
          ) : (
            <span className="text-zinc-600">
              Click a concept, then click its matching definition
            </span>
          )}
        </motion.p>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
        {/* Left — Concepts */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-zinc-700 rounded" /> Concepts
          </p>
          {leftItems.map((item, i) => {
            const isSelected = selectedLeft === i;
            const isMatched  = matches[i] !== undefined;
            const color      = MATCH_COLORS[i % MATCH_COLORS.length];
            return (
              <motion.button
                key={i}
                layout
                onClick={() => handleLeftClick(i)}
                disabled={!!result}
                whileTap={!result ? { scale: 0.97 } : {}}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-semibold transition-all relative ${
                  result
                    ? isMatched
                      ? `${color.bg} ${color.border} ${color.text} cursor-default`
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 cursor-default"
                    : isSelected
                    ? "bg-orange-500/15 border-orange-400/70 text-orange-100 shadow-[0_0_22px_rgba(249,115,22,0.18)] ring-2 ring-orange-500/25 cursor-pointer"
                    : isMatched
                    ? `${color.bg} ${color.border} ${color.text} hover:opacity-90 cursor-pointer`
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/60 cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="leading-snug">{item}</span>
                  {isMatched && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${color.badge}`}
                    >
                      {i + 1}
                    </motion.span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Right — Definitions */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 flex items-center justify-end gap-1.5">
            Definitions <span className="inline-block w-3 h-0.5 bg-zinc-700 rounded" />
          </p>
          {rightItems.map((item, i) => {
            const matchedLeftIdx = rightToLeft[i];
            const isUsed         = matchedLeftIdx !== undefined;
            const isClickable    = !result && selectedLeft !== null && !isUsed;
            const color          = isUsed ? MATCH_COLORS[matchedLeftIdx % MATCH_COLORS.length] : null;
            return (
              <motion.button
                key={i}
                layout
                onClick={() => handleRightClick(i)}
                disabled={!!result || selectedLeft === null}
                whileTap={isClickable ? { scale: 0.97 } : {}}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm transition-all ${
                  result
                    ? isUsed
                      ? `${color.bg} ${color.border} ${color.text} cursor-default`
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 cursor-default"
                    : isUsed
                    ? `${color.bg} ${color.border} ${color.text} hover:opacity-90 cursor-pointer`
                    : isClickable
                    ? "bg-zinc-900 border-zinc-600 text-zinc-200 hover:border-orange-500/50 hover:bg-zinc-800 cursor-pointer shadow-[0_0_0_1px_rgba(249,115,22,0.08)]"
                    : "bg-zinc-900/50 border-zinc-800/50 text-zinc-600 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isUsed && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${color.badge}`}
                    >
                      {matchedLeftIdx + 1}
                    </motion.span>
                  )}
                  <span className="leading-snug">{item}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Progress pip bar + submit */}
      {!result && (
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex gap-1.5">
            {leftItems.map((_, i) => (
              <motion.div
                key={i}
                animate={{ scaleX: matches[i] !== undefined ? 1 : 1 }}
                className={`flex-1 h-1 rounded-full transition-all duration-400 ${
                  matches[i] !== undefined
                    ? MATCH_COLORS[i % MATCH_COLORS.length].bar
                    : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!allMatched || isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-[0_2px_20px_rgba(249,115,22,0.25)] active:scale-[0.99]"
          >
            <Send size={15} />
            {allMatched
              ? "Submit Matches"
              : `${matchedCount} / ${leftItems.length} matched`}
          </button>
        </div>
      )}

      <Feedback result={result} correctAnswerData={result?.correctAnswer} />
    </div>
  );
};

// ─── COMPONENT: Predict Output ──────────────────────────────
const PredictOutputQuestion = ({ question, onSubmit, result, isSubmitting }) => {
  const [answer, setAnswer] = useState("");
  const language = question.language || "javascript";
  const ext = language === "python" ? "py" : language === "java" ? "java" : language === "cpp" ? "cpp" : "js";

  const handleSubmit = () => {
    if (!answer.trim() || result || isSubmitting) return;
    onSubmit({ value: answer.trim() });
  };

  return (
    <div className="space-y-5 w-full">
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-extrabold text-center leading-tight text-white"
      >
        {question.question}
      </motion.h3>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.07 } }}
        className="rounded-2xl overflow-hidden border border-zinc-800 shadow-lg max-w-2xl mx-auto"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <Terminal size={13} className="text-orange-400 ml-1" />
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
            code.{ext} — what does this output?
          </span>
        </div>
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          showLineNumbers
          customStyle={{ margin: 0, background: "#0a0a0a", padding: "16px", fontSize: "13px", lineHeight: "1.65" }}
          lineNumberStyle={{ color: "#3f3f46", minWidth: "2em" }}
        >
          {question.codeSnippet || ""}
        </SyntaxHighlighter>
      </motion.div>

      {!result ? (
        <div className="flex gap-3 max-w-2xl mx-auto">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Type the exact output..."
            className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm font-mono placeholder-zinc-600 focus:outline-none focus:border-orange-500/60 transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || isSubmitting}
            className="px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white"
          >
            <Send size={15} />
          </button>
        </div>
      ) : (
        <Feedback result={result} correctAnswerData={result?.correctAnswer} />
      )}
    </div>
  );
};

// ─── COMPONENT: Slider Adjust ────────────────────────────────
const SliderQuestion = ({ question, onSubmit, result, isSubmitting }) => {
  const sliders = question.sliders || [];
  const [values, setValues] = useState(() =>
    sliders.map((s) => Math.round((s.min + s.max) / 2)),
  );

  const handleChange = (idx, val) => {
    if (result) return;
    setValues((prev) => {
      const next = [...prev];
      next[idx] = Number(val);
      return next;
    });
  };

  const handleSubmit = () => {
    if (result || isSubmitting) return;
    onSubmit({ value: values });
  };

  return (
    <div className="space-y-6 w-full">
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-extrabold text-center leading-tight text-white"
      >
        {question.question}
      </motion.h3>

      <div className="space-y-6 max-w-xl mx-auto">
        {sliders.map((slider, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0, transition: { delay: i * 0.08 } }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3"
          >
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-zinc-300">{slider.label}</label>
              <span className="text-orange-400 font-black font-mono text-lg tabular-nums">
                {values[i]}
                <span className="text-zinc-500 text-sm font-normal ml-0.5">{slider.unit}</span>
              </span>
            </div>
            <input
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step || 1}
              value={values[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              disabled={!!result}
              className="w-full h-2 rounded-full appearance-none bg-zinc-700 accent-orange-500 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-[11px] text-zinc-600">
              <span>{slider.min}{slider.unit}</span>
              <span>{slider.max}{slider.unit}</span>
            </div>
          </motion.div>
        ))}

        {!result && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-[0_2px_20px_rgba(249,115,22,0.25)] active:scale-[0.99]"
          >
            <SlidersHorizontal size={15} /> Submit Values
          </button>
        )}
      </div>

      {result && <Feedback result={result} correctAnswerData={result?.correctAnswer} />}
    </div>
  );
};

// ─── MAIN DISPATCHER ────────────────────────────────────────
export default function InteractiveQuestion(props) {
  const { question } = props;
  if (!question) return null;

  const { interactionType } = question;

  if (interactionType === "visual_sequence") return <VisualSequenceQuestion {...props} />;
  if (interactionType === "code_trace")      return <CodeTraceQuestion {...props} />;
  if (interactionType === "drag_order")      return <DragOrderQuestion {...props} />;
  if (interactionType === "drag_match")      return <DragMatchQuestion {...props} />;
  if (interactionType === "predict_output")  return <PredictOutputQuestion {...props} />;
  if (interactionType === "slider_adjust")   return <SliderQuestion {...props} />;

  return <MCQQuestion {...props} />;
}
