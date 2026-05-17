import React, { useState, useCallback, useRef } from "react";
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
  ChevronRight,
} from "lucide-react";
import { applyCommand, simulatePath } from "./robotSimulator";
import VisualResultOverlay from "./VisualResultOverlay";

// ─── Sortable command card ─────────────────────────────────────
function CommandCardVisual({ index, label, isDragging, isDragOverlay, gripProps, disabled }) {
  return (
    <div
      className={`flex items-stretch rounded-2xl border-2 select-none overflow-hidden transition-colors duration-100 ${
        isDragOverlay
          ? "bg-zinc-800 border-orange-400/80 shadow-[0_28px_60px_rgba(0,0,0,0.85),0_0_0_1px_rgba(249,115,22,0.2)]"
          : isDragging
          ? "border-dashed border-zinc-700/50 bg-zinc-900/10 opacity-20"
          : disabled
          ? "bg-zinc-900/40 border-zinc-800/40 opacity-50"
          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 hover:shadow-[0_2px_16px_rgba(0,0,0,0.3)]"
      }`}
      style={isDragOverlay ? { transform: "scale(1.04) rotate(1.5deg)" } : {}}
    >
      {/* Number column */}
      <div
        className={`flex items-center justify-center w-12 shrink-0 border-r-2 ${
          isDragOverlay
            ? "border-orange-400/25 bg-orange-500/10"
            : isDragging
            ? "border-zinc-700/25"
            : "border-zinc-800 bg-zinc-950/60"
        }`}
      >
        <span
          className={`text-xs font-black tabular-nums ${
            isDragOverlay ? "text-orange-300" : isDragging ? "text-zinc-800" : "text-zinc-500"
          }`}
        >
          {index + 1}
        </span>
      </div>

      {/* Command label */}
      <div className="flex-1 px-4 py-3.5">
        <code
          className={`text-sm font-mono font-semibold ${
            isDragOverlay ? "text-orange-200" : isDragging ? "text-zinc-800" : "text-orange-300"
          }`}
        >
          {label}
        </code>
      </div>

      {/* Grip */}
      {!disabled && (
        <div
          {...(gripProps || {})}
          className={`flex items-center px-3 border-l-2 transition-colors ${
            isDragOverlay
              ? "border-orange-400/20 text-orange-400 cursor-grabbing"
              : isDragging
              ? "border-zinc-700/25 text-zinc-800"
              : "border-zinc-800/70 text-zinc-700 hover:text-zinc-300 hover:bg-zinc-700/25 cursor-grab active:cursor-grabbing"
          }`}
        >
          <GripVertical size={14} />
        </div>
      )}
    </div>
  );
}

function CommandCard({ id, index, label, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  return (
    <motion.div ref={setNodeRef} layout style={{ transform: CSS.Transform.toString(transform), transition }}>
      <CommandCardVisual
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

// ─── Grid visual ───────────────────────────────────────────────
const DIR_LABEL = { right: "→", left: "←", up: "↑", down: "↓" };

function GridVisual({ rows, cols, walls, goalPos, robotPos, robotDir }) {
  const isWall  = (r, c) => walls?.some((w) => w[0] === r && w[1] === c);
  const isGoal  = (r, c) => goalPos[0] === r && goalPos[1] === c;
  const isRobot = (r, c) => robotPos[0] === r && robotPos[1] === c;

  const cellPx = cols <= 3 ? 64 : cols <= 4 ? 54 : 44;

  return (
    <div
      className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-inner"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${cellPx}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellPx}px)`,
        gap: "5px",
      }}
    >
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const wall  = isWall(r, c);
          const goal  = isGoal(r, c);
          const robot = isRobot(r, c);

          return (
            <div
              key={`${r}-${c}`}
              style={{ width: cellPx, height: cellPx }}
              className={`rounded-lg flex items-center justify-center relative border transition-all duration-300 ${
                wall
                  ? "bg-zinc-800 border-zinc-700"
                  : robot
                  ? "bg-orange-500/20 border-orange-500/40 shadow-[0_0_14px_rgba(249,115,22,0.25)]"
                  : goal
                  ? "bg-emerald-500/10 border-emerald-500/25"
                  : "bg-zinc-900 border-zinc-800/60"
              }`}
            >
              {robot && (
                <motion.div
                  key="robot"
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                  className="flex flex-col items-center leading-none"
                >
                  <span className="text-xl">🤖</span>
                  <span className="text-[9px] text-orange-400 font-bold leading-none mt-0.5">
                    {DIR_LABEL[robotDir]}
                  </span>
                </motion.div>
              )}
              {goal && !robot && (
                <span className="text-xl leading-none select-none">💎</span>
              )}
              {wall && (
                <div className="w-3/5 h-3/5 rounded bg-zinc-700/70" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────
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
  const hasSubmitted = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback(({ active }) => setActiveId(active.id), []);
  const handleDragCancel = useCallback(() => setActiveId(null), []);
  const handleDragEnd = useCallback(
    ({ active, over }) => {
      setActiveId(null);
      if (!over || active.id === over.id || result || isAnimating) return;
      setOrder((prev) => {
        const from = prev.findIndex((v) => String(v) === active.id);
        const to   = prev.findIndex((v) => String(v) === over.id);
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

    const commands = order.map((idx) => items[idx]);
    const path     = simulatePath(startPos, startDir, commands);

    onSubmit({ value: order });

    setRobotPos([...startPos]);
    setRobotDir(startDir);

    for (let i = 1; i < path.length; i++) {
      await new Promise((r) => setTimeout(r, 460));
      setRobotPos([...path[i].pos]);
      setRobotDir(path[i].dir);
    }

    const last    = path[path.length - 1];
    const reached = last.pos[0] === goalPos[0] && last.pos[1] === goalPos[1];
    setLocalResult(reached ? "hit" : "miss");
    setIsAnimating(false);
  }, [isAnimating, result, order, items, startPos, startDir, goalPos, onSubmit]);

  const handleReset = useCallback(() => {
    if (result || isAnimating || hasSubmitted.current) return;
    setOrder(items.map((_, i) => i));
    setRobotPos([...startPos]);
    setRobotDir(startDir);
    setLocalResult(null);
  }, [result, isAnimating, items, startPos, startDir]);

  return (
    <div className="space-y-6 w-full">
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-extrabold text-center leading-tight text-white"
      >
        {question.question}
      </motion.h3>

      {context && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="text-center text-sm text-zinc-500 italic"
        >
          {context}
        </motion.p>
      )}

      <div className="flex flex-col sm:flex-row gap-8 items-start justify-center">
        {/* Grid panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.05 } }}
          className="flex flex-col items-center gap-3 shrink-0"
        >
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            Grid
          </p>

          <GridVisual
            rows={rows}
            cols={cols}
            walls={walls}
            goalPos={goalPos}
            robotPos={robotPos}
            robotDir={robotDir}
          />

          <div className="flex gap-4 text-[11px] text-zinc-600">
            <span>🤖 Robot</span>
            <span>💎 Goal</span>
          </div>

          <AnimatePresence>
            {!isAnimating && localResult && !result && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                  localResult === "hit"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                }`}
              >
                {localResult === "hit" ? (
                  <><Check size={11} /> Gem collected!</>
                ) : (
                  <><X size={11} /> Missed the gem</>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Commands panel */}
        <motion.div
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
          className="flex-1 flex flex-col gap-3 min-w-[200px]"
        >
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            Program Sequence
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
                {order.map((itemIdx, pos) => (
                  <CommandCard
                    key={String(itemIdx)}
                    id={String(itemIdx)}
                    index={pos}
                    label={items[itemIdx]}
                    disabled={!!result || isAnimating}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
              {activeId !== null && (() => {
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-[0_2px_20px_rgba(249,115,22,0.25)] active:scale-[0.98]"
            >
              {isAnimating ? (
                <>
                  <span className="animate-spin inline-block">⚙️</span>
                  Running…
                </>
              ) : (
                <>
                  <Play size={15} fill="white" />
                  Run & Submit
                </>
              )}
            </button>

            {!result && !hasSubmitted.current && (
              <button
                onClick={handleReset}
                disabled={isAnimating}
                title="Reset order"
                className="px-3 py-3 rounded-xl border border-zinc-800 text-zinc-600 hover:text-zinc-300 hover:border-zinc-700 transition-all disabled:opacity-40 active:scale-[0.96]"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {result && <VisualResultOverlay result={result} sequenceLabel="Correct sequence" />}
      </AnimatePresence>
    </div>
  );
}
