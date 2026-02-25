import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Circle, PlusCircle, ImageIcon, Upload, X } from 'lucide-react';
import { useAddQuestion } from '../../hooks/useQueries';
import { toast } from 'sonner';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface AddQuestionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface ImagePickerProps {
  label: string;
  previewSrc: string;
  onFileChange: (base64: string) => void;
  onClear: () => void;
  error?: string;
}

function ImagePicker({ label, previewSrc, onFileChange, onClear, error }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await readFileAsBase64(file);
    onFileChange(base64);
    e.target.value = '';
  };

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {previewSrc ? (
        <div
          className="relative w-full rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50"
        >
          <button
            type="button"
            onClick={onClear}
            className="absolute top-1.5 right-1.5 z-10 bg-white/90 hover:bg-white rounded-full p-0.5 shadow border border-gray-200 transition-colors"
            title="Remove image"
          >
            <X className="h-3.5 w-3.5 text-gray-500" />
          </button>
          <span className="absolute top-1.5 left-1.5 z-10 text-xs font-bold px-1.5 py-0.5 rounded bg-white/90 text-gray-700 border border-gray-200">
            {label}
          </span>
          <img
            src={previewSrc}
            alt={`${label} preview`}
            className="w-full object-contain cursor-pointer"
            style={{ maxHeight: '320px', minHeight: '120px' }}
            onClick={() => inputRef.current?.click()}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full text-xs text-gray-400 hover:text-navy py-1 text-center transition-colors"
          >
            Click to replace
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 px-4 transition-colors cursor-pointer ${
            error
              ? 'border-red-300 bg-red-50 hover:bg-red-50/80'
              : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
          }`}
          style={{ minHeight: '120px' }}
        >
          <Upload className={`h-6 w-6 ${error ? 'text-red-400' : 'text-gray-400'}`} />
          <span className={`text-sm font-medium ${error ? 'text-red-500' : 'text-gray-500'}`}>
            {label} — tap to upload from gallery
          </span>
        </button>
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

export default function AddQuestionModal({ open, onClose, onSuccess }: AddQuestionModalProps) {
  const [questionImageData, setQuestionImageData] = useState('');
  const [correctOption, setCorrectOption] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addQuestion = useAddQuestion();

  const resetForm = () => {
    setQuestionImageData('');
    setCorrectOption(0);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!questionImageData) newErrors.questionImageData = 'Question image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormEmpty = !questionImageData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addQuestion.mutateAsync({
        questionImageData,
        optionImageData: ['', '', '', ''],
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
      <DialogContent className="max-w-lg w-full bg-white rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        {/* Header */}
        <DialogHeader className="bg-navy px-6 py-5">
          <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-white/80" />
            Add New Question (Image-Based)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Question Image Upload */}
          <div className="space-y-1.5">
            <Label className="text-navy font-semibold text-sm flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4" />
              Question Image
            </Label>
            <p className="text-xs text-gray-500">Upload a single image containing the question and all options.</p>
            <ImagePicker
              label="Question"
              previewSrc={questionImageData}
              onFileChange={(base64) => {
                setQuestionImageData(base64);
                if (errors.questionImageData) setErrors((prev) => { const n = { ...prev }; delete n.questionImageData; return n; });
              }}
              onClear={() => setQuestionImageData('')}
              error={errors.questionImageData}
            />
          </div>

          {/* Correct Option Selector */}
          <div className="space-y-3">
            <Label className="text-navy font-semibold text-sm">
              Correct Answer
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {OPTION_LABELS.map((label, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCorrectOption(idx)}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 py-3 px-2 transition-all font-bold text-base ${
                    correctOption === idx
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {correctOption === idx ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span className="text-sm text-green-700 font-medium">
                Correct answer: Option {OPTION_LABELS[correctOption]}
              </span>
            </div>
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
