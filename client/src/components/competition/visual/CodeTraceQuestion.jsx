import React, { useState, useCallback } from "react";
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
import { GripVertical, Send, Terminal } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import VisualResultOverlay from "./VisualResultOverlay";

// ─── Sortable snapshot card ────────────────────────────────────
function SnapshotCardVisual({ index, step, isDragging, isDragOverlay, gripProps, disabled }) {
  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden select-none transition-colors duration-100 ${
        isDragOverlay
          ? "bg-zinc-800 border-orange-400/80 shadow-[0_28px_60px_rgba(0,0,0,0.85),0_0_0_1px_rgba(249,115,22,0.2)]"
          : isDragging
          ? "border-dashed border-zinc-700/50 bg-zinc-900/10 opacity-20"
          : disabled
          ? "bg-zinc-900/50 border-zinc-800/50 opacity-50"
          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:shadow-[0_2px_16px_rgba(0,0,0,0.3)]"
      }`}
      style={isDragOverlay ? { transform: "scale(1.04) rotate(1.5deg)" } : {}}
    >
      <div className="flex items-stretch">
        {/* Step number + grip column */}
        <div
          className={`flex flex-col items-center justify-center gap-2 px-3 border-r-2 shrink-0 min-w-[44px] ${
            isDragOverlay
              ? "border-orange-400/25 bg-orange-500/10"
              : isDragging
              ? "border-zinc-700/25"
              : "border-zinc-800 bg-zinc-950/70"
          }`}
        >
          <span
            className={`text-xs font-black tabular-nums ${
              isDragOverlay ? "text-orange-300" : isDragging ? "text-zinc-800" : "text-zinc-500"
            }`}
          >
            {index + 1}
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
        <div className="flex-1 p-3 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Terminal size={11} className="text-orange-400 shrink-0" />
            <code
              className={`text-[13px] font-mono font-semibold truncate ${
                isDragOverlay ? "text-orange-200" : "text-orange-300"
              }`}
            >
              {step.lineLabel}
            </code>
          </div>

          {step.variables && Object.keys(step.variables).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(step.variables).map(([k, v]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1 text-[11px] font-mono bg-zinc-800 border border-zinc-700/80 rounded-md px-2 py-0.5"
                >
                  <span className="text-blue-400">{k}</span>
                  <span className="text-zinc-600">=</span>
                  <span className="text-emerald-400">{JSON.stringify(v)}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SnapshotCard({ id, index, step, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  return (
    <motion.div ref={setNodeRef} layout style={{ transform: CSS.Transform.toString(transform), transition }}>
      <SnapshotCardVisual
        index={index}
        step={step}
        isDragging={isDragging}
        isDragOverlay={false}
        gripProps={{ ...attributes, ...listeners, tabIndex: -1 }}
        disabled={disabled}
      />
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart  = useCallback(({ active }) => setActiveId(active.id), []);
  const handleDragCancel = useCallback(() => setActiveId(null), []);
  const handleDragEnd = useCallback(
    ({ active, over }) => {
      setActiveId(null);
      if (!over || active.id === over.id || result) return;
      setOrder((prev) => {
        const from = prev.findIndex((v) => String(v) === active.id);
        const to   = prev.findIndex((v) => String(v) === over.id);
        return from === -1 || to === -1 ? prev : arrayMove(prev, from, to);
      });
    },
    [result],
  );

  const handleSubmit = () => {
    if (result || isSubmitting) return;
    onSubmit({ value: order });
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

      {/* Code snippet with syntax highlighting */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.07 } }}
        className="rounded-2xl overflow-hidden border border-zinc-800 shadow-lg"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold ml-1">
            code.{language === "python" ? "py" : language === "java" ? "java" : language === "cpp" ? "cpp" : "js"}
          </span>
        </div>
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          showLineNumbers
          customStyle={{
            margin: 0,
            background: "#0a0a0a",
            padding: "16px",
            fontSize: "13px",
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
        className="space-y-3"
      >
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          Drag into execution order ↕
        </p>

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
            <div className="space-y-2.5">
              {order.map((stepIdx, pos) => (
                <SnapshotCard
                  key={String(stepIdx)}
                  id={String(stepIdx)}
                  index={pos}
                  step={steps[stepIdx]}
                  disabled={!!result}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
            {activeId !== null && (() => {
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
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm mt-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-[0_2px_20px_rgba(249,115,22,0.25)] active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin inline-block">⏳</span> Checking…
              </>
            ) : (
              <>
                <Send size={15} /> Submit Order
              </>
            )}
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {result && <VisualResultOverlay result={result} sequenceLabel="Correct execution order" />}
      </AnimatePresence>
    </div>
  );
}
