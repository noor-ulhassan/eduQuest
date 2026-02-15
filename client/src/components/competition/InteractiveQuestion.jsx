import React, { useState, useEffect, useRef } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  GripVertical,
  ArrowRight,
  Code,
  Terminal,
  Type,
  ListOrdered,
  Shuffle,
  Zap,
  Sparkles,
  Send,
  Award,
  Lightbulb,
  Link2,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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

const PAIR_COLORS = [
  {
    bg: "bg-blue-500/15",
    border: "border-blue-500/50",
    text: "text-blue-400",
    dot: "bg-blue-500",
  },
  {
    bg: "bg-purple-500/15",
    border: "border-purple-500/50",
    text: "text-purple-400",
    dot: "bg-purple-500",
  },
  {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/50",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
  },
  {
    bg: "bg-amber-500/15",
    border: "border-amber-500/50",
    text: "text-amber-400",
    dot: "bg-amber-500",
  },
  {
    bg: "bg-pink-500/15",
    border: "border-pink-500/50",
    text: "text-pink-400",
    dot: "bg-pink-500",
  },
  {
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/50",
    text: "text-cyan-400",
    dot: "bg-cyan-500",
  },
  {
    bg: "bg-rose-500/15",
    border: "border-rose-500/50",
    text: "text-rose-400",
    dot: "bg-rose-500",
  },
  {
    bg: "bg-indigo-500/15",
    border: "border-indigo-500/50",
    text: "text-indigo-400",
    dot: "bg-indigo-500",
  },
];

// ─── UTILS ───────────────────────────────────────────────────
const QuestionHeader = ({ icon: Icon, title, instruction, difficulty }) => (
  <motion.div variants={itemVariants} className="flex flex-col gap-2 mb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center border border-orange-500/20">
          <Icon size={18} className="text-orange-400" />
        </div>
        <span className="font-bold text-sm uppercase tracking-wider text-orange-400">
          {title}
        </span>
      </div>
      {difficulty && (
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            difficulty === "hard"
              ? "text-red-400 bg-red-500/10 border-red-500/20"
              : difficulty === "medium"
                ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          }`}
        >
          {difficulty}
        </span>
      )}
    </div>
    <p className="text-zinc-500 text-sm">{instruction}</p>
  </motion.div>
);

const Feedback = ({ result, correctAnswerData }) => {
  if (!result) return null;
  const isCorrect = result.isCorrect;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`mt-6 p-5 rounded-xl border backdrop-blur-sm ${
        isCorrect
          ? "bg-green-500/5 border-green-500/20"
          : "bg-red-500/5 border-red-500/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 p-1.5 rounded-full shrink-0 ${
            isCorrect
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isCorrect ? <Check size={14} /> : <X size={14} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <p
              className={`font-bold text-lg ${
                isCorrect ? "text-green-400" : "text-red-400"
              }`}
            >
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>
            {result.pointsEarned > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="flex items-center gap-1 text-sm font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-0.5 rounded-full border border-yellow-500/20"
              >
                <Zap size={12} className="fill-yellow-400" />+
                {result.pointsEarned} XP
              </motion.span>
            )}
          </div>
          {result.explanation && (
            <p
              className={`text-sm mt-1.5 leading-relaxed ${
                isCorrect ? "text-green-400/80" : "text-red-400/80"
              }`}
            >
              {result.explanation}
            </p>
          )}
          {!isCorrect && correctAnswerData && (
            <div className="mt-3 text-sm bg-black/30 p-3 rounded-lg border border-white/5">
              <span className="font-semibold text-zinc-400 text-xs uppercase tracking-wider block mb-2">
                Correct Answer
              </span>
              <div className="font-mono text-xs text-emerald-400/90 space-y-1">
                {Array.isArray(correctAnswerData)
                  ? correctAnswerData.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 py-0.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold shrink-0">
                          {i + 1}
                        </span>
                        {typeof item === "object"
                          ? JSON.stringify(item)
                          : String(item)}
                      </div>
                    ))
                  : String(correctAnswerData)}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── COMPONENT: Type Answer ────────────────────────────────
const TypeAnswerQuestion = ({ question, onSubmit, result, isSubmitting }) => {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit({ type: "type_answer", value });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-xl"
    >
      <QuestionHeader
        icon={Type}
        title="Type the Answer"
        instruction="Type your answer in the box below."
        difficulty={question.difficulty}
      />
      <motion.h3
        variants={itemVariants}
        className="text-xl font-semibold mb-6 leading-relaxed"
      >
        {question.question}
      </motion.h3>

      {question.hint && (
        <motion.div
          variants={itemVariants}
          className="mb-5 flex items-start gap-2 text-sm text-amber-400/80 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10"
        >
          <Lightbulb size={16} className="shrink-0 mt-0.5" />
          <span>{question.hint}</span>
        </motion.div>
      )}

      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="relative">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => !result && setValue(e.target.value)}
            placeholder="Type your answer here..."
            className="bg-zinc-900/80 border-zinc-800 h-14 text-lg pr-20 focus:border-orange-500/50 transition-colors"
            disabled={!!result || isSubmitting}
          />
          {!result && value.length > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600 font-mono tabular-nums">
              {value.length} chars
            </span>
          )}
        </div>
        <Button
          type="submit"
          disabled={!value.trim() || !!result || isSubmitting}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold h-12 shadow-lg shadow-orange-500/10 transition-all"
        >
          <Send size={16} className="mr-2" />
          Submit Answer
        </Button>
      </motion.form>
      <Feedback result={result} correctAnswerData={result?.correctAnswer} />
    </motion.div>
  );
};

// ─── COMPONENT: Drag Order ────────────────────────────────
const DragOrderQuestion = ({ question, onSubmit, result, isSubmitting }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (question.items) {
      setItems(
        question.items.map((text, index) => ({
          id: `item-${index}`,
          text,
          originalIndex: index,
        })),
      );
    }
  }, [question.items]);

  const handleSubmit = () => {
    const submittedIndices = items.map((item) => item.originalIndex);
    onSubmit({ type: "drag_order", value: submittedIndices });
  };

  const correctOrderText =
    result?.correctAnswer && Array.isArray(result.correctAnswer)
      ? result.correctAnswer.map((idx) => question.items[idx])
      : null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-xl"
    >
      <QuestionHeader
        icon={ListOrdered}
        title="Arrange in Order"
        instruction="Drag the items into the correct sequence."
        difficulty={question.difficulty}
      />
      <motion.h3
        variants={itemVariants}
        className="text-xl font-semibold mb-6 leading-relaxed"
      >
        {question.question}
      </motion.h3>

      <motion.div variants={itemVariants}>
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={!result ? setItems : () => {}}
          className="space-y-2.5 mb-6"
        >
          {items.map((item, idx) => (
            <Reorder.Item
              key={item.id}
              value={item}
              disabled={!!result}
              whileDrag={{
                scale: 1.03,
                boxShadow: "0 8px 30px rgba(249, 115, 22, 0.15)",
                zIndex: 50,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Card
                className={`p-4 flex items-center gap-4 border transition-all group ${
                  result
                    ? "cursor-default border-zinc-800 bg-zinc-900/60"
                    : "cursor-grab active:cursor-grabbing border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/80"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-xs font-bold text-zinc-500 shrink-0 group-hover:bg-orange-500/10 group-hover:text-orange-400 transition-colors">
                  {idx + 1}
                </div>
                <GripVertical
                  className={`shrink-0 ${result ? "text-zinc-800" : "text-zinc-600 group-hover:text-zinc-400"} transition-colors`}
                  size={18}
                />
                <span className="font-medium text-zinc-200 flex-1">
                  {item.text}
                </span>
              </Card>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button
          onClick={handleSubmit}
          disabled={!!result || isSubmitting}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold h-12 shadow-lg shadow-orange-500/10"
        >
          <Send size={16} className="mr-2" />
          Submit Order
        </Button>
      </motion.div>
      <Feedback result={result} correctAnswerData={correctOrderText} />
    </motion.div>
  );
};

// ─── COMPONENT: Drag Match ────────────────────────────────
const DragMatchQuestion = ({ question, onSubmit, result, isSubmitting }) => {
  const [matches, setMatches] = useState({});
  const [selectedLeft, setSelectedLeft] = useState(null);

  const leftItems = question.pairs?.left || [];
  const rightItems = question.pairs?.right || [];

  // Track which pair color each match gets
  const getMatchColor = (leftIndex) => {
    const matchKeys = Object.keys(matches).sort(
      (a, b) => Number(a) - Number(b),
    );
    const order = matchKeys.indexOf(String(leftIndex));
    return order >= 0 ? PAIR_COLORS[order % PAIR_COLORS.length] : null;
  };

  const getRightMatchColor = (rightIndex) => {
    const entry = Object.entries(matches).find(([, v]) => v === rightIndex);
    if (!entry) return null;
    return getMatchColor(Number(entry[0]));
  };

  const handleLeftClick = (index) => {
    if (result) return;
    if (matches[index] !== undefined) {
      const newMatches = { ...matches };
      delete newMatches[index];
      setMatches(newMatches);
    } else {
      setSelectedLeft(index);
    }
  };

  const handleRightClick = (index) => {
    if (result || selectedLeft === null) return;
    const isAlreadyMatched = Object.values(matches).includes(index);
    if (isAlreadyMatched) return;

    setMatches((prev) => ({ ...prev, [selectedLeft]: index }));
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    onSubmit({ type: "drag_match", value: matches });
  };

  const isComplete = Object.keys(matches).length === leftItems.length;

  const correctMatchText =
    result?.correctAnswer && Array.isArray(result.correctAnswer)
      ? result.correctAnswer.map(
          (rightText, i) => `${leftItems[i]} → ${rightText}`,
        )
      : null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl"
    >
      <QuestionHeader
        icon={Shuffle}
        title="Match Pairs"
        instruction="Tap a left item, then tap the matching right item."
        difficulty={question.difficulty}
      />
      <motion.h3
        variants={itemVariants}
        className="text-xl font-semibold mb-6 leading-relaxed"
      >
        {question.question}
      </motion.h3>

      {/* Progress bar */}
      <motion.div variants={itemVariants} className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-500 font-medium">
            <Link2 size={12} className="inline mr-1" />
            {Object.keys(matches).length} / {leftItems.length} matched
          </span>
          {isComplete && !result && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-emerald-400 font-bold flex items-center gap-1"
            >
              <Sparkles size={12} /> All matched!
            </motion.span>
          )}
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${(Object.keys(matches).length / leftItems.length) * 100}%`,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-6 mb-6"
      >
        {/* Left Column */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 px-1">
            Terms
          </p>
          {leftItems.map((text, i) => {
            const isMatched = matches[i] !== undefined;
            const isSelected = selectedLeft === i;
            const color = isMatched ? getMatchColor(i) : null;

            return (
              <motion.div
                key={`left-${i}`}
                whileHover={!result ? { scale: 1.02 } : {}}
                whileTap={!result ? { scale: 0.98 } : {}}
              >
                <Card
                  onClick={() => handleLeftClick(i)}
                  className={`p-3.5 cursor-pointer transition-all border-2 relative overflow-hidden ${
                    isMatched && color
                      ? `${color.bg} ${color.border} ${color.text}`
                      : isSelected
                        ? "bg-orange-500/10 border-orange-500 text-orange-400 shadow-lg shadow-orange-500/10"
                        : "bg-zinc-900 border-zinc-800 hover:border-zinc-600 text-zinc-300"
                  } ${result ? "pointer-events-none" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {isMatched && color ? (
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${color.dot} shrink-0`}
                        />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 shrink-0" />
                      )}
                      <span className="text-sm font-medium">{text}</span>
                    </div>
                    {isMatched && (
                      <ArrowRight size={14} className="shrink-0 opacity-60" />
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 px-1">
            Definitions
          </p>
          {rightItems.map((text, i) => {
            const matchedLeftIndex = Object.keys(matches).find(
              (key) => matches[key] === i,
            );
            const isMatched = matchedLeftIndex !== undefined;
            const color = isMatched ? getRightMatchColor(i) : null;

            return (
              <motion.div
                key={`right-${i}`}
                whileHover={!result ? { scale: 1.02 } : {}}
                whileTap={!result ? { scale: 0.98 } : {}}
              >
                <Card
                  onClick={() => handleRightClick(i)}
                  className={`p-3.5 cursor-pointer transition-all border-2 ${
                    isMatched && color
                      ? `${color.bg} ${color.border} ${color.text}`
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-600 text-zinc-300"
                  } ${result ? "pointer-events-none" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    {isMatched && color ? (
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${color.dot} shrink-0`}
                      />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 shrink-0" />
                    )}
                    <span className="text-sm font-medium">{text}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || !!result || isSubmitting}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold h-12 shadow-lg shadow-orange-500/10 disabled:opacity-40"
        >
          <Send size={16} className="mr-2" />
          Submit Pairs
        </Button>
      </motion.div>
      <Feedback result={result} correctAnswerData={correctMatchText} />
    </motion.div>
  );
};

// ─── COMPONENT: Fill Blank ────────────────────────────────
const FillBlankQuestion = ({ question, onSubmit, result, isSubmitting }) => {
  const parts = question.codeTemplate.split("___");
  const [values, setValues] = useState(Array(parts.length - 1).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (index, val) => {
    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Tab" && !e.shiftKey && index < values.length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (values.some((v) => !v.trim())) return;
    onSubmit({ type: "fill_blank", value: values });
  };

  const filledCount = values.filter((v) => v.trim()).length;
  const totalBlanks = values.length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl"
    >
      <QuestionHeader
        icon={Code}
        title="Complete the Code"
        instruction="Fill in the blanks to complete the code."
        difficulty={question.difficulty}
      />
      <motion.h3
        variants={itemVariants}
        className="text-xl font-semibold mb-5 leading-relaxed"
      >
        {question.question}
      </motion.h3>

      {question.hint && (
        <motion.div
          variants={itemVariants}
          className="mb-5 flex items-start gap-2 text-sm text-amber-400/80 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10"
        >
          <Lightbulb size={16} className="shrink-0 mt-0.5" />
          <span>{question.hint}</span>
        </motion.div>
      )}

      {/* Blanks counter */}
      <motion.div variants={itemVariants} className="mb-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <div className="flex gap-1">
            {Array.from({ length: totalBlanks }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  values[i]?.trim() ? "bg-orange-500" : "bg-zinc-700"
                }`}
              />
            ))}
          </div>
          <span>
            {filledCount}/{totalBlanks} blanks filled
          </span>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden mb-6"
      >
        {/* Code header */}
        <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider ml-2">
            Code Editor
          </span>
        </div>

        <div className="p-5 font-mono text-sm leading-8 overflow-x-auto custom-scrollbar">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              <span className="whitespace-pre-wrap text-zinc-300">{part}</span>
              {i < parts.length - 1 && (
                <input
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  value={values[i]}
                  onChange={(e) => !result && handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={!!result || isSubmitting}
                  className={`inline-block mx-1 bg-zinc-900/80 border-b-2 focus:border-orange-500 outline-none text-orange-400 text-center px-2 py-0.5 rounded-t-md transition-all ${
                    values[i]?.trim()
                      ? "border-orange-500/60 w-auto min-w-[3rem]"
                      : "border-zinc-700 w-28"
                  }`}
                  style={{
                    width: values[i]
                      ? `${Math.max(3, values[i].length + 1)}ch`
                      : undefined,
                  }}
                  placeholder="___"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button
          onClick={handleSubmit}
          disabled={values.some((v) => !v.trim()) || !!result || isSubmitting}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold h-12 shadow-lg shadow-orange-500/10"
        >
          <Send size={16} className="mr-2" />
          Submit Code
        </Button>
      </motion.div>
      <Feedback result={result} correctAnswerData={result?.correctAnswer} />
    </motion.div>
  );
};

// ─── COMPONENT: Predict Output ─────────────────────────────
const PredictOutputQuestion = ({
  question,
  onSubmit,
  result,
  isSubmitting,
}) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit({ type: "predict_output", value });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-xl"
    >
      <QuestionHeader
        icon={Terminal}
        title="Predict Output"
        instruction="Analyze the code and determine the output."
        difficulty={question.difficulty}
      />
      <motion.h3
        variants={itemVariants}
        className="text-xl font-semibold mb-5 leading-relaxed"
      >
        {question.question}
      </motion.h3>

      <motion.div
        variants={itemVariants}
        className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden mb-6"
      >
        {/* Terminal header */}
        <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center gap-2">
          <Terminal size={13} className="text-emerald-500" />
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
            Code Snippet
          </span>
        </div>
        <div className="p-5 overflow-x-auto custom-scrollbar">
          <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-300 leading-relaxed">
            {question.codeSnippet}
          </pre>
        </div>
      </motion.div>

      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm">
            {">"}
          </div>
          <Input
            value={value}
            onChange={(e) => !result && setValue(e.target.value)}
            placeholder="What does this output?"
            className="bg-zinc-900/80 border-zinc-800 h-14 text-lg font-mono pl-8 focus:border-emerald-500/50 transition-colors"
            disabled={!!result || isSubmitting}
          />
        </div>
        <Button
          type="submit"
          disabled={!value.trim() || !!result || isSubmitting}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold h-12 shadow-lg shadow-orange-500/10"
        >
          <Send size={16} className="mr-2" />
          Submit Prediction
        </Button>
      </motion.form>
      <Feedback result={result} correctAnswerData={result?.correctAnswer} />
    </motion.div>
  );
};

// ─── COMPONENT: Classic MCQ ────────────────────────────────
const MCQQuestion = ({
  question,
  onSubmit,
  result,
  isSubmitting,
  selectedAnswer,
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl flex flex-col h-full"
    >
      <motion.h3
        variants={itemVariants}
        className="text-xl font-semibold mb-6 leading-relaxed"
      >
        {question.question}
      </motion.h3>

      {question.scenario && (
        <motion.div
          variants={itemVariants}
          className="bg-zinc-800/30 border-l-4 border-orange-500 rounded-r-xl p-5 mb-6"
        >
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {question.scenario}
          </p>
        </motion.div>
      )}

      {(question.buggyCode || question.contextCode) && (
        <motion.div
          variants={itemVariants}
          className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden mb-6"
        >
          <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2">
            <Code size={14} className="text-orange-400" />
            <span className="text-xs text-zinc-500 uppercase font-semibold">
              {question.buggyCode ? "Code to Review" : "System Context"}
            </span>
          </div>
          <pre className="p-4 text-sm text-zinc-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed custom-scrollbar">
            {question.buggyCode || question.contextCode}
          </pre>
        </motion.div>
      )}

      <div className="grid gap-3 mb-6">
        {question.options?.map((option, i) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = result?.correctAnswer === option;
          const showResult = !!result;

          let cardStyle =
            "border-zinc-800 bg-zinc-800/30 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-300";

          if (showResult && isCorrect) {
            cardStyle = "border-green-500/50 bg-green-500/10 text-green-400";
          } else if (showResult && isSelected && !isCorrect) {
            cardStyle = "border-red-500/50 bg-red-500/10 text-red-400";
          } else if (isSelected) {
            cardStyle = "border-orange-500/50 bg-orange-500/10 text-orange-400";
          }

          return (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={!result ? { scale: 1.01, x: 4 } : {}}
              whileTap={!result ? { scale: 0.99 } : {}}
            >
              <button
                className={`w-full text-left p-4 rounded-xl border transition-all flex gap-3 items-start ${cardStyle} ${
                  result ? "pointer-events-none" : "cursor-pointer"
                }`}
                onClick={() => !result && onSubmit(option)}
                disabled={!!result || isSubmitting}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    showResult && isCorrect
                      ? "bg-green-500/20 text-green-400"
                      : showResult && isSelected && !isCorrect
                        ? "bg-red-500/20 text-red-400"
                        : isSelected
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {showResult && isCorrect ? (
                    <Check size={14} />
                  ) : showResult && isSelected && !isCorrect ? (
                    <X size={14} />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span className="flex-1 whitespace-normal break-words text-[15px] leading-relaxed pt-0.5">
                  {option}
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>

      <Feedback result={result} correctAnswerData={result?.correctAnswer} />
    </motion.div>
  );
};

// ─── COMPONENT: Slider Adjust ─────────────────────────────
const SliderAdjustQuestion = ({ question, onSubmit, result, isSubmitting }) => {
  const sliders = question.sliders || [];
  const [values, setValues] = useState(
    sliders.map((s) => Math.round((s.min + s.max) / 2)),
  );

  const handleChange = (index, val) => {
    const newValues = [...values];
    newValues[index] = Number(val);
    setValues(newValues);
  };

  const handleSubmit = () => {
    const submission = {};
    values.forEach((v, i) => {
      submission[i] = v;
    });
    onSubmit({ type: "slider_adjust", value: submission });
  };

  // Calculate slider fill percentage for styling
  const getFillPercent = (value, min, max) =>
    ((value - min) / (max - min)) * 100;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-xl"
    >
      <QuestionHeader
        icon={SlidersHorizontal}
        title="Adjust Values"
        instruction="Drag the sliders to find the correct values."
        difficulty={question.difficulty}
      />
      <motion.h3
        variants={itemVariants}
        className="text-xl font-semibold mb-6 leading-relaxed"
      >
        {question.question}
      </motion.h3>

      <motion.div variants={itemVariants} className="space-y-6 mb-6">
        {sliders.map((slider, i) => {
          const fillPercent = getFillPercent(values[i], slider.min, slider.max);
          return (
            <div
              key={i}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-zinc-300">
                  {slider.label}
                </span>
                <div className="flex items-center gap-1">
                  <motion.span
                    key={values[i]}
                    initial={{ scale: 1.2, color: "#f97316" }}
                    animate={{ scale: 1, color: "#e4e4e7" }}
                    transition={{ duration: 0.2 }}
                    className="text-lg font-bold font-mono tabular-nums"
                  >
                    {values[i]}
                  </motion.span>
                  <span className="text-xs text-zinc-500 font-medium">
                    {slider.unit}
                  </span>
                </div>
              </div>

              {/* Custom range slider */}
              <div className="relative">
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                    style={{ width: `${fillPercent}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={values[i]}
                  onChange={(e) => !result && handleChange(i, e.target.value)}
                  disabled={!!result || isSubmitting}
                  className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer disabled:cursor-default"
                  style={{ top: 0 }}
                />
                {/* Thumb indicator */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-orange-500 bg-zinc-950 shadow-lg shadow-orange-500/20 pointer-events-none transition-all"
                  style={{ left: `calc(${fillPercent}% - 10px)` }}
                />
              </div>

              <div className="flex justify-between mt-2 text-[10px] text-zinc-600 font-mono">
                <span>
                  {slider.min}
                  {slider.unit}
                </span>
                <span>
                  {slider.max}
                  {slider.unit}
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button
          onClick={handleSubmit}
          disabled={!!result || isSubmitting}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold h-12 shadow-lg shadow-orange-500/10"
        >
          <Send size={16} className="mr-2" />
          Submit Values
        </Button>
      </motion.div>
      <Feedback result={result} correctAnswerData={result?.correctAnswer} />
    </motion.div>
  );
};

// ─── MAIN DISPATCHER ───────────────────────────────────────
export default function InteractiveQuestion(props) {
  const { question } = props;
  if (!question) return null;

  const type = question.interactionType;

  if (type === "type_answer") return <TypeAnswerQuestion {...props} />;
  if (type === "drag_order") return <DragOrderQuestion {...props} />;
  if (type === "drag_match") return <DragMatchQuestion {...props} />;
  if (type === "fill_blank") return <FillBlankQuestion {...props} />;
  if (type === "predict_output") return <PredictOutputQuestion {...props} />;
  if (type === "slider_adjust") return <SliderAdjustQuestion {...props} />;

  // Default fallback for classic MCQ or unknown types
  return <MCQQuestion {...props} />;
}
