import { CheckCircle, XCircle } from 'lucide-react';

function QuestionCard({ question, selectedIndex, onAnswer }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        {question.question}
      </h3>
      
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = question.correctIndex === index;
          const showResult = selectedIndex !== undefined;
          
          let optionClass = 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50';
          if (showResult) {
            if (isCorrect) {
              optionClass = 'border-green-500 bg-green-50';
            } else if (isSelected && !isCorrect) {
              optionClass = 'border-red-500 bg-red-50';
            } else {
              optionClass = 'border-gray-200 bg-gray-50 opacity-60';
            }
          }
          
          return (
            <button
              key={index}
              onClick={() => !showResult && onAnswer(index)}
              disabled={showResult}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${optionClass}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-800">{option}</span>
                {showResult && isCorrect && (
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircle size={20} className="text-red-600 flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuestionCard;
