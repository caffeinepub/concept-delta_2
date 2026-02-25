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

      {/* Question image */}
      <div className="w-full bg-navy/5 rounded-2xl border border-navy/10 overflow-hidden flex items-center justify-center p-2">
        <img
          src={question.questionImageUrl}
          alt={`Question ${questionNumber}`}
          className="w-full object-contain rounded-xl"
          style={{ maxHeight: '280px', minHeight: '100px' }}
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.style.display = 'none';
            const parent = el.parentElement;
            if (parent && !parent.querySelector('.img-err')) {
              const msg = document.createElement('p');
              msg.className = 'img-err text-sm text-gray-400 py-6 text-center w-full';
              msg.textContent = 'Question image could not be loaded.';
              parent.appendChild(msg);
            }
          }}
        />
      </div>

      {/* Options — 1 column on mobile, 2×2 grid on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.optionImageUrls.map((optUrl, idx) => (
          <button
            key={idx}
            onClick={() => onChange(idx)}
            className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-navy/50 ${
              selectedAnswer === idx
                ? 'border-navy shadow-md ring-2 ring-navy/20'
                : 'border-gray-200 bg-white hover:border-navy/40 hover:shadow-sm'
            }`}
          >
            {/* Option label badge */}
            <span
              className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-colors ${
                selectedAnswer === idx
                  ? 'bg-navy text-white'
                  : 'bg-white text-navy border border-navy/30'
              }`}
            >
              {OPTION_LABELS[idx]}
            </span>

            {/* Option image */}
            <div className={`w-full flex items-center justify-center p-2 pt-8 ${
              selectedAnswer === idx ? 'bg-navy/5' : 'bg-gray-50'
            }`} style={{ minHeight: '120px', maxHeight: '180px' }}>
              <img
                src={optUrl}
                alt={`Option ${OPTION_LABELS[idx]}`}
                className="w-full object-contain"
                style={{ maxHeight: '160px' }}
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = 'none';
                  const parent = el.parentElement;
                  if (parent && !parent.querySelector('.img-err')) {
                    const msg = document.createElement('p');
                    msg.className = 'img-err text-xs text-gray-400 py-4 text-center w-full';
                    msg.textContent = 'Image unavailable';
                    parent.appendChild(msg);
                  }
                }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
