import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { type AnonymousProfile, type UserClass, type Question, type TestResult, type TestSummary, type LeaderboardEntry } from '../backend';

// ── Profile Queries ──────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString();

  const query = useQuery<AnonymousProfile | null>({
    queryKey: ['currentUserProfile', principalStr],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: AnonymousProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isProfileComplete'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin', principalStr],
    queryFn: async () => {
      if (!actor || !identity) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
    // Return false as placeholder while loading
    placeholderData: false,
  });
}

export function useClaimAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // claimAdmin: first caller becomes admin, same caller is a no-op, different caller throws
      await actor.claimAdmin();
    },
    onSuccess: () => {
      // Re-fetch admin status after claiming
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
    onError: () => {
      // If claim fails (another principal is already admin), still refresh admin status
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}

// ── Published Tests ──────────────────────────────────────────────────────────

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

// ── Test Questions ───────────────────────────────────────────────────────────

export function useGetTestQuestions(testId: string) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Question[]>({
    queryKey: ['testQuestions', testId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTestQuestions(testId);
    },
    enabled: !!actor && !actorFetching && !!identity && !!testId,
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
      queryClient.invalidateQueries({ queryKey: ['allResults'] });
      queryClient.invalidateQueries({ queryKey: ['myResults'] });
    },
  });
}

// ── My Results ───────────────────────────────────────────────────────────────

export function useGetMyResults() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString();

  return useQuery<TestResult[]>({
    queryKey: ['myResults', principalStr],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyResults();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// ── Admin Queries ────────────────────────────────────────────────────────────

export function useGetAllQuestions() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Question[]>({
    queryKey: ['allQuestions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuestions();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useAddQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionImageUrl,
      optionImageUrls,
      correctOption,
    }: {
      questionImageUrl: string;
      optionImageUrls: string[];
      correctOption: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addQuestion(questionImageUrl, optionImageUrls, correctOption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allQuestions'] });
    },
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
      await actor.setTestPublished(testId, published);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishedTests'] });
      queryClient.invalidateQueries({ queryKey: ['allTests'] });
      queryClient.invalidateQueries({ queryKey: ['adminAllTests'] });
    },
  });
}

export function useAdminGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<AnonymousProfile[]>({
    queryKey: ['adminAllUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllUsers();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetAllResults() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<TestResult[]>({
    queryKey: ['allResults'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllResults();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetLeaderboard() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getLeaderboard();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}
