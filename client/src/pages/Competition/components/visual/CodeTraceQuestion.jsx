import React, { useState, useCallback, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Send, Terminal, Play, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import VisualResultOverlay from "./VisualResultOverlay";

// ─── Variable badge ───────────────────────────────────────────
function VarBadge({ k, v }) {
  const stringified = JSON.stringify(v);
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1 text-[11px] font-mono bg-zinc-800/80 border border-zinc-700/80 rounded-md px-2 py-0.5"
    >
      <span className="text-sky-400 font-bold">{k}</span>
      <span className="text-zinc-600">=</span>
      <span className="text-emerald-400 max-w-[100px] truncate">{stringified}</span>
    </motion.span>
  );
}

// ─── Sortable snapshot card ──────────────────────────────────
function SnapshotCardVisual({
  index,
  step,
  isDragging,
  isDragOverlay,
  gripProps,
  disabled,
  isExecuting,
  isExecuted,
}) {
  return (
    <div
      className={`relative rounded-xl border overflow-hidden select-none transition-all duration-150 ${
        isDragOverlay
          ? "bg-zinc-800 border-orange-400/80 shadow-[0_24px_60px_rgba(0,0,0,0.85)] ring-2 ring-orange-500/30"
          : isDragging
            ? "border-dashed border-zinc-700/50 bg-zinc-900/10 opacity-25"
            : isExecuting
              ? "bg-orange-500/10 border-orange-400/70 shadow-[0_0_24px_rgba(249,115,22,0.35)] ring-2 ring-orange-400/40"
              : isExecuted
                ? "bg-emerald-500/5 border-emerald-500/30"
                : disabled
                  ? "bg-zinc-900/40 border-zinc-800/50 opacity-50"
                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
      }`}
      style={isDragOverlay ? { transform: "scale(1.04) rotate(1.5deg)" } : {}}
    >
      <div className="flex items-stretch">
        {/* Step index column */}
        <div
          className={`flex flex-col items-center justify-center gap-2 px-3 border-r shrink-0 w-11 ${
            isDragOverlay
              ? "border-orange-400/30 bg-orange-500/10"
              : isExecuting
                ? "border-orange-500/40 bg-orange-500/15"
                : isExecuted
                  ? "border-emerald-500/25 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-950/70"
          }`}
        >
          <span
            className={`text-[11px] font-black tabular-nums ${
              isDragOverlay
                ? "text-orange-300"
                : isExecuting
                  ? "text-orange-200"
                  : isExecuted
                    ? "text-emerald-300"
                    : isDragging
                      ? "text-zinc-800"
                      : "text-zinc-500"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          {!disabled && (
            <div
              {...(gripProps || {})}
              className={`transition-colors ${
                isDragOverlay
                  ? "text-orange-400 cursor-grabbing"
                  : isDragging
                    ? "text-zinc-800"
                    : "text-zinc-700 hover:text-zinc-400 cursor-grab active:cursor-grabbing"
              }`}
            >
              <GripVertical size={13} />
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="flex-1 p-2.5 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <Terminal
              size={11}
              className={
                isExecuting
                  ? "text-orange-300"
                  : isExecuted
                    ? "text-emerald-400"
                    : "text-orange-400/80"
              }
            />
            <code
              className={`text-[12.5px] font-mono font-semibold truncate ${
                isDragOverlay
                  ? "text-orange-200"
                  : isExecuting
                    ? "text-orange-100"
                    : isExecuted
                      ? "text-emerald-200"
                      : "text-orange-300"
              }`}
            >
              {step.lineLabel}
            </code>
          </div>

          {step.variables && Object.keys(step.variables).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(step.variables).map(([k, v]) => (
                <VarBadge key={k} k={k} v={v} />
              ))}
            </div>
          )}
        </div>

        {isExecuted && !isExecuting && (
          <div className="absolute top-1.5 right-2 text-emerald-400">
            <Check size={10} strokeWidth={3} />
          </div>
        )}
      </div>
    </div>
  );
}

function SnapshotCard({ id, index, step, disabled, isExecuting, isExecuted }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });
  return (
    <motion.div
      ref={setNodeRef}
      layout
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <SnapshotCardVisual
        index={index}
        step={step}
        isDragging={isDragging}
        isDragOverlay={false}
        gripProps={{ ...attributes, ...listeners, tabIndex: -1 }}
        disabled={disabled}
        isExecuting={isExecuting}
        isExecuted={isExecuted}
      />
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────
export default function CodeTraceQuestion({
  question,
  onSubmit,
  result,
  isSubmitting,
}) {
  const { codeSnippet, steps, language = "javascript" } = question;

  const [order, setOrder] = useState(() => {
    const idx = steps.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  });
  const [activeId, setActiveId] = useState(null);
  const [previewStep, setPreviewStep] = useState(-1); // -1 idle, 0..n-1 running
  const [isPreviewing, setIsPreviewing] = useState(false);
  const previewCancelRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(({ active }) => setActiveId(active.id), []);
  const handleDragCancel = useCallback(() => setActiveId(null), []);
  const handleDragEnd = useCallback(
    ({ active, over }) => {
      setActiveId(null);
      if (!over || active.id === over.id || result) return;
      setOrder((prev) => {
        const from = prev.findIndex((v) => String(v) === active.id);
        const to = prev.findIndex((v) => String(v) === over.id);
        return from === -1 || to === -1 ? prev : arrayMove(prev, from, to);
      });
    },
    [result],
  );

  const runPreview = useCallback(async () => {
    if (isPreviewing || result || isSubmitting) return;
    setIsPreviewing(true);
    previewCancelRef.current = false;
    for (let i = 0; i < order.length; i++) {
      if (previewCancelRef.current) break;
      setPreviewStep(i);
      await new Promise((r) => setTimeout(r, 520));
    }
    if (!previewCancelRef.current) {
      // Keep last step lit for a beat
      await new Promise((r) => setTimeout(r, 400));
    }
    setPreviewStep(-1);
    setIsPreviewing(false);
  }, [order, isPreviewing, result, isSubmitting]);

  const handleSubmit = () => {
    if (result || isSubmitting) return;
    previewCancelRef.current = true;
    setIsPreviewing(false);
    setPreviewStep(-1);
    onSubmit({ value: order });
  };

  const fileExt =
    language === "python"
      ? "py"
      : language === "java"
        ? "java"
        : language === "cpp"
          ? "cpp"
          : "js";

  return (
    <div className="space-y-4 w-full">
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl md:text-2xl font-extrabold text-center leading-tight text-white tracking-tight"
      >
        {question.question}
      </motion.h3>

      {/* Code snippet panel */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.07 } }}
        className="rounded-xl overflow-hidden border border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border-b border-zinc-800">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black ml-1">
            trace.{fileExt}
          </span>
          <div className="flex-1" />
          {isPreviewing && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-orange-300 bg-orange-500/10 border border-orange-500/30 rounded-full px-2 py-0.5">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                ⚙
              </motion.span>
              Tracing
            </span>
          )}
        </div>
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          showLineNumbers
          customStyle={{
            margin: 0,
            background: "#0a0a0a",
            padding: "14px",
            fontSize: "12.5px",
            lineHeight: "1.65",
          }}
          lineNumberStyle={{ color: "#3f3f46", minWidth: "2em" }}
        >
          {codeSnippet}
        </SyntaxHighlighter>
      </motion.div>

      {/* Draggable snapshot cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.13 } }}
        className="space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
            <GripVertical size={10} className="text-zinc-700" />
            Drag into execution order
          </p>
          {!result && (
            <button
              onClick={runPreview}
              disabled={isPreviewing || isSubmitting}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={10} fill="currentColor" />
              {isPreviewing ? "Tracing…" : "Preview"}
            </button>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={order.map(String)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 relative">
              {/* Vertical connector line on the left */}
              <div
                className="absolute left-[21px] top-3 bottom-3 w-px bg-gradient-to-b from-zinc-800/0 via-zinc-800/80 to-zinc-800/0 pointer-events-none"
                aria-hidden
              />
              {order.map((stepIdx, pos) => (
                <SnapshotCard
                  key={String(stepIdx)}
                  id={String(stepIdx)}
                  index={pos}
                  step={steps[stepIdx]}
                  disabled={!!result || isPreviewing}
                  isExecuting={previewStep === pos}
                  isExecuted={previewStep > pos}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay
            dropAnimation={{
              duration: 220,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}
          >
            {activeId !== null &&
              (() => {
                const pos = order.findIndex((v) => String(v) === activeId);
                return (
                  <SnapshotCardVisual
                    index={pos}
                    step={steps[order[pos]]}
                    isDragging={false}
                    isDragOverlay
                    disabled={false}
                  />
                );
              })()}
          </DragOverlay>
        </DndContext>

        {!result && (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSubmit}
            disabled={isSubmitting || isPreviewing}
            className="w-full relative overflow-hidden flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm mt-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-[0_4px_20px_rgba(249,115,22,0.35)] active:scale-[0.99]"
          >
            {!isSubmitting && !isPreviewing && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
            )}
            {isSubmitting ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ⏳
                </motion.span>
                Checking…
              </>
            ) : (
              <>
                <Send size={14} /> Submit Order
              </>
            )}
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {result && (
          <VisualResultOverlay
            result={result}
            sequenceLabel="Correct execution order"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
