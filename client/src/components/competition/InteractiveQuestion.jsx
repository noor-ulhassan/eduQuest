import React from "react";
import { motion } from "framer-motion";
import { Check, X, Code, Zap, Lightbulb } from "lucide-react";

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

// ─── UTILS ───────────────────────────────────────────────────

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
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.4,
      }}
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
          {isCorrect ? (
            <Check size={18} strokeWidth={3} />
          ) : (
            <X size={18} strokeWidth={3} />
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <p
              className={`font-black text-xl italic tracking-tight uppercase ${
                isCorrect
                  ? "text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                  : "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              }`}
            >
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>
            {result.pointsEarned > 0 && (
              <motion.span
                initial={{ scale: 0, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", delay: 0.2, stiffness: 300 }}
                className="flex items-center gap-1 text-sm font-black text-yellow-400 bg-yellow-500/20 px-3 py-0.5 rounded-full border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.3)] italic"
              >
                <Zap size={14} className="fill-yellow-400" />+
                {result.pointsEarned} XP
              </motion.span>
            )}
          </div>
          {result.explanation && (
            <p
              className={`text-sm mt-2 leading-relaxed font-medium ${
                isCorrect ? "text-green-300" : "text-red-300"
              }`}
            >
              {result.explanation}
            </p>
          )}
          {!isCorrect && correctAnswerData && (
            <div className="mt-4 text-sm bg-black/40 p-4 rounded-xl border border-white/10 shadow-inner">
              <span className="font-bold text-zinc-400 text-xs uppercase tracking-wider flex items-center gap-2 mb-3">
                <Lightbulb size={14} className="text-yellow-400" /> Correct
                Answer
              </span>
              <div className="font-mono text-sm text-emerald-400 space-y-2">
                {Array.isArray(correctAnswerData) ? (
                  correctAnswerData.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-1 bg-emerald-500/5 px-3 rounded-lg border border-emerald-500/10"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      {typeof item === "object"
                        ? JSON.stringify(item)
                        : String(item)}
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

// ─── COMPONENT: Classic MCQ (Quizizz Style) ─────────────────
const MCQQuestion = ({
  question,
  onSubmit,
  result,
  isSubmitting,
  selectedAnswer,
}) => {
  // Quizizz style brilliant brand colors for standard 4-option grids
  const quizizzColors = [
    {
      base: "bg-red-500",
      hover: "hover:bg-red-600",
      border: "border-red-600",
      activeBg: "bg-red-400",
      text: "text-white",
      shadow: "shadow-[0_8px_0_0_#991b1b]",
      activeShadow: "shadow-[0_2px_0_0_#991b1b]",
    },
    {
      base: "bg-blue-500",
      hover: "hover:bg-blue-600",
      border: "border-blue-600",
      activeBg: "bg-blue-400",
      text: "text-white",
      shadow: "shadow-[0_8px_0_0_#1e3a8a]",
      activeShadow: "shadow-[0_2px_0_0_#1e3a8a]",
    },
    {
      base: "bg-yellow-400",
      hover: "hover:bg-yellow-500",
      border: "border-yellow-500",
      activeBg: "bg-yellow-300",
      text: "text-black",
      shadow: "shadow-[0_8px_0_0_#a16207]",
      activeShadow: "shadow-[0_2px_0_0_#a16207]",
    },
    {
      base: "bg-green-500",
      hover: "hover:bg-green-600",
      border: "border-green-600",
      activeBg: "bg-green-400",
      text: "text-white",
      shadow: "shadow-[0_8px_0_0_#166534]",
      activeShadow: "shadow-[0_2px_0_0_#166534]",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col"
    >
      {/* Centralized Gamified Question Layout */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[150px] mb-8 w-full">
        <motion.h3
          variants={itemVariants}
          className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-center leading-tight tracking-tight drop-shadow-md select-text text-metallic"
        >
          {question.question}
        </motion.h3>

        {question.imageUrl && (
          <motion.div
            variants={itemVariants}
            className="mt-6 w-full max-w-lg mx-auto rounded-2xl overflow-hidden border-4 border-zinc-800 shadow-2xl"
          >
            <img
              src={question.imageUrl}
              alt="Question Visual"
              className="w-full h-auto object-contain max-h-[300px] bg-black/40"
            />
          </motion.div>
        )}
      </div>

      {question.scenario && (
        <motion.div
          variants={itemVariants}
          className="bg-zinc-800/30 border-l-4 border-orange-500 rounded-r-xl p-5 mb-6 max-w-4xl mx-auto w-full"
        >
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {question.scenario}
          </p>
        </motion.div>
      )}

      {(question.buggyCode || question.contextCode) && (
        <motion.div
          variants={itemVariants}
          className="bg-zinc-950 border-2 border-zinc-800 rounded-2xl overflow-hidden mb-8 max-w-4xl mx-auto w-full shadow-lg"
        >
          <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center gap-2">
            <Code size={16} className="text-orange-400" />
            <span className="text-[11px] text-zinc-400 uppercase tracking-widest font-black">
              {question.buggyCode ? "Code to Review" : "Context"}
            </span>
          </div>
          <pre className="p-5 text-[15px] text-zinc-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed custom-scrollbar">
            {question.buggyCode || question.contextCode}
          </pre>
        </motion.div>
      )}

      {/* 2x2 Vibrant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-5xl mx-auto w-full mb-6">
        {question.options?.map((option, i) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = result?.correctAnswer === option;
          const showResult = !!result;

          const theme = quizizzColors[i % 4];

          let cardStyle = `${theme.base} ${theme.border} ${theme.text} ${theme.hover} ${theme.shadow} hover:-translate-y-1 hover:shadow-[0_12px_0_0_rgba(0,0,0,0.5)] active:translate-y-2 active:shadow-[0_0px_0_0_rgba(0,0,0,0)]`;

          if (showResult) {
            if (isCorrect) {
              cardStyle =
                "bg-green-500 border-green-600 text-white shadow-[0_8px_0_0_#166534] scale-[1.02] ring-4 ring-green-400/50 z-10";
            } else if (isSelected && !isCorrect) {
              cardStyle =
                "bg-red-500 border-red-600 text-white shadow-[0_4px_0_0_#991b1b] opacity-90 translate-y-2 opacity-50 grayscale-[50%]";
            } else {
              cardStyle =
                "bg-zinc-800 border-zinc-700 text-zinc-500 shadow-none opacity-40 grayscale pointer-events-none";
            }
          } else if (isSelected) {
            cardStyle = `${theme.activeBg} border-white text-white translate-y-2 ${theme.activeShadow} ring-4 ring-white/30`;
          }

          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="h-full flex flex-col"
            >
              <button
                className={`w-full h-full min-h-[100px] text-center p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden group ${
                  result
                    ? "pointer-events-none cursor-default"
                    : "cursor-pointer"
                } ${cardStyle}`}
                onClick={() => !result && onSubmit(option)}
                disabled={!!result || isSubmitting}
              >
                {/* Subtle shine effect on hover */}
                {!result && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}

                {/* Status Indicator Icon */}
                {showResult && (isCorrect || (isSelected && !isCorrect)) && (
                  <div
                    className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm border-2 border-white text-white drop-shadow-md`}
                  >
                    {isCorrect ? (
                      <Check size={18} strokeWidth={4} />
                    ) : (
                      <X size={18} strokeWidth={4} />
                    )}
                  </div>
                )}

                <span className="w-full break-words text-lg md:text-xl xl:text-2xl font-black drop-shadow-md select-none px-4">
                  {option}
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {!isSubmitting && (
        <Feedback result={result} correctAnswerData={result?.correctAnswer} />
      )}
    </motion.div>
  );
};

// ─── MAIN DISPATCHER ───────────────────────────────────────
export default function InteractiveQuestion(props) {
  const { question } = props;
  if (!question) return null;

  return <MCQQuestion {...props} />;
}
