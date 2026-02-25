import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetTestQuestions, useGetPublishedTests, useSubmitTest } from '../hooks/useQueries';
import { type Question } from '../backend';
import Navbar from '../components/Navbar';
import TestTimer from '../components/TestTimer';
import QuestionDisplay from '../components/QuestionDisplay';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Send, CheckCircle2, Home, XCircle } from 'lucide-react';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface AnswerReviewProps {
  questions: Question[];
  userAnswers: Record<number, number>;
}

function AnswerReview({ questions, userAnswers }: AnswerReviewProps) {
  return (
    <div className="mt-10 space-y-8">
      <h3 className="text-xl font-bold text-navy border-b border-gray-200 pb-3">Answer Review</h3>
      {questions.map((question, idx) => {
        const userAnswer = userAnswers[idx] ?? -1;
        const correctAnswer = Number(question.correctOption);
        const isCorrect = userAnswer === correctAnswer;

        return (
          <div key={question.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Question header */}
            <div className="bg-navy/5 px-5 py-3 flex items-center gap-3">
              <span className="text-navy font-bold text-sm">Q{idx + 1}</span>
              {isCorrect ? (
                <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> Correct
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-500 text-xs font-semibold">
                  <XCircle className="h-4 w-4" /> Incorrect
                </span>
              )}
            </div>

            {/* Single question image — full width, responsive */}
            <div className="px-5 pt-4 pb-2">
              <div className="w-full bg-white rounded-xl border border-navy/10 shadow-sm overflow-hidden flex items-center justify-center">
                {question.questionImageData ? (
                  <div className="w-full overflow-y-auto" style={{ maxHeight: '48vh' }}>
                    <img
                      src={question.questionImageData}
                      alt={`Question ${idx + 1}`}
                      className="w-full h-auto object-contain block"
                      style={{ minHeight: '60px' }}
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        el.style.display = 'none';
                        const parent = el.parentElement;
                        if (parent && !parent.querySelector('.img-err')) {
                          const msg = document.createElement('p');
                          msg.className = 'img-err text-sm text-gray-400 py-6 text-center w-full';
                          msg.textContent = 'Question image unavailable';
                          parent.appendChild(msg);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 py-6 text-center w-full">No question image</p>
                )}
              </div>
            </div>

            {/* Answer option labels — A, B, C, D as full-width cards */}
            <div className="flex flex-col gap-2 px-5 pb-5 pt-3">
              {OPTION_LABELS.map((label, optIdx) => {
                const isUserChoice = userAnswer === optIdx;
                const isCorrectOption = correctAnswer === optIdx;

                let borderClass = 'border-gray-200';
                let bgClass = 'bg-white';
                let textClass = 'text-gray-700';
                let circleBg = 'bg-gray-100 text-gray-600 border-gray-200';

                if (isCorrectOption) {
                  borderClass = 'border-green-500';
                  bgClass = 'bg-green-50';
                  textClass = 'text-green-800';
                  circleBg = 'bg-green-500 text-white border-green-500';
                } else if (isUserChoice) {
                  borderClass = 'border-blue-400';
                  bgClass = 'bg-blue-50';
                  textClass = 'text-blue-800';
                  circleBg = 'bg-blue-400 text-white border-blue-400';
                }

                return (
                  <div
                    key={optIdx}
                    className={`w-full flex items-center gap-4 px-5 rounded-xl border-2 ${borderClass} ${bgClass}`}
                    style={{ minHeight: '52px' }}
                  >
                    {/* Option label circle */}
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${circleBg}`}
                    >
                      {label}
                    </span>
                    <span className={`font-semibold text-sm flex-1 ${textClass}`}>
                      Option {label}
                    </span>
                    {/* Indicators */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      {isCorrectOption && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                          ✓ Correct
                        </span>
                      )}
                      {isUserChoice && !isCorrectOption && (
                        <span className="text-xs bg-blue-400 text-white px-2 py-0.5 rounded-full font-semibold">
                          Your answer
                        </span>
                      )}
                      {isUserChoice && isCorrectOption && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                          ✓ Your answer
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Test() {
  const { testId } = useParams({ from: '/test/$testId' });
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();

  const { data: tests } = useGetPublishedTests();
  const { data: questions, isLoading: questionsLoading } = useGetTestQuestions(testId);
  const submitTest = useSubmitTest();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);

  const currentTest = tests?.find((t) => t.id === testId);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isInitializing && !identity) {
      navigate({ to: '/' });
    }
  }, [identity, isInitializing, navigate]);

  const handleAnswer = useCallback((optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  }, [currentIndex]);

  const handleSubmit = useCallback(async () => {
    if (!questions) return;
    const answersArray = questions.map((_, i) => BigInt(answers[i] ?? 0));
    try {
      const result = await submitTest.mutateAsync({ testId, answers: answersArray });
      setScore(Number(result));
      setSubmitted(true);
    } catch {
      // handle error silently
    }
  }, [questions, answers, testId, submitTest]);

  const handleTimeUp = useCallback(() => {
    setTimeExpired(true);
    handleSubmit();
  }, [handleSubmit]);

  if (isInitializing || questionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-[60vh] w-full rounded-2xl" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 text-lg">No questions found for this test.</p>
          <Button
            onClick={() => navigate({ to: '/dashboard' })}
            className="mt-6 bg-navy text-white rounded-xl"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Result screen
  if (submitted) {
    const percentage = Math.round(((score ?? 0) / totalQuestions) * 100);
    const isPassing = percentage >= 60;

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* Score card */}
          <div className={`rounded-3xl p-8 text-center shadow-lg mb-8 ${isPassing ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
            <div className={`text-6xl font-extrabold mb-2 ${isPassing ? 'text-green-600' : 'text-red-500'}`}>
              {score}/{totalQuestions}
            </div>
            <div className={`text-2xl font-bold mb-1 ${isPassing ? 'text-green-700' : 'text-red-600'}`}>
              {percentage}%
            </div>
            <p className={`text-base font-medium ${isPassing ? 'text-green-600' : 'text-red-500'}`}>
              {timeExpired ? 'Time expired — ' : ''}{isPassing ? '🎉 Great job!' : 'Keep practicing!'}
            </p>
            {currentTest && (
              <p className="text-sm text-gray-500 mt-2">{currentTest.name}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center mb-8">
            <Button
              onClick={() => navigate({ to: '/dashboard' })}
              variant="outline"
              className="rounded-xl border-navy/30 text-navy hover:bg-navy/5 flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              onClick={() => navigate({ to: '/results' })}
              className="bg-navy hover:bg-navy-dark text-white rounded-xl flex items-center gap-2"
            >
              View My Results
            </Button>
          </div>

          {/* Answer review */}
          <AnswerReview questions={questions} userAnswers={answers} />
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Top bar: test name + timer */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Test</p>
            <p className="text-sm font-bold text-navy truncate">{currentTest?.name ?? 'Loading...'}</p>
          </div>
          {currentTest && (
            <TestTimer
              durationSeconds={Number(currentTest.durationSeconds)}
              onTimeUp={handleTimeUp}
            />
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-400 font-medium">
            <span>{answeredCount} of {totalQuestions} answered</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-navy h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question navigation dots */}
        <div className="flex flex-wrap gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                i === currentIndex
                  ? 'bg-navy text-white shadow-md scale-110'
                  : answers[i] !== undefined
                  ? 'bg-navy/20 text-navy'
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Current question */}
        <QuestionDisplay
          question={currentQuestion}
          selectedAnswer={answers[currentIndex] ?? null}
          onChange={handleAnswer}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
        />

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 pb-8">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="rounded-xl border-navy/30 text-navy hover:bg-navy/5 flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentIndex < totalQuestions - 1 ? (
            <Button
              onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
              className="bg-navy hover:bg-navy-dark text-white rounded-xl flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitTest.isPending}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-2"
            >
              {submitTest.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Test
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
