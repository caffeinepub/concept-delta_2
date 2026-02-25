import { useNavigate } from '@tanstack/react-router';
import { type TestSummary } from '../backend';
import { Clock, PlayCircle, BookOpen, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TestCardProps {
  test: TestSummary;
}

function formatDuration(seconds: bigint): string {
  const mins = Number(seconds) / 60;
  if (mins < 60) return `${Math.round(mins)} min`;
  const hrs = Math.floor(mins / 60);
  const rem = Math.round(mins % 60);
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export default function TestCard({ test }: TestCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-navy/20 bg-white rounded-2xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-navy font-bold text-lg leading-tight group-hover:text-navy-dark transition-colors">
            {test.name}
          </CardTitle>
          <span className="shrink-0 inline-flex items-center gap-1 bg-navy/10 text-navy text-xs font-semibold px-2.5 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            {formatDuration(test.durationSeconds)}
          </span>
        </div>
        {/* Subject badge */}
        {test.subject && (
          <div className="mt-1">
            <Badge variant="secondary" className="text-xs bg-navy/5 text-navy border-navy/10">
              {test.subject}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <span className="flex items-center gap-1">
              <Hash className="h-3.5 w-3.5" />
              {Number(test.questionCount)} questions
            </span>
          </div>
          <Button
            onClick={() => navigate({ to: '/test/$testId', params: { testId: test.id } })}
            className="bg-navy hover:bg-navy-dark text-white font-semibold px-5 py-2 rounded-xl transition-all flex items-center gap-2"
            size="sm"
          >
            <PlayCircle className="h-4 w-4" />
            Start Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
