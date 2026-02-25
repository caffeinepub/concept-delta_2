import { useGetAllResultsWithUserNames } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3 } from 'lucide-react';

export default function ResultsList() {
  const { data: results, isLoading: resultsLoading } = useGetAllResultsWithUserNames();

  return (
    <Card className="border border-gray-100 rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-navy flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Test Results ({results?.length ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {resultsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
          </div>
        ) : results && results.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-bold text-navy">#</TableHead>
                  <TableHead className="font-bold text-navy">User</TableHead>
                  <TableHead className="font-bold text-navy">Test Name</TableHead>
                  <TableHead className="font-bold text-navy">Score</TableHead>
                  <TableHead className="font-bold text-navy">Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, idx) => (
                  <TableRow key={result.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="text-gray-400 text-sm">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-navy">
                      {result.userName}
                    </TableCell>
                    <TableCell className="font-medium text-navy">
                      {result.testName}
                    </TableCell>
                    <TableCell>
                      <span className="bg-navy/10 text-navy font-bold text-sm px-3 py-1 rounded-full">
                        {Number(result.score)}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(Number(result.submittedAt) / 1_000_000).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No test results yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
