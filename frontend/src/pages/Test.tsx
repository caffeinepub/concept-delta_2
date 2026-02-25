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

            {/* Question image */}
            <div className="px-5 pt-4 pb-2">
              <div className="w-full bg-navy/5 rounded-xl border border-navy/10 overflow-hidden flex items-center justify-center p-2">
                <img
                  src={question.questionImageUrl}
                  alt={`Question ${idx + 1}`}
                  className="w-full object-contain rounded-lg"
                  style={{ maxHeight: '240px', minHeight: '80px' }}
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.style.display = 'none';
                    const parent = el.parentElement;
                    if (parent && !parent.querySelector('.img-err')) {
                      const msg = document.createElement('p');
                      msg.className = 'img-err text-sm text-gray-400 py-4 text-center w-full';
                      msg.textContent = 'Question image unavailable';
                      parent.appendChild(msg);
                    }
                  }}
                />
              </div>
            </div>

            {/* Options — 1 column on mobile, 2 columns on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-5 pb-5 pt-3">
              {question.optionImageUrls.map((optUrl, optIdx) => {
                const isUserChoice = userAnswer === optIdx;
                const isCorrectOption = correctAnswer === optIdx;

                let borderClass = 'border-gray-200';
                let bgClass = 'bg-white';
                let labelBg = 'bg-gray-100 text-gray-600';

                if (isCorrectOption) {
                  borderClass = 'border-green-500';
                  bgClass = 'bg-green-50';
                  labelBg = 'bg-green-500 text-white';
                } else if (isUserChoice && !isCorrectOption) {
                  borderClass = 'border-blue-400';
                  bgClass = 'bg-blue-50';
                  labelBg = 'bg-blue-400 text-white';
                }

                return (
                  <div
                    key={optIdx}
                    className={`relative rounded-xl border-2 overflow-hidden ${borderClass} ${bgClass}`}
                  >
                    {/* Label badge */}
                    <span
                      className={`absolute top-2 left-2 z-10 text-xs font-bold px-1.5 py-0.5 rounded ${labelBg}`}
                    >
                      {OPTION_LABELS[optIdx]}
                    </span>

                    {/* Correct / User choice indicators */}
                    {(isCorrectOption || isUserChoice) && (
                      <div className="absolute top-2 right-2 z-10 flex gap-1">
                        {isCorrectOption && (
                          <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded font-semibold">
                            ✓ Correct
                          </span>
                        )}
                        {isUserChoice && !isCorrectOption && (
                          <span className="text-xs bg-blue-400 text-white px-1.5 py-0.5 rounded font-semibold">
                            Your answer
                          </span>
                        )}
                      </div>
                    )}

                    {/* Option image */}
                    <div
                      className="w-full flex items-center justify-center p-2 pt-8"
                      style={{ minHeight: '100px', maxHeight: '160px' }}
                    >
                      <img
                        src={optUrl}
                        alt={`Option ${OPTION_LABELS[optIdx]}`}
                        className="w-full object-contain"
                        style={{ maxHeight: '140px' }}
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.style.display = 'none';
                          const parent = el.parentElement;
                          if (parent && !parent.querySelector('.img-err')) {
                            const msg = document.createElement('p');
                            msg.className = 'img-err text-xs text-gray-400 py-3 text-center w-full';
                            msg.textContent = 'Image unavailable';
                            parent.appendChild(msg);
                          }
                        }}
                      />
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
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
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
                  ? 'bg-navy/20 text-navy border border-navy/30'
                  : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-navy/30'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question display */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
          <QuestionDisplay
            question={currentQuestion}
            selectedAnswer={answers[currentIndex] ?? null}
            onChange={handleAnswer}
            questionNumber={currentIndex + 1}
            totalQuestions={totalQuestions}
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentIndex < totalQuestions - 1 ? (
              <Button
                onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
                className="bg-navy hover:bg-navy-dark text-white rounded-xl flex items-center gap-1.5"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitTest.isPending}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl flex items-center gap-2 px-6"
              >
                {submitTest.isPending ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
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
    </div>
  );
}
