import { useGetLeaderboard } from '../../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy, Medal } from 'lucide-react';

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 text-white font-extrabold text-sm shadow">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-gray-700 font-extrabold text-sm shadow">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white font-extrabold text-sm shadow">
        3
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-navy/10 text-navy font-bold text-sm">
      {rank}
    </span>
  );
}

export default function Leaderboard() {
  const { data: entries, isLoading } = useGetLeaderboard();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h2 className="text-xl font-bold text-navy">Student Leaderboard</h2>
        <span className="text-sm text-gray-400 ml-1">Sorted by average score</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : entries && entries.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-navy/5 hover:bg-navy/5">
                <TableHead className="text-navy font-bold w-16">Rank</TableHead>
                <TableHead className="text-navy font-bold">Student Name</TableHead>
                <TableHead className="text-navy font-bold text-center">Tests Taken</TableHead>
                <TableHead className="text-navy font-bold text-center">Avg Score (%)</TableHead>
                <TableHead className="text-navy font-bold text-center">Best Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, idx) => {
                const rank = idx + 1;
                return (
                  <TableRow
                    key={entry.principal.toString()}
                    className={rank <= 3 ? 'bg-yellow-50/30 hover:bg-yellow-50/50' : 'hover:bg-navy/2'}
                  >
                    <TableCell>
                      <RankBadge rank={rank} />
                    </TableCell>
                    <TableCell className="font-semibold text-navy">
                      {entry.fullName}
                    </TableCell>
                    <TableCell className="text-center text-gray-600">
                      {Number(entry.totalTests)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          Number(entry.averageScore) >= 75
                            ? 'bg-green-100 text-green-700'
                            : Number(entry.averageScore) >= 50
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {Number(entry.averageScore)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-navy">{Number(entry.bestScore)}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-navy/10 rounded-full flex items-center justify-center mb-6">
              <Medal className="h-10 w-10 text-navy/40" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">No Data Yet</h3>
            <p className="text-gray-400 max-w-sm">
              The leaderboard will populate once students start submitting tests.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
