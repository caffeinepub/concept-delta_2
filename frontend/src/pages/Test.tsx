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

            {/* Single question image — large, scrollable */}
            <div className="px-4 pt-4 pb-2">
              <div
                className="w-full bg-white rounded-xl border border-navy/10 shadow-sm overflow-y-auto flex items-start justify-center"
                style={{ maxHeight: 'calc(100vh - 200px)' }}
              >
                {question.questionImageData ? (
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
                ) : (
                  <p className="text-sm text-gray-400 py-6 text-center w-full">No question image</p>
                )}
              </div>
            </div>

            {/* Compact A/B/C/D buttons — single row */}
            <div className="flex items-center justify-center gap-3 px-5 pb-4 pt-3">
              {OPTION_LABELS.map((label, optIdx) => {
                const isUserChoice = userAnswer === optIdx;
                const isCorrectOption = correctAnswer === optIdx;

                let buttonClass = 'border-gray-300 bg-white text-gray-600';

                if (isCorrectOption) {
                  buttonClass = 'border-green-500 bg-green-100 text-green-800';
                } else if (isUserChoice) {
                  buttonClass = 'border-blue-500 bg-blue-100 text-blue-800';
                }

                return (
                  <div
                    key={optIdx}
                    className={`w-11 h-11 rounded-lg border-2 font-bold text-sm flex items-center justify-center flex-shrink-0 ${buttonClass}`}
                  >
                    {label}
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
          <div className="flex gap-4 justify-center">
            <Skeleton className="h-11 w-11 rounded-lg" />
            <Skeleton className="h-11 w-11 rounded-lg" />
            <Skeleton className="h-11 w-11 rounded-lg" />
            <Skeleton className="h-11 w-11 rounded-lg" />
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Top bar: test name + timer + question counter */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="bg-navy text-white text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
              {currentIndex + 1}/{totalQuestions}
            </span>
            <p className="text-sm font-bold text-navy truncate hidden sm:block">{currentTest?.name ?? ''}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Compact progress indicator */}
            <div className="flex items-center gap-1.5">
              <div className="w-20 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-navy h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 font-medium w-8 text-right">{answeredCount}/{totalQuestions}</span>
            </div>
            {currentTest && (
              <TestTimer
                durationSeconds={Number(currentTest.durationSeconds)}
                onTimeUp={handleTimeUp}
              />
            )}
          </div>
        </div>
      </div>

      {/* Question navigation dots — compact scrollable row */}
      <div className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-7 h-7 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
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
      </div>

      {/* Main content: question + answer buttons */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-3 py-3 flex flex-col">
        {/* Question image — fills all remaining space */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-navy/10 shadow-sm overflow-y-auto flex items-start justify-center min-h-0">
          {currentQuestion.questionImageData ? (
            <img
              src={currentQuestion.questionImageData}
              alt={`Question ${currentIndex + 1} of ${totalQuestions}`}
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

        {/* Bottom controls: A/B/C/D + Prev/Next in one compact row */}
        <div className="flex items-center justify-between gap-2 pt-3 pb-2 flex-shrink-0">
          {/* Previous button */}
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            size="sm"
            className="rounded-lg border-navy/30 text-navy hover:bg-navy/5 flex items-center gap-1 px-3 flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </Button>

          {/* Compact A/B/C/D answer buttons */}
          <div className="flex items-center gap-2">
            {['A', 'B', 'C', 'D'].map((label, idx) => {
              const isSelected = (answers[currentIndex] ?? null) === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswer(idx)}
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

          {/* Next / Submit button */}
          {currentIndex < totalQuestions - 1 ? (
            <Button
              onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
              size="sm"
              className="bg-navy hover:bg-navy-dark text-white rounded-lg flex items-center gap-1 px-3 flex-shrink-0"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitTest.isPending}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1 px-3 flex-shrink-0"
            >
              {submitTest.isPending ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span className="hidden sm:inline">Submitting...</span>
                </span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Submit</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
