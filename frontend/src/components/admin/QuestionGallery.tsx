import { useState } from 'react';
import { useGetAllQuestions } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, CheckCircle, FileQuestion } from 'lucide-react';
import AddQuestionModal from './AddQuestionModal';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface AdaptiveImageProps {
  src: string;
  alt: string;
  className?: string;
}

function AdaptiveImage({ src, alt, className }: AdaptiveImageProps) {
  if (!src) {
    return (
      <div className={`w-full flex items-center justify-center bg-gray-100 rounded-xl ${className ?? ''}`} style={{ minHeight: '80px' }}>
        <span className="text-xs text-gray-400">No image</span>
      </div>
    );
  }
  return (
    <div className={`w-full flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden ${className ?? ''}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-contain"
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          el.style.display = 'none';
          const parent = el.parentElement;
          if (parent && !parent.querySelector('.img-err')) {
            const msg = document.createElement('p');
            msg.className = 'img-err text-xs text-gray-400 py-2 text-center w-full';
            msg.textContent = 'Image unavailable';
            parent.appendChild(msg);
          }
        }}
      />
    </div>
  );
}

export default function QuestionGallery() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: questions, isLoading, refetch } = useGetAllQuestions();

  const handleSuccess = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-navy">
          Question Gallery
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({questions?.length ?? 0} questions)
          </span>
        </h3>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-navy hover:bg-navy-dark text-white font-semibold px-5 py-2 rounded-xl flex items-center gap-2 shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Add Question Modal */}
      <AddQuestionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Gallery */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : questions && questions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {questions.map((q, idx) => (
            <Card
              key={q.id}
              className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy bg-navy/10 px-2.5 py-1 rounded-full">
                    Q{idx + 1}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 px-2.5 py-1 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Correct: {OPTION_LABELS[Number(q.correctOption)]}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                {/* Question image — adaptive height, no fixed max */}
                <div className="w-full border border-navy/10 rounded-xl overflow-hidden bg-navy/5">
                  <AdaptiveImage
                    src={q.questionImageData}
                    alt={`Question ${idx + 1}`}
                  />
                </div>

                {/* Options 2×2 grid — each cell adapts to its image */}
                <div className="grid grid-cols-2 gap-2">
                  {q.optionImageData.map((optData, oi) => {
                    const isCorrect = Number(q.correctOption) === oi;
                    return (
                      <div
                        key={oi}
                        className={`relative rounded-xl overflow-hidden border-2 ${
                          isCorrect
                            ? 'border-green-500 ring-1 ring-green-300'
                            : 'border-gray-200'
                        }`}
                      >
                        {/* Label badge */}
                        <span
                          className={`absolute top-1.5 left-1.5 z-10 text-xs font-bold px-1.5 py-0.5 rounded ${
                            isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-white/90 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {OPTION_LABELS[oi]}
                        </span>
                        <div
                          className={`w-full flex items-center justify-center pt-6 pb-1 px-1 ${
                            isCorrect ? 'bg-green-50' : 'bg-gray-50'
                          }`}
                          style={{ minHeight: '72px' }}
                        >
                          {optData ? (
                            <img
                              src={optData}
                              alt={`Option ${OPTION_LABELS[oi]}`}
                              className="w-full h-auto object-contain"
                              onError={(e) => {
                                const el = e.currentTarget as HTMLImageElement;
                                el.style.display = 'none';
                                const parent = el.parentElement;
                                if (parent && !parent.querySelector('.img-err')) {
                                  const msg = document.createElement('p');
                                  msg.className = 'img-err text-xs text-gray-400 py-2 text-center w-full';
                                  msg.textContent = 'N/A';
                                  parent.appendChild(msg);
                                }
                              }}
                            />
                          ) : (
                            <span className="text-xs text-gray-400 py-2">No image</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 flex flex-col items-center gap-3">
          <FileQuestion className="h-10 w-10 text-gray-200" />
          <p className="text-sm">No questions added yet.</p>
          <Button
            onClick={() => setModalOpen(true)}
            variant="outline"
            className="mt-1 border-navy/30 text-navy hover:bg-navy/5 rounded-xl"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add your first question
          </Button>
        </div>
      )}
    </div>
  );
}
