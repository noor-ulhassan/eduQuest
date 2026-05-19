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
import {
  GripVertical,
  Play,
  RotateCcw,
  Check,
  X,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  ArrowUpLeft,
} from "lucide-react";
import { simulatePath } from "./robotSimulator";
import VisualResultOverlay from "./VisualResultOverlay";

// ─── Direction → rotation (deg) ──────────────────────────────
const DIR_DEG = { right: 0, down: 90, left: 180, up: 270 };

// Map command text → emoji glyph
function commandGlyph(label = "") {
  const t = label.toLowerCase();
  if (t.includes("forward")) return "↑";
  if (t.includes("backward") || (t.includes("back") && !t.includes("turn")))
    return "↓";
  if (t.includes("turn right") || t.includes("rotate right")) return "⟳";
  if (t.includes("turn left") || t.includes("rotate left")) return "⟲";
  if (t.includes("around") || t.includes("u-turn")) return "↺";
  return "•";
}

// ─── Sortable command card ───────────────────────────────────
function CommandCardVisual({
  index,
  label,
  isDragging,
  isDragOverlay,
  gripProps,
  disabled,
  isExecuting,
  isExecuted,
}) {
  return (
    <div
      className={`group relative flex items-stretch rounded-xl border select-none overflow-hidden transition-all duration-150 ${
        isDragOverlay
          ? "bg-zinc-800 border-orange-400/80 shadow-[0_24px_60px_rgba(0,0,0,0.85)] ring-2 ring-orange-500/30"
          : isDragging
            ? "border-dashed border-zinc-700/50 bg-zinc-900/10 opacity-25"
            : isExecuting
              ? "bg-orange-500/15 border-orange-400/80 shadow-[0_0_28px_rgba(249,115,22,0.4)] ring-2 ring-orange-400/50 scale-[1.02]"
              : isExecuted
                ? "bg-emerald-500/5 border-emerald-500/30"
                : disabled
                  ? "bg-zinc-900/40 border-zinc-800/40 opacity-50"
                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60"
      }`}
      style={isDragOverlay ? { transform: "scale(1.04) rotate(1.5deg)" } : {}}
    >
      {/* Index column */}
      <div
        className={`flex flex-col items-center justify-center w-10 shrink-0 border-r ${
          isDragOverlay
            ? "border-orange-400/30 bg-orange-500/10"
            : isExecuting
              ? "border-orange-500/40 bg-orange-500/20"
              : isExecuted
                ? "border-emerald-500/25 bg-emerald-500/10"
                : "border-zinc-800 bg-zinc-950/70"
        }`}
      >
        <span
          className={`text-[11px] font-black tabular-nums ${
            isDragOverlay
              ? "text-orange-200"
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
      </div>

      {/* Glyph + label */}
      <div className="flex-1 px-3 py-2.5 flex items-center gap-2.5 min-w-0">
        <span
          className={`text-base leading-none ${
            isExecuting
              ? "text-orange-300"
              : isExecuted
                ? "text-emerald-300"
                : "text-orange-400/80"
          }`}
        >
          {commandGlyph(label)}
        </span>
        <code
          className={`text-[13px] font-mono font-semibold truncate ${
            isDragOverlay
              ? "text-orange-200"
              : isExecuting
                ? "text-orange-100"
                : isExecuted
                  ? "text-emerald-200"
                  : isDragging
                    ? "text-zinc-800"
                    : "text-zinc-100"
          }`}
        >
          {label}
        </code>
      </div>

      {/* Grip */}
      {!disabled && (
        <div
          {...(gripProps || {})}
          className={`flex items-center px-2.5 border-l transition-colors ${
            isDragOverlay
              ? "border-orange-400/20 text-orange-400 cursor-grabbing"
              : isDragging
                ? "border-zinc-700/25 text-zinc-800"
                : "border-zinc-800/70 text-zinc-700 hover:text-zinc-300 hover:bg-zinc-800/40 cursor-grab active:cursor-grabbing"
          }`}
        >
          <GripVertical size={13} />
        </div>
      )}

      {isExecuted && !isExecuting && (
        <div className="absolute right-2 top-1.5 text-[10px] text-emerald-400">
          <Check size={11} />
        </div>
      )}
    </div>
  );
}

function CommandCard({ id, index, label, disabled, isExecuting, isExecuted }) {
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
      <CommandCardVisual
        index={index}
        label={label}
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

// ─── Grid visual (smooth-flying robot, path trail, polished cells) ───
function GridVisual({
  rows,
  cols,
  walls,
  goalPos,
  robotPos,
  robotDir,
  trail = [],
  isAnimating,
}) {
  const isWall = (r, c) => walls?.some((w) => w[0] === r && w[1] === c);
  const isGoal = (r, c) => goalPos[0] === r && goalPos[1] === c;

  const cellPx = cols <= 3 ? 70 : cols <= 4 ? 60 : 48;
  const gap = 6;
  const pad = 12;
  const totalW = cols * cellPx + (cols - 1) * gap;
  const totalH = rows * cellPx + (rows - 1) * gap;

  // Convert grid cell (r, c) to pixel position (top-left of cell)
  const cellLeft = (c) => pad + c * (cellPx + gap);
  const cellTop = (r) => pad + r * (cellPx + gap);

  return (
    <div
      className="relative rounded-2xl border border-zinc-800/80 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]"
      style={{
        width: totalW + pad * 2,
        height: totalH + pad * 2,
        background:
          "radial-gradient(circle at 50% 50%, rgba(249,115,22,0.04) 0%, rgba(0,0,0,0) 70%), #050505",
      }}
    >
      {/* Subtle dot grid */}
      <svg
        className="absolute inset-0 pointer-events-none opacity-25"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="vs-dots"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.7" fill="rgba(255,255,255,0.18)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#vs-dots)" />
      </svg>

      {/* Cells */}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const wall = isWall(r, c);
          const goal = isGoal(r, c);
          return (
            <div
              key={`${r}-${c}`}
              className="absolute"
              style={{
                left: cellLeft(c),
                top: cellTop(r),
                width: cellPx,
                height: cellPx,
              }}
            >
              <div
                className={`w-full h-full rounded-lg border transition-colors duration-200 ${
                  wall
                    ? "bg-zinc-800 border-zinc-700/80"
                    : goal
                      ? "bg-emerald-500/8 border-emerald-500/30"
                      : "bg-zinc-900/60 border-zinc-800/50"
                }`}
              >
                {wall && (
                  <div className="w-full h-full flex items-center justify-center">
                    {/* X pattern wall */}
                    <div className="relative w-3/5 h-3/5">
                      <div className="absolute inset-x-0 top-1/2 h-[2px] bg-zinc-600 rotate-45 origin-center" />
                      <div className="absolute inset-x-0 top-1/2 h-[2px] bg-zinc-600 -rotate-45 origin-center" />
                    </div>
                  </div>
                )}
                {goal && (
                  <motion.div
                    className="w-full h-full flex items-center justify-center relative"
                    animate={{
                      filter: [
                        "drop-shadow(0 0 0px rgba(16,185,129,0.0))",
                        "drop-shadow(0 0 10px rgba(16,185,129,0.7))",
                        "drop-shadow(0 0 0px rgba(16,185,129,0.0))",
                      ],
                    }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    <span className="text-2xl leading-none select-none">
                      💎
                    </span>
                    <motion.div
                      className="absolute inset-1 rounded-md border border-emerald-400/30 pointer-events-none"
                      animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          );
        }),
      )}

      {/* Path trail — past cells fade in then fade out behind the robot */}
      <AnimatePresence>
        {trail.map((p, i) => (
          <motion.div
            key={`trail-${i}-${p[0]}-${p[1]}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.4 }}
            className="absolute pointer-events-none"
            style={{
              left: cellLeft(p[1]) + cellPx * 0.3,
              top: cellTop(p[0]) + cellPx * 0.3,
              width: cellPx * 0.4,
              height: cellPx * 0.4,
            }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(249,115,22,0.55) 0%, rgba(249,115,22,0) 70%)",
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Robot — absolutely positioned, smooth spring between coords */}
      <motion.div
        className="absolute pointer-events-none flex items-center justify-center"
        animate={{
          left: cellLeft(robotPos[1]),
          top: cellTop(robotPos[0]),
        }}
        transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.6 }}
        style={{ width: cellPx, height: cellPx }}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Glow */}
          <motion.div
            className="absolute inset-2 rounded-xl"
            animate={{
              boxShadow: isAnimating
                ? [
                    "0 0 12px rgba(249,115,22,0.5)",
                    "0 0 28px rgba(249,115,22,0.7)",
                    "0 0 12px rgba(249,115,22,0.5)",
                  ]
                : "0 0 16px rgba(249,115,22,0.45)",
            }}
            transition={{ duration: 1, repeat: isAnimating ? Infinity : 0 }}
          />
          {/* Direction triangle */}
          <motion.div
            animate={{ rotate: DIR_DEG[robotDir] || 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="absolute"
              style={{
                top: 4,
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderBottom: "9px solid rgba(249,115,22,0.95)",
                filter: "drop-shadow(0 0 6px rgba(249,115,22,0.7))",
                transform: "translateX(-50%) rotate(-90deg)",
                left: "50%",
              }}
            />
          </motion.div>
          {/* Robot body */}
          <div className="relative z-10 w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 border border-orange-300/40 flex items-center justify-center shadow-[0_4px_16px_rgba(249,115,22,0.5)]">
            <span className="text-lg leading-none select-none">🤖</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────
export default function VisualSequenceQuestion({
  question,
  onSubmit,
  result,
  isSubmitting,
}) {
  const { gridConfig, items, context } = question;
  const { rows, cols, startPos, startDir, goalPos, walls = [] } = gridConfig;

  const [order, setOrder] = useState(() => {
    const idx = items.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  });
  const [robotPos, setRobotPos] = useState([...startPos]);
  const [robotDir, setRobotDir] = useState(startDir);
  const [isAnimating, setIsAnimating] = useState(false);
  const [localResult, setLocalResult] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [trail, setTrail] = useState([]);
  const [executingStep, setExecutingStep] = useState(-1);
  const hasSubmitted = useRef(false);

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
      if (!over || active.id === over.id || result || isAnimating) return;
      setOrder((prev) => {
        const from = prev.findIndex((v) => String(v) === active.id);
        const to = prev.findIndex((v) => String(v) === over.id);
        return from === -1 || to === -1 ? prev : arrayMove(prev, from, to);
      });
    },
    [result, isAnimating],
  );

  const handleRun = useCallback(async () => {
    if (isAnimating || result || hasSubmitted.current) return;
    hasSubmitted.current = true;
    setIsAnimating(true);
    setLocalResult(null);
    setTrail([]);
    setExecutingStep(-1);

    const commands = order.map((idx) => items[idx]);
    const path = simulatePath(startPos, startDir, commands);

    onSubmit({ value: order });

    setRobotPos([...startPos]);
    setRobotDir(startDir);

    // Step through animation
    for (let i = 1; i < path.length; i++) {
      await new Promise((r) => setTimeout(r, 460));
      setExecutingStep(i - 1);
      setRobotPos([...path[i].pos]);
      setRobotDir(path[i].dir);
      // Add previous position to trail (so trail shows past cells)
      setTrail((prev) => [...prev, [...path[i - 1].pos]]);
    }

    const last = path[path.length - 1];
    const reached =
      last.pos[0] === goalPos[0] && last.pos[1] === goalPos[1];
    setLocalResult(reached ? "hit" : "miss");
    setIsAnimating(false);
    setExecutingStep(-1);
  }, [isAnimating, result, order, items, startPos, startDir, goalPos, onSubmit]);

  const handleReset = useCallback(() => {
    if (result || isAnimating || hasSubmitted.current) return;
    setOrder(items.map((_, i) => i));
    setRobotPos([...startPos]);
    setRobotDir(startDir);
    setLocalResult(null);
    setTrail([]);
    setExecutingStep(-1);
  }, [result, isAnimating, items, startPos, startDir]);

  return (
    <div className="space-y-5 w-full">
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl md:text-2xl font-extrabold text-center leading-tight text-white tracking-tight"
      >
        {question.question}
      </motion.h3>

      {context && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="text-center text-xs text-zinc-500 italic max-w-xl mx-auto"
        >
          {context}
        </motion.p>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* ── Grid panel ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.05 } }}
          className="flex flex-col items-center gap-3 shrink-0"
        >
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
            <span className="text-zinc-600">Arena</span>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-orange-400 to-red-500" />
              Bot
            </span>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="text-xs leading-none">💎</span>
              Goal
            </span>
          </div>

          <GridVisual
            rows={rows}
            cols={cols}
            walls={walls}
            goalPos={goalPos}
            robotPos={robotPos}
            robotDir={robotDir}
            trail={trail}
            isAnimating={isAnimating}
          />

          {/* Status chip */}
          <div className="h-7 flex items-center justify-center min-w-[160px]">
            <AnimatePresence mode="wait">
              {isAnimating ? (
                <motion.div
                  key="run"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 bg-orange-500/15 text-orange-300 border border-orange-500/30 font-mono"
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    ⚙
                  </motion.span>
                  Step {Math.max(1, executingStep + 1)} / {order.length}
                </motion.div>
              ) : localResult ? (
                <motion.div
                  key={localResult}
                  initial={{ opacity: 0, y: 4, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 360, damping: 22 }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border ${
                    localResult === "hit"
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-red-500/15 text-red-300 border-red-500/30"
                  }`}
                >
                  {localResult === "hit" ? (
                    <>
                      <Check size={11} strokeWidth={3} /> Gem collected!
                    </>
                  ) : (
                    <>
                      <X size={11} strokeWidth={3} /> Missed the gem
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold"
                >
                  Awaiting program
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Commands panel ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
          className="flex-1 flex flex-col gap-3 min-w-[240px] max-w-md w-full"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              Program Sequence
            </p>
            <span className="text-[10px] font-mono text-zinc-700">
              {order.length} steps
            </span>
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
              <div className="space-y-2">
                {order.map((itemIdx, pos) => (
                  <CommandCard
                    key={String(itemIdx)}
                    id={String(itemIdx)}
                    index={pos}
                    label={items[itemIdx]}
                    disabled={!!result || isAnimating}
                    isExecuting={executingStep === pos}
                    isExecuted={
                      executingStep > pos ||
                      (executingStep === -1 && !!localResult && pos < order.length)
                    }
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
                    <CommandCardVisual
                      index={pos}
                      label={items[order[pos]]}
                      isDragging={false}
                      isDragOverlay
                      disabled={false}
                    />
                  );
                })()}
            </DragOverlay>
          </DndContext>

          <div className="flex gap-2 mt-1">
            <button
              onClick={handleRun}
              disabled={!!result || isAnimating || isSubmitting}
              className="flex-1 relative overflow-hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-[0_4px_20px_rgba(249,115,22,0.35)] active:scale-[0.98]"
            >
              {!isAnimating && !result && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
              )}
              {isAnimating ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    ⚙
                  </motion.span>
                  Running…
                </>
              ) : (
                <>
                  <Play size={15} fill="white" />
                  Run Program
                </>
              )}
            </button>

            {!result && !hasSubmitted.current && (
              <button
                onClick={handleReset}
                disabled={isAnimating}
                title="Reset positions"
                className="px-3 py-3 rounded-xl border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 transition-all disabled:opacity-40 active:scale-[0.96]"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {result && (
          <VisualResultOverlay result={result} sequenceLabel="Correct sequence" />
        )}
      </AnimatePresence>
    </div>
  );
}
