import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  GripHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Token colour map ────────────────────────────────────────────────────────
const COLOR = {
  sky: {
    chip: "bg-sky-500/20     text-sky-300     border-sky-500/50",
    filled: "bg-sky-500/30     text-sky-200     border-sky-400/70",
  },
  emerald: {
    chip: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
    filled: "bg-emerald-500/30 text-emerald-200 border-emerald-400/70",
  },
  amber: {
    chip: "bg-amber-500/20   text-amber-300   border-amber-500/50",
    filled: "bg-amber-500/30   text-amber-200   border-amber-400/70",
  },
  purple: {
    chip: "bg-purple-500/20  text-purple-300  border-purple-500/50",
    filled: "bg-purple-500/30  text-purple-200  border-purple-400/70",
  },
  rose: {
    chip: "bg-rose-500/20    text-rose-300    border-rose-500/50",
    filled: "bg-rose-500/30    text-rose-200    border-rose-400/70",
  },
  zinc: {
    chip: "bg-zinc-600/50    text-zinc-300    border-zinc-500/50",
    filled: "bg-zinc-600/70    text-zinc-200    border-zinc-400/70",
  },
};
const tokenCls = (color, filled = false) =>
  (COLOR[color] || COLOR.zinc)[filled ? "filled" : "chip"];

// Shuffle helper (guard against undefined/null)
const shuffle = (arr) => (arr ? [...arr].sort(() => Math.random() - 0.5) : []);

// ─── Main component ──────────────────────────────────────────────────────────
const InteractiveProblem = ({ problem, onSolve, isAlreadySolved }) => {
  const [blanksState, setBlanksState] = useState({}); // { blankId → token }
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [checkResult, setCheckResult] = useState(
    isAlreadySolved ? { correct: true, message: "Already solved! 🎉" } : null,
  );
  const [shake, setShake] = useState(false);
  const [tokens] = useState(() => shuffle(problem.tokens));

  // Which token IDs are currently placed in blanks
  const placedIds = new Set(Object.values(blanksState).map((t) => t?.id));
  const bankTokens = tokens.filter((t) => !placedIds.has(t.id));
  const blanksInTemplate = problem.codeTemplate.filter(
    (s) => s.type === "blank",
  );
  const allFilled = blanksInTemplate.every((s) => blanksState[s.id] != null);

  // ── token selection (click) ──────────────────────────────────────────────
  const handleTokenClick = useCallback((token) => {
    setSelectedTokenId((prev) => (prev === token.id ? null : token.id));
    setCheckResult(null);
  }, []);

  // ── blank click ──────────────────────────────────────────────────────────
  const handleBlankClick = useCallback(
    (blankId) => {
      if (selectedTokenId) {
        const token = tokens.find((t) => t.id === selectedTokenId);
        setBlanksState((prev) => ({ ...prev, [blankId]: token }));
        setSelectedTokenId(null);
        setCheckResult(null);
      } else if (blanksState[blankId]) {
        setBlanksState((prev) => {
          const n = { ...prev };
          delete n[blankId];
          return n;
        });
        setCheckResult(null);
      }
    },
    [selectedTokenId, blanksState, tokens],
  );

  // ── drag support ─────────────────────────────────────────────────────────
  const dragTokenId = useRef(null);
  const handleDragStart = (token) => {
    dragTokenId.current = token.id;
    setSelectedTokenId(null);
  };
  const handleDrop = useCallback(
    (blankId) => {
      const token = tokens.find((t) => t.id === dragTokenId.current);
      if (!token) return;
      setBlanksState((prev) => ({ ...prev, [blankId]: token }));
      setCheckResult(null);
      dragTokenId.current = null;
    },
    [tokens],
  );

  // ── reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setBlanksState({});
    setSelectedTokenId(null);
    setCheckResult(null);
  };

  // ── check answer ─────────────────────────────────────────────────────────
  const handleCheck = useCallback(() => {
    if (!allFilled) {
      setCheckResult({
        correct: false,
        message: "Fill in all the blanks first!",
      });
      return;
    }
    const correct = Object.entries(problem.answers).every(
      ([blankId, tid]) => blanksState[blankId]?.id === tid,
    );
    setCheckResult({
      correct,
      message: correct ? "Correct! 🎉" : "Not quite — try again!",
    });
    if (correct) {
      onSolve?.();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }, [allFilled, blanksState, problem.answers, onSolve]);

  // ── render code template ──────────────────────────────────────────────────
  const renderTemplate = () =>
    problem.codeTemplate.map((seg, i) => {
      if (seg.type === "code") {
        return (
          <span key={i} className="text-zinc-300 whitespace-pre-wrap">
            {seg.content}
          </span>
        );
      }
      const filled = blanksState[seg.id];
      const canReceive = !!selectedTokenId && !filled;
      return (
        <span
          key={`blank-${seg.id}`}
          onClick={() => handleBlankClick(seg.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(seg.id);
          }}
          style={{ minWidth: seg.width || "80px", display: "inline-flex" }}
          className={cn(
            "inline-flex items-center justify-center px-2 py-0.5 mx-1 rounded-md cursor-pointer transition-all align-middle text-sm font-mono border",
            filled
              ? cn(tokenCls(filled.color, true), "font-semibold")
              : canReceive
                ? "border-dashed border-2 border-orange-400/70 bg-orange-500/10 text-orange-300 animate-pulse"
                : "border-dashed border-2 border-zinc-600 bg-zinc-800/50 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-800",
          )}
        >
          {filled ? (
            filled.label
          ) : (
            <span className="text-[10px] uppercase tracking-widest opacity-50">
              {seg.hint || "___"}
            </span>
          )}
        </span>
      );
    });

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 flex flex-col [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-zinc-700">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="h-4 w-4 text-orange-400 shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-orange-400">
            Interactive
          </span>
          <span
            className={cn(
              "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ml-auto",
              problem.difficulty === "Easy"
                ? "text-emerald-400 bg-emerald-500/10"
                : problem.difficulty === "Medium"
                  ? "text-amber-400 bg-amber-500/10"
                  : "text-red-400 bg-red-500/10",
            )}
          >
            {problem.difficulty}
          </span>
          <span className="text-[10px] text-orange-300 font-mono">
            +{problem.xp} XP
          </span>
        </div>
        <h2 className="text-[15px] font-bold text-zinc-100">{problem.title}</h2>
        <p className="text-[13px] text-zinc-400 leading-relaxed mt-1">
          {problem.description}
        </p>
      </div>

      {/* ── Code block with blanks ─────────────────────────────────────────── */}
      <div className="px-5 pt-4">
        <div className="text-[11px] text-zinc-600 uppercase tracking-widest mb-2 font-semibold">
          Code
        </div>
        <motion.div
          animate={shake ? { x: [-6, 6, -6, 6, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="relative bg-[#161616] border border-zinc-800 rounded-xl p-4 overflow-x-auto"
        >
          {/* Fake traffic lights */}
          <div className="flex gap-1.5 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <pre
            className="text-[13.5px] font-mono leading-7 text-zinc-300"
            style={{
              fontFamily: "'JetBrains Mono','Fira Code',Consolas,monospace",
              whiteSpace: "pre-wrap",
            }}
          >
            {renderTemplate()}
          </pre>
        </motion.div>
      </div>

      {/* ── Token bank ────────────────────────────────────────────────────── */}
      <div className="px-5 pt-5">
        <div className="text-[11px] text-zinc-600 uppercase tracking-widest mb-3 font-semibold flex items-center gap-2">
          <GripHorizontal className="h-3.5 w-3.5" />
          Drag or click to place
        </div>
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          <AnimatePresence>
            {bankTokens.map((token) => (
              <motion.button
                key={token.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.06, y: -1 }}
                whileTap={{ scale: 0.94 }}
                draggable
                onDragStart={() => handleDragStart(token)}
                onClick={() => handleTokenClick(token)}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-mono text-[13px] font-semibold border cursor-grab active:cursor-grabbing transition-all select-none",
                  tokenCls(token.color),
                  selectedTokenId === token.id &&
                    "ring-2 ring-orange-400 ring-offset-2 ring-offset-zinc-950 scale-105",
                )}
              >
                {token.label}
              </motion.button>
            ))}
          </AnimatePresence>
          {bankTokens.length === 0 && (
            <span className="text-[12px] text-zinc-600 italic">
              All tokens placed
            </span>
          )}
        </div>
      </div>

      {/* ── Result feedback ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {checkResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "mx-5 mt-4 flex items-center gap-3 rounded-xl px-4 py-3 border text-[13px] font-medium",
              checkResult.correct
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-300",
            )}
          >
            {checkResult.correct ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            {checkResult.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Actions ────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-6 flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCheck}
          disabled={isAlreadySolved}
          className={cn(
            "flex-1 py-3 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2",
            checkResult?.correct || isAlreadySolved
              ? "bg-emerald-600/80 text-white cursor-default"
              : allFilled
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/20"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed",
          )}
        >
          {checkResult?.correct || isAlreadySolved ? (
            <>
              <CheckCircle className="h-4 w-4" /> Solved!
            </>
          ) : (
            "Check Answer →"
          )}
        </motion.button>
        <button
          onClick={handleReset}
          className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default InteractiveProblem;
