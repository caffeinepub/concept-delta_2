import { type Question } from '../backend';

interface QuestionDisplayProps {
  question: Question;
  selectedAnswer: number | null;
  onChange: (optionIndex: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuestionDisplay({
  question,
  selectedAnswer,
  onChange,
  questionNumber,
  totalQuestions,
}: QuestionDisplayProps) {
  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
      {/* Single question image — fills all available height, scrollable if tall */}
      <div className="flex-1 w-full bg-white rounded-2xl border border-navy/10 shadow-sm overflow-y-auto flex items-start justify-center min-h-0">
        {question.questionImageData ? (
          <img
            src={question.questionImageData}
            alt={`Question ${questionNumber} of ${totalQuestions}`}
            className="w-full h-auto object-contain block"
            style={{ minHeight: '80px' }}
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = 'none';
              const parent = el.parentElement;
              if (parent && !parent.querySelector('.img-err')) {
                const msg = document.createElement('p');
                msg.className = 'img-err text-sm text-gray-400 py-10 text-center w-full';
                msg.textContent = 'Question image unavailable';
                parent.appendChild(msg);
              }
            }}
          />
        ) : (
          <p className="text-sm text-gray-400 py-10 text-center w-full">No question image</p>
        )}
      </div>

      {/* Compact A/B/C/D answer buttons — single tight row */}
      <div className="flex items-center justify-center gap-3 pt-3 pb-1 flex-shrink-0">
        {OPTION_LABELS.map((label, idx) => {
          const isSelected = selectedAnswer === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(idx)}
              className={`w-11 h-11 rounded-lg border-2 font-bold text-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 flex items-center justify-center flex-shrink-0 ${
                isSelected
                  ? 'border-navy bg-navy/10 text-navy shadow-md'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-navy/50 hover:bg-navy/5'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
