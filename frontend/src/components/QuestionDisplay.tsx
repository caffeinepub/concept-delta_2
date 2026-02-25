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
    <div className="space-y-5">
      {/* Question header */}
      <div className="flex items-center gap-3">
        <span className="bg-navy text-white text-sm font-bold px-3 py-1 rounded-full">
          Q{questionNumber} / {totalQuestions}
        </span>
      </div>

      {/* Single question image — full width, scrollable if tall */}
      <div className="w-full bg-white rounded-2xl border border-navy/10 shadow-sm overflow-hidden flex items-center justify-center">
        {question.questionImageData ? (
          <div className="w-full overflow-y-auto" style={{ maxHeight: '72vh' }}>
            <img
              src={question.questionImageData}
              alt={`Question ${questionNumber}`}
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
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-10 text-center w-full">No question image</p>
        )}
      </div>

      {/* Answer option buttons — A, B, C, D */}
      <div className="flex flex-col gap-3">
        {OPTION_LABELS.map((label, idx) => {
          const isSelected = selectedAnswer === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(idx)}
              className={`w-full flex items-center gap-4 px-5 rounded-xl border-2 font-semibold text-base transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 ${
                isSelected
                  ? 'border-navy bg-navy text-white shadow-md'
                  : 'border-gray-200 bg-white text-navy hover:border-navy/50 hover:bg-navy/5'
              }`}
              style={{ minHeight: '52px' }}
            >
              {/* Option label circle */}
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  isSelected
                    ? 'bg-white text-navy border-white'
                    : 'bg-navy/10 text-navy border-navy/20'
                }`}
              >
                {label}
              </span>
              <span className="text-left">Option {label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
