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
    <div className="space-y-6">
      {/* Question header */}
      <div className="flex items-center gap-3">
        <span className="bg-navy text-white text-sm font-bold px-3 py-1 rounded-full">
          Q{questionNumber} / {totalQuestions}
        </span>
      </div>

      {/* Question image */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
        <img
          src={question.questionImageUrl}
          alt={`Question ${questionNumber}`}
          className="w-full max-h-64 object-contain p-4"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
          }}
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.optionImageUrls.map((url, idx) => (
          <button
            key={idx}
            onClick={() => onChange(idx)}
            className={`relative rounded-xl border-2 overflow-hidden transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-navy/50 ${
              selectedAnswer === idx
                ? 'border-navy shadow-md ring-2 ring-navy/20'
                : 'border-gray-200 hover:border-navy/40 hover:shadow-sm'
            }`}
          >
            {/* Option label badge */}
            <div
              className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                selectedAnswer === idx
                  ? 'bg-navy text-white'
                  : 'bg-white text-navy border border-navy/30'
              }`}
            >
              {OPTION_LABELS[idx]}
            </div>
            <div className="bg-gray-50 p-2 pt-8">
              <img
                src={url}
                alt={`Option ${OPTION_LABELS[idx]}`}
                className="w-full max-h-32 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9wdGlvbjwvdGV4dD48L3N2Zz4=';
                }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
