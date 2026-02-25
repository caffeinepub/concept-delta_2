import { useState } from 'react';
import { useGetAllQuestions, useCreateTest, useGetAllTests, useSetTestPublished } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, ClipboardList, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function TestBuilder() {
  const [testName, setTestName] = useState('');
  const [subject, setSubject] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: questions, isLoading: questionsLoading } = useGetAllQuestions();
  const { data: allTests, isLoading: testsLoading } = useGetAllTests();
  const createTest = useCreateTest();
  const setTestPublished = useSetTestPublished();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!testName.trim()) newErrors.testName = 'Test name is required';
    if (!durationMinutes || isNaN(Number(durationMinutes)) || Number(durationMinutes) <= 0) {
      newErrors.duration = 'Enter a valid duration in minutes';
    }
    if (selectedQuestions.size === 0) newErrors.questions = 'Select at least one question';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createTest.mutateAsync({
        name: testName.trim(),
        subject: subject.trim() || null,
        durationSeconds: BigInt(Math.round(Number(durationMinutes) * 60)),
        questionIds: Array.from(selectedQuestions),
      });
      toast.success('Test created successfully!');
      setTestName('');
      setSubject('');
      setDurationMinutes('');
      setSelectedQuestions(new Set());
      setErrors({});
    } catch {
      toast.error('Failed to create test. Please try again.');
    }
  };

  const toggleQuestion = (id: string) => {
    setSelectedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePublishToggle = async (testId: string, currentPublished: boolean) => {
    try {
      await setTestPublished.mutateAsync({ testId, published: !currentPublished });
      toast.success(`Test ${!currentPublished ? 'published' : 'unpublished'} successfully!`);
    } catch {
      toast.error('Failed to update test status.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Test Form */}
      <Card className="border border-gray-100 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-navy flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Create New Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTest} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-navy font-medium">Test Name</Label>
                <Input
                  type="text"
                  placeholder="e.g. Physics Mock Test 1"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="border-gray-200"
                />
                {errors.testName && <p className="text-red-500 text-xs">{errors.testName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-navy font-medium">Duration (minutes)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 30"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  min="1"
                  className="border-gray-200"
                />
                {errors.duration && <p className="text-red-500 text-xs">{errors.duration}</p>}
              </div>
            </div>

            {/* Subject / Label (optional) */}
            <div className="space-y-1.5">
              <Label className="text-navy font-medium flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                Subject / Label
                <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. Physics, Chemistry, Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border-gray-200"
              />
            </div>

            {/* Question Selection */}
            <div className="space-y-2">
              <Label className="text-navy font-medium">
                Select Questions ({selectedQuestions.size} selected)
              </Label>
              {errors.questions && <p className="text-red-500 text-xs">{errors.questions}</p>}

              {questionsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
              ) : questions && questions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {questions.map((q, idx) => (
                    <label
                      key={q.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedQuestions.has(q.id)
                          ? 'border-navy bg-navy/5'
                          : 'border-gray-200 hover:border-navy/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedQuestions.has(q.id)}
                        onChange={() => toggleQuestion(q.id)}
                        className="accent-navy w-4 h-4 shrink-0"
                      />
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-navy/10 text-navy text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {/* Question thumbnail */}
                        <div className="shrink-0 w-14 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <img
                            src={q.questionImageData}
                            alt={`Q${idx + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement;
                              el.style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-navy truncate">
                          Question {idx + 1}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm py-4 text-center">
                  No questions available. Add questions in the Question Gallery first.
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={createTest.isPending}
              className="bg-navy hover:bg-navy-dark text-white font-semibold px-6 py-2 rounded-xl"
            >
              {createTest.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create Test
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* All Tests List */}
      <div>
        <h3 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          All Tests ({allTests?.length ?? 0})
        </h3>

        {testsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : allTests && allTests.length > 0 ? (
          <div className="space-y-3">
            {allTests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-navy">{test.name}</p>
                    {test.subject && (
                      <span className="text-xs bg-navy/10 text-navy px-2 py-0.5 rounded-full font-medium">
                        {test.subject}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {Math.round(Number(test.durationSeconds) / 60)} min · {test.questionIds.length} questions
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    test.isPublished 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-gray-500 bg-gray-100'
                  }`}>
                    {test.isPublished ? 'Published' : 'Unpublished'}
                  </span>
                  <Switch
                    checked={test.isPublished}
                    onCheckedChange={() => handlePublishToggle(test.id, test.isPublished)}
                    className="data-[state=checked]:bg-navy"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No tests yet. Create a test and it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
