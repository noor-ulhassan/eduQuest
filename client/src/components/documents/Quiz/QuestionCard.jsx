import { CheckCircle, XCircle } from 'lucide-react';

const LABELS = ['A', 'B', 'C', 'D', 'E'];

function QuestionCard({ question, selectedIndex, onAnswer }) {
  const showResult = selectedIndex !== undefined;

  const getOptionStyle = (index) => {
    const isSelected = selectedIndex === index;
    const isCorrect  = question.correctIndex === index;

    if (!showResult) return 'bg-[#1a1a1a] border-white/10 text-zinc-300 hover:border-red-500/40 hover:bg-[#222] hover:text-white cursor-pointer';
    if (isCorrect)   return 'bg-emerald-600/15 border-emerald-500/50 text-emerald-300 cursor-default';
    if (isSelected)  return 'bg-red-600/15 border-red-500/50 text-red-300 cursor-default';
    return 'bg-[#1a1a1a] border-white/5 text-zinc-700 opacity-40 cursor-default';
  };

  return (
    <div className="bg-[#111111] rounded-2xl border border-white/10 p-6">
      <p className="text-xs font-bold text-red-400/70 uppercase tracking-widest mb-3">Question</p>
      <h3 className="text-base font-semibold text-white leading-relaxed mb-6">
        {question.question}
      </h3>

      <div className="space-y-2.5">
        {question.options.map((option, index) => {
          const isCorrect  = question.correctIndex === index;
          const isSelected = selectedIndex === index;

          return (
            <button
              key={index}
              onClick={() => !showResult && onAnswer(index)}
              disabled={showResult}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${getOptionStyle(index)}`}
            >
              <div className="flex items-center gap-3">
                {/* Letter badge */}
                <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 transition-colors ${
                  showResult && isCorrect  ? 'bg-emerald-500/30 text-emerald-300' :
                  showResult && isSelected ? 'bg-red-500/30 text-red-300' :
                  'bg-white/8 text-zinc-500'
                }`}>
                  {LABELS[index]}
                </span>
                <span className="flex-1 text-sm leading-relaxed">{option}</span>
                {showResult && isCorrect  && <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />}
                {showResult && isSelected && !isCorrect && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation shown after answering */}
      {showResult && question.explanation && (
        <div className="mt-4 p-3.5 bg-[#1a1a1a] border border-white/8 rounded-xl">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Explanation</p>
          <p className="text-sm text-zinc-400 leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

export default QuestionCard;
