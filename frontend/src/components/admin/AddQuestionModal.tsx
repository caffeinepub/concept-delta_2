import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Circle, PlusCircle, ImageIcon } from 'lucide-react';
import { useAddQuestion } from '../../hooks/useQueries';
import { toast } from 'sonner';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface AddQuestionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function ImagePreview({ url, alt }: { url: string; alt: string }) {
  if (!url.trim()) return null;
  return (
    <div className="mt-2 w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden min-h-[80px]">
      <img
        src={url}
        alt={alt}
        className="max-h-40 w-auto object-contain"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent && !parent.querySelector('.img-error-msg')) {
            const msg = document.createElement('p');
            msg.className = 'img-error-msg text-xs text-red-400 py-3 px-2 text-center';
            msg.textContent = 'Could not load image. Check the URL.';
            parent.appendChild(msg);
          }
        }}
      />
    </div>
  );
}

export default function AddQuestionModal({ open, onClose, onSuccess }: AddQuestionModalProps) {
  const [questionImageUrl, setQuestionImageUrl] = useState('');
  const [optionImageUrls, setOptionImageUrls] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addQuestion = useAddQuestion();

  const resetForm = () => {
    setQuestionImageUrl('');
    setOptionImageUrls(['', '', '', '']);
    setCorrectOption(0);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!questionImageUrl.trim()) newErrors.questionImageUrl = 'Question image URL is required';
    optionImageUrls.forEach((url, i) => {
      if (!url.trim()) newErrors[`option${i}`] = `Option ${OPTION_LABELS[i]} image URL is required`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormEmpty = !questionImageUrl.trim() || optionImageUrls.some((u) => !u.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addQuestion.mutateAsync({
        questionImageUrl: questionImageUrl.trim(),
        optionImageUrls: optionImageUrls.map((u) => u.trim()),
        correctOption: BigInt(correctOption),
      });
      toast.success('Question added successfully!');
      resetForm();
      onSuccess?.();
      onClose();
    } catch {
      toast.error('Failed to add question. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-2xl w-full bg-white rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        {/* Header */}
        <DialogHeader className="bg-navy px-6 py-5">
          <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-white/80" />
            Add New Question (Image-Based)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Question Image URL */}
          <div className="space-y-1.5">
            <Label className="text-navy font-semibold text-sm flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4" />
              Question Image URL
            </Label>
            <Input
              type="url"
              placeholder="https://example.com/question-image.png"
              value={questionImageUrl}
              onChange={(e) => {
                setQuestionImageUrl(e.target.value);
                if (errors.questionImageUrl) setErrors((prev) => { const n = { ...prev }; delete n.questionImageUrl; return n; });
              }}
              className="border-gray-200 focus:border-navy focus:ring-navy/20 rounded-xl text-sm"
            />
            {errors.questionImageUrl && (
              <p className="text-red-500 text-xs">{errors.questionImageUrl}</p>
            )}
            {/* Live preview */}
            <ImagePreview url={questionImageUrl} alt="Question preview" />
          </div>

          {/* Option Image URLs */}
          <div className="space-y-3">
            <Label className="text-navy font-semibold text-sm flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4" />
              Option Images
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {optionImageUrls.map((url, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {/* Correct option tick selector */}
                    <button
                      type="button"
                      onClick={() => setCorrectOption(idx)}
                      className="flex-shrink-0 focus:outline-none"
                      title={`Mark Option ${OPTION_LABELS[idx]} as correct`}
                    >
                      {correctOption === idx ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300 hover:text-gray-400 transition-colors" />
                      )}
                    </button>
                    <Label
                      className={`text-sm font-semibold ${
                        correctOption === idx ? 'text-green-600' : 'text-gray-600'
                      }`}
                    >
                      Option {OPTION_LABELS[idx]}
                      {correctOption === idx && (
                        <span className="ml-1 text-xs font-normal text-green-500">(correct)</span>
                      )}
                    </Label>
                  </div>
                  <Input
                    type="url"
                    placeholder={`https://example.com/option-${OPTION_LABELS[idx].toLowerCase()}.png`}
                    value={url}
                    onChange={(e) => {
                      const updated = [...optionImageUrls];
                      updated[idx] = e.target.value;
                      setOptionImageUrls(updated);
                      if (errors[`option${idx}`]) {
                        setErrors((prev) => { const n = { ...prev }; delete n[`option${idx}`]; return n; });
                      }
                    }}
                    className={`border-gray-200 focus:border-navy focus:ring-navy/20 rounded-xl text-sm ${
                      correctOption === idx ? 'border-green-300 bg-green-50/40' : ''
                    }`}
                  />
                  {errors[`option${idx}`] && (
                    <p className="text-red-500 text-xs">{errors[`option${idx}`]}</p>
                  )}
                  {/* Live preview for option */}
                  {url.trim() && (
                    <div className={`w-full flex items-center justify-center rounded-xl overflow-hidden min-h-[64px] border ${
                      correctOption === idx
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <img
                        src={url}
                        alt={`Option ${OPTION_LABELS[idx]} preview`}
                        className="max-h-32 w-auto object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Correct option summary */}
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-sm text-green-700 font-medium">
              Correct answer: Option {OPTION_LABELS[correctOption]}
            </span>
            <span className="text-xs text-green-500 ml-1">(click the circle icon to change)</span>
          </div>

          <DialogFooter className="flex gap-3 pt-1">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={addQuestion.isPending || isFormEmpty}
              className="flex-1 bg-navy hover:bg-navy-dark text-white font-semibold rounded-xl disabled:opacity-50"
            >
              {addQuestion.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Submit Question
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
