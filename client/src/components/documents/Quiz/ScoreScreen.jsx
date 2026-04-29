import { Trophy, RotateCcw, CheckCircle, XCircle, Star, BookOpen } from 'lucide-react';

function ScoreScreen({ score, total, onRetake, onReview }) {
  const percentage = Math.round((score / total) * 100);
  const isPassing  = percentage >= 70;

  const grade =
    percentage === 100 ? { label: 'Perfect!',    color: 'text-yellow-400' } :
    percentage >= 80   ? { label: 'Excellent!',  color: 'text-emerald-400' } :
    percentage >= 70   ? { label: 'Good Job!',   color: 'text-blue-400' } :
    percentage >= 50   ? { label: 'Keep Going!', color: 'text-orange-400' } :
                         { label: 'Try Again!',  color: 'text-red-400' };

  return (
    <div className="flex flex-col h-full items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-2xl p-8 text-center">

        {/* Trophy glow */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className={`absolute inset-0 rounded-full blur-xl opacity-40 ${isPassing ? 'bg-yellow-500' : 'bg-zinc-700'}`} />
          <div className={`relative w-24 h-24 rounded-full border flex items-center justify-center ${isPassing ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-white/5 border-white/10'}`}>
            <Trophy size={40} className={isPassing ? 'text-yellow-400' : 'text-zinc-500'} />
          </div>
          {isPassing && (
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-red-600 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Star size={14} className="text-white" fill="currentColor" />
            </div>
          )}
        </div>

        <p className={`text-sm font-bold uppercase tracking-widest mb-1 ${grade.color}`}>{grade.label}</p>
        <h2 className="text-xl font-bold text-white mb-1">Quiz Complete</h2>
        <p className="text-sm text-zinc-500 mb-6">{score} out of {total} correct</p>

        {/* Big score */}
        <div className="relative mb-6">
          <div className="text-7xl font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent leading-none">
            {percentage}
            <span className="text-3xl">%</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex justify-center gap-6 mb-7">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle size={14} className="text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">{score}</p>
              <p className="text-[10px] text-zinc-600">Correct</p>
            </div>
          </div>
          <div className="w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
              <XCircle size={14} className="text-red-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">{total - score}</p>
              <p className="text-[10px] text-zinc-600">Wrong</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {onReview && (
            <button
              onClick={onReview}
              className="w-full py-3 bg-[#1a1a1a] border border-white/10 text-white rounded-xl font-bold hover:border-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen size={15} /> Review Answers
            </button>
          )}
          <button
            onClick={onRetake}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
          >
            <RotateCcw size={15} /> Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScoreScreen;
