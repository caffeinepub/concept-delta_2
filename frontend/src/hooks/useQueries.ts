import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { AnonymousProfile, TestSummary, Question, TestResult, LeaderboardEntry } from '../backend';

// ─── Admin ───────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalStr = identity ? identity.getPrincipal().toString() : null;
  const isAnonymous = !principalStr || principalStr === '2vxsx-fae';

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin', principalStr],
    queryFn: async () => {
      if (!actor) return false;
      try {
        const result = await actor.isCallerAdmin();
        console.log('[useIsCallerAdmin] result:', result, 'principal:', principalStr);
        return result;
      } catch (e) {
        console.error('[useIsCallerAdmin] error:', e);
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !isAnonymous,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}

export function useGetAllQuestions() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ['allQuestions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuestions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      questionImageData,
      optionImageData,
      correctOption,
    }: {
      questionImageData: string;
      optionImageData: string[];
      correctOption: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addQuestion(questionImageData, optionImageData, correctOption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allQuestions'] });
    },
  });
}

export function useGetAllTests() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<TestSummary[]>({
    queryKey: ['allTests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublishedTests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      subject,
      durationSeconds,
      questionIds,
    }: {
      name: string;
      subject: string | null;
      durationSeconds: bigint;
      questionIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTest(name, subject, durationSeconds, questionIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTests'] });
      queryClient.invalidateQueries({ queryKey: ['publishedTests'] });
    },
  });
}

export function useSetTestPublished() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ testId, published }: { testId: string; published: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setTestPublished(testId, published);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTests'] });
      queryClient.invalidateQueries({ queryKey: ['publishedTests'] });
    },
  });
}

export function useGetPublishedTests() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<TestSummary[]>({
    queryKey: ['publishedTests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublishedTests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetTestQuestions(testId: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ['testQuestions', testId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTestQuestions(testId);
    },
    enabled: !!actor && !actorFetching && !!testId,
  });
}

export function useSubmitTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ testId, answers }: { testId: string; answers: bigint[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitTest(testId, answers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResults'] });
    },
  });
}

export function useGetMyResults() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<TestResult[]>({
    queryKey: ['myResults'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyResults();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetAllResults() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<TestResult[]>({
    queryKey: ['allResults'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllResults();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<AnonymousProfile[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<AnonymousProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: AnonymousProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetLeaderboard() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetMyDashboardStats() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ['myDashboardStats'],
    queryFn: async () => {
      if (!actor) return { testsAttempted: 0, averageScore: 0, bestScore: 0 };
      const results = await actor.getMyResults();
      if (results.length === 0) return { testsAttempted: 0, averageScore: 0, bestScore: 0 };
      const scores = results.map((r) => Number(r.score));
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const best = Math.max(...scores);
      return { testsAttempted: results.length, averageScore: Math.round(avg), bestScore: best };
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}
