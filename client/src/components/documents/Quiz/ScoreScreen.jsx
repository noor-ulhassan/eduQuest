import { Trophy, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

function ScoreScreen({ score, total, onRetake }) {
  const percentage = Math.round((score / total) * 100);
  const isPassing = percentage >= 70;
  
  return (
    <div className="h-[calc(100vh-180px)] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isPassing ? 'bg-green-100' : 'bg-orange-100'
        }`}>
          <Trophy size={40} className={isPassing ? 'text-green-600' : 'text-orange-600'} />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Quiz Complete!</h2>
        <p className="text-gray-600 mb-6">You scored {score} out of {total}</p>
        
        <div className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {percentage}%
        </div>
        
        <div className="flex justify-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <span className="text-sm text-gray-600">{score} Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600" />
            <span className="text-sm text-gray-600">{total - score} Incorrect</span>
          </div>
        </div>
        
        <button
          onClick={onRetake}
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
        >
          <RotateCcw size={18} />
          Retake Quiz
        </button>
      </div>
    </div>
  );
}

export default ScoreScreen;
