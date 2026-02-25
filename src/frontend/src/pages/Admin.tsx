import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import Navbar from '../components/Navbar';
import QuestionGallery from '../components/admin/QuestionGallery';
import TestBuilder from '../components/admin/TestBuilder';
import UserList from '../components/admin/UserList';
import ResultsList from '../components/admin/ResultsList';
import Leaderboard from '../components/admin/Leaderboard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Images, ClipboardList, Users, BarChart3, Trophy, ShieldAlert, Lock } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  // Redirect unauthenticated users to home
  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isInitializing, isAuthenticated, navigate]);

  // Show nothing while identity is initializing
  if (isInitializing) return null;

  // Not authenticated — redirect handled by useEffect, show nothing
  if (!isAuthenticated) return null;

  // Loading admin status
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // Authenticated but not admin — show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mx-auto mb-6">
              <ShieldAlert className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-navy mb-3">Access Denied</h2>
            <p className="text-gray-500 mb-2">
              This panel is reserved for the designated administrator only.
            </p>
            <p className="text-gray-400 text-sm mb-8 flex items-center justify-center gap-1">
              <Lock className="h-3.5 w-3.5" />
              Admin rights are granted to the first principal that logs in.
            </p>
            <button
              onClick={() => navigate({ to: '/dashboard' })}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark transition-colors text-sm"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin user — show full panel
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-navy">Admin Panel</h1>
          <p className="text-gray-500 mt-1">Manage questions, tests, users, results, and leaderboard.</p>
        </div>

        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="bg-white border border-gray-200 rounded-xl p-1 mb-8 flex flex-wrap gap-1 h-auto">
            <TabsTrigger
              value="questions"
              className="flex items-center gap-2 data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium"
            >
              <Images className="h-4 w-4" />
              <span className="hidden sm:inline">Question Gallery</span>
              <span className="sm:hidden">Questions</span>
            </TabsTrigger>
            <TabsTrigger
              value="tests"
              className="flex items-center gap-2 data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium"
            >
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Test Builder</span>
              <span className="sm:hidden">Tests</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center gap-2 data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium"
            >
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="flex items-center gap-2 data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium"
            >
              <BarChart3 className="h-4 w-4" />
              Results
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="flex items-center gap-2 data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium"
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <QuestionGallery />
          </TabsContent>
          <TabsContent value="tests">
            <TestBuilder />
          </TabsContent>
          <TabsContent value="users">
            <UserList />
          </TabsContent>
          <TabsContent value="results">
            <ResultsList />
          </TabsContent>
          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
