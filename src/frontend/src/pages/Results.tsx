import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetMyResults, useGetPublishedTests } from '../hooks/useQueries';
import Navbar from '../components/Navbar';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClipboardList, Trophy } from 'lucide-react';

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Results() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: myResults, isLoading: resultsLoading } = useGetMyResults();
  const { data: publishedTests } = useGetPublishedTests();

  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  // Build a map of testId -> testName for display
  const testNameMap: Record<string, string> = {};
  if (publishedTests) {
    publishedTests.forEach((t) => {
      testNameMap[t.id] = t.name;
    });
  }

  const isLoading = resultsLoading || profileLoading;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {showProfileSetup && <ProfileSetupModal onComplete={() => {}} />}

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-navy flex items-center gap-3">
            <ClipboardList className="h-8 w-8" />
            My Results
          </h1>
          <p className="text-gray-500 mt-1">
            View all your past test submissions and performance.
          </p>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : myResults && myResults.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-navy/5 hover:bg-navy/5">
                  <TableHead className="text-navy font-bold">#</TableHead>
                  <TableHead className="text-navy font-bold">Test Name</TableHead>
                  <TableHead className="text-navy font-bold text-center">Score</TableHead>
                  <TableHead className="text-navy font-bold text-center">Percentage</TableHead>
                  <TableHead className="text-navy font-bold text-right">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myResults.map((result, idx) => {
                  const total = Number(result.answers.length);
                  const score = Number(result.score);
                  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
                  const testName = testNameMap[result.testId] ?? result.testId;
                  return (
                    <TableRow key={result.id} className="hover:bg-navy/5">
                      <TableCell className="font-medium text-gray-500">{idx + 1}</TableCell>
                      <TableCell className="font-semibold text-navy">{testName}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-navy">{score}</span>
                        <span className="text-gray-400">/{total}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                            pct >= 80
                              ? 'bg-green-100 text-green-700'
                              : pct >= 50
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {pct >= 80 && <Trophy className="h-3 w-3" />}
                          {pct}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-gray-500 text-sm">
                        {formatDate(result.submittedAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-navy/10 rounded-full flex items-center justify-center mb-6">
                <ClipboardList className="h-10 w-10 text-navy/40" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">No Results Yet</h3>
              <p className="text-gray-400 max-w-sm">
                You haven't submitted any tests yet. Head to the dashboard to get started!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white/70 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs">© {new Date().getFullYear()} Concept Delta. All rights reserved.</p>
          <p className="text-xs">
            Built with <span className="text-red-400">♥</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'concept-delta')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-300 hover:text-sky-200"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
