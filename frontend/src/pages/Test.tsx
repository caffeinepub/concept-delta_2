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
              <img
                src={question.questionImageUrl}
                alt={`Question ${idx + 1}`}
                className="w-full max-h-48 object-contain rounded-xl bg-gray-50 border border-gray-100"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 px-5 pb-5 pt-2">
              {question.optionImageUrls.map((url, optIdx) => {
                const isUserChoice = userAnswer === optIdx;
                const isCorrectOption = correctAnswer === optIdx;

                let borderClass = 'border-gray-200';
                let bgClass = 'bg-white';
                let labelBg = 'bg-gray-100 text-gray-600';

                if (isCorrectOption) {
                  borderClass = 'border-green-500 border-2';
                  bgClass = 'bg-green-50';
                  labelBg = 'bg-green-500 text-white';
                } else if (isUserChoice && !isCorrectOption) {
                  borderClass = 'border-navy border-2';
                  bgClass = 'bg-navy/5';
                  labelBg = 'bg-navy text-white';
                }

                return (
                  <div
                    key={optIdx}
                    className={`relative rounded-xl border ${borderClass} ${bgClass} p-2 transition-all`}
                  >
                    <span
                      className={`absolute top-2 left-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${labelBg}`}
                    >
                      {OPTION_LABELS[optIdx]}
                    </span>
                    <img
                      src={url}
                      alt={`Option ${OPTION_LABELS[optIdx]}`}
                      className="w-full h-24 object-contain pt-4"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    {isCorrectOption && (
                      <div className="absolute bottom-1 right-1">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                    {isUserChoice && !isCorrectOption && (
                      <div className="absolute bottom-1 right-1">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
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
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalAnswers, setFinalAnswers] = useState<Record<number, number>>({});

  const { data: questions, isLoading: questionsLoading } = useGetTestQuestions(testId);
  const { data: publishedTests } = useGetPublishedTests();
  const submitTest = useSubmitTest();

  const currentTest = publishedTests?.find((t) => t.id === testId);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = useCallback(async () => {
    if (!questions || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const answersArray: bigint[] = questions.map((_, idx) =>
        BigInt(answers[idx] ?? 0)
      );
      const result = await submitTest.mutateAsync({ testId, answers: answersArray });
      setScore(Number(result));
      setFinalAnswers({ ...answers });
      setSubmitted(true);
    } catch (err) {
      console.error('Submit failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [questions, answers, testId, submitTest, isSubmitting]);

  const handleTimeUp = useCallback(() => {
    if (!submitted) {
      handleSubmit();
    }
  }, [submitted, handleSubmit]);

  if (!isAuthenticated) return null;

  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-10 space-y-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No questions found for this test.</p>
            <Button onClick={() => navigate({ to: '/dashboard' })} className="mt-4 bg-navy text-white">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Result screen
  if (submitted) {
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
          {/* Score Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-navy mb-2">Test Submitted!</h2>
            <p className="text-gray-500 mb-8">
              {currentTest?.name || 'Mock Test'} completed
            </p>

            <div className="bg-navy/5 rounded-2xl p-6 mb-8">
              <p className="text-5xl font-extrabold text-navy mb-1">
                {score} <span className="text-2xl text-gray-400">/ {total}</span>
              </p>
              <p className="text-gray-500 text-sm">correct answers</p>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-navy rounded-full h-2 transition-all duration-700"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-navy font-bold mt-2">{percentage}%</p>
            </div>

            <Button
              onClick={() => navigate({ to: '/dashboard' })}
              className="w-full bg-navy hover:bg-navy-dark text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          {/* Answer Review */}
          <AnswerReview questions={questions} userAnswers={finalAnswers} />

          {/* Bottom Back Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => navigate({ to: '/dashboard' })}
              className="bg-navy hover:bg-navy-dark text-white font-semibold px-8 py-3 rounded-xl flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Test Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-navy font-bold text-sm hidden sm:block">
              {currentTest?.name || 'Mock Test'}
            </span>
            <span className="text-gray-400 text-sm">
              {answeredCount}/{questions.length} answered
            </span>
          </div>
          {currentTest && (
            <TestTimer
              durationSeconds={Number(currentTest.durationSeconds)}
              onTimeUp={handleTimeUp}
            />
          )}
        </div>
      </div>

      {/* Question Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        <QuestionDisplay
          question={currentQuestion}
          selectedAnswer={answers[currentIndex] ?? null}
          onChange={(optionIdx) => setAnswers((prev) => ({ ...prev, [currentIndex]: optionIdx }))}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 gap-4">
          <Button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            variant="outline"
            className="border-navy/30 text-navy hover:bg-navy/5 flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {/* Question dots */}
          <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  idx === currentIndex
                    ? 'bg-navy text-white'
                    : answers[idx] !== undefined
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentIndex < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="bg-navy hover:bg-navy-dark text-white flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center gap-2"
            >
              {isSubmitting ? (
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
      </main>
    </div>
  );
}
