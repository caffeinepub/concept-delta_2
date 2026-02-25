import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetPublishedTests, useGetMyResults } from '../hooks/useQueries';
import Navbar from '../components/Navbar';
import TestCard from '../components/TestCard';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Trophy, Target, TrendingUp } from 'lucide-react';

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
      <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center shrink-0">
        <Icon className="h-6 w-6 text-navy" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-16 mt-1" />
        ) : (
          <p className="text-2xl font-extrabold text-navy">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: tests, isLoading: testsLoading } = useGetPublishedTests();
  const { data: myResults, isLoading: resultsLoading } = useGetMyResults();

  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  // Compute stats client-side
  const statsLoading = resultsLoading;
  const testsAttempted = myResults?.length ?? 0;
  const averageScore =
    myResults && myResults.length > 0
      ? Math.round(
          myResults.reduce((sum, r) => {
            const total = Number(r.answers.length);
            return sum + (total > 0 ? (Number(r.score) / total) * 100 : 0);
          }, 0) / myResults.length
        )
      : null;
  const bestScore =
    myResults && myResults.length > 0
      ? Math.max(
          ...myResults.map((r) => {
            const total = Number(r.answers.length);
            return total > 0 ? Math.round((Number(r.score) / total) * 100) : 0;
          })
        )
      : null;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {showProfileSetup && (
        <ProfileSetupModal onComplete={() => {}} />
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-navy">
            {userProfile ? `Welcome, ${userProfile.fullName.split(' ')[0]}! 👋` : 'Dashboard'}
          </h1>
          <p className="text-gray-500 mt-1">
            Choose a test below and start practicing for MHT-CET.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            label="Tests Attempted"
            value={statsLoading ? '—' : String(testsAttempted)}
            icon={Target}
            loading={statsLoading}
          />
          <StatCard
            label="Average Score"
            value={statsLoading ? '—' : averageScore !== null ? `${averageScore}%` : '—'}
            icon={TrendingUp}
            loading={statsLoading}
          />
          <StatCard
            label="Best Score"
            value={statsLoading ? '—' : bestScore !== null ? `${bestScore}%` : '—'}
            icon={Trophy}
            loading={statsLoading}
          />
        </div>

        {/* Tests Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-navy mb-4">Available Tests</h2>
        </div>

        {testsLoading || profileLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <Skeleton className="h-10 w-32" />
              </div>
            ))}
          </div>
        ) : tests && tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-navy/10 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="h-10 w-10 text-navy/40" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">No Tests Available Yet</h3>
            <p className="text-gray-400 max-w-sm">
              Our team is preparing amazing mock tests for you. Check back soon!
            </p>
          </div>
        )}
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
