import { useState } from 'react';
import { useGetAllQuestions } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, CheckCircle, ImageOff } from 'lucide-react';
import AddQuestionModal from './AddQuestionModal';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

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
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : questions && questions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {questions.map((q, idx) => (
            <Card key={q.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
              <CardContent className="space-y-2 px-4 pb-4">
                {/* Question image */}
                <div className="w-full h-24 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={q.questionImageUrl}
                    alt={`Question ${idx + 1}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-gray-300 text-xs flex flex-col items-center gap-1"><svg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\'><rect width=\'18\' height=\'18\' x=\'3\' y=\'3\' rx=\'2\' ry=\'2\'/><circle cx=\'9\' cy=\'9\' r=\'2\'/><path d=\'m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\'/></svg>No image</span>';
                      }
                    }}
                  />
                </div>

                {/* Option images grid */}
                <div className="grid grid-cols-2 gap-1.5">
                  {q.optionImageUrls.map((url, oi) => (
                    <div
                      key={oi}
                      className={`relative rounded-lg overflow-hidden border ${
                        Number(q.correctOption) === oi
                          ? 'border-green-400 ring-1 ring-green-300'
                          : 'border-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 z-10 text-xs font-bold px-1.5 py-0.5 rounded ${
                          Number(q.correctOption) === oi
                            ? 'bg-green-500 text-white'
                            : 'bg-white/90 text-gray-600'
                        }`}
                      >
                        {OPTION_LABELS[oi]}
                      </span>
                      <div className="w-full h-14 bg-gray-50 flex items-center justify-center">
                        <img
                          src={url}
                          alt={`Option ${OPTION_LABELS[oi]}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 flex flex-col items-center gap-3">
          <ImageOff className="h-10 w-10 text-gray-200" />
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
