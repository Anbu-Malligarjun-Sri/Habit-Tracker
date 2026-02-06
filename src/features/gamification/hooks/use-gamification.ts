/**
 * Gamification Hook
 * 
 * Custom hook for gamification features using tRPC.
 */

'use client';

import { api } from '@/lib/trpc';
import { useUserStore } from '@/stores';
import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook for gamification status (XP, level, rank, resources)
 */
export function useGamificationStatus() {
  const setLevelProgress = useUserStore((state) => state.setLevelProgress);
  const setRankInfo = useUserStore((state) => state.setRankInfo);
  const setResources = useUserStore((state) => state.setResources);

  const { data, isLoading, error, refetch } = api.gamification.getStatus.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  // Sync with Zustand store
  useEffect(() => {
    if (data) {
      setLevelProgress(data.levelProgress);
      if (data.currentRank) {
        setRankInfo(
          data.currentRank,
          data.nextRank
        );
      }
      setResources(data.resources);
    }
  }, [data, setLevelProgress, setRankInfo, setResources]);

  return {
    status: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for achievements
 */
export function useAchievements() {
  return api.gamification.getAchievements.useQuery(undefined, {
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook for unlocked achievements
 */
export function useUnlockedAchievements() {
  return api.gamification.getUnlockedAchievements.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook for ranks
 */
export function useRanks() {
  return api.gamification.getRanks.useQuery(undefined, {
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Hook for resources
 */
export function useResources() {
  const setResources = useUserStore((state) => state.setResources);

  const { data, isLoading, error, refetch } = api.gamification.getResources.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (data) {
      setResources(data);
    }
  }, [data, setResources]);

  return {
    resources: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for gamification mutations
 */
export function useGamificationMutations() {
  const utils = api.useUtils();

  // Repair streak mutation
  const repairStreakMutation = api.gamification.repairStreak.useMutation({
    onSuccess: (result) => {
      utils.gamification.getStatus.invalidate();
      utils.gamification.getResources.invalidate();
      utils.habits.getAll.invalidate();
      toast.success(result.message, {
        icon: '🔧',
        description: `Used ${result.amountSpent} ${result.resourceUsed}`,
      });
    },
    onError: (error) => {
      toast.error('Failed to repair streak', {
        description: error.message,
      });
    },
  });

  // Claim daily bonus mutation
  const claimBonusMutation = api.gamification.claimDailyBonus.useMutation({
    onSuccess: (result) => {
      utils.gamification.getStatus.invalidate();
      utils.gamification.getResources.invalidate();
      toast.success(result.message, {
        icon: '🎁',
        description: `Streak multiplier: x${result.streakMultiplier}`,
      });
    },
    onError: (error) => {
      toast.error('Failed to claim bonus', {
        description: error.message,
      });
    },
  });

  // Add resource mutation (for testing/rewards)
  const addResourceMutation = api.gamification.addResource.useMutation({
    onSuccess: () => {
      utils.gamification.getResources.invalidate();
    },
  });

  return {
    repairStreak: useCallback(
      (daysAgo: number) => repairStreakMutation.mutateAsync({ daysAgo }),
      [repairStreakMutation]
    ),
    claimDailyBonus: useCallback(
      () => claimBonusMutation.mutateAsync(),
      [claimBonusMutation]
    ),
    addResource: useCallback(
      (resourceType: 'GOLD' | 'ELIXIR' | 'DARK_MATTER' | 'GEMS', amount: number) =>
        addResourceMutation.mutateAsync({ resourceType, amount }),
      [addResourceMutation]
    ),
    isRepairing: repairStreakMutation.isPending,
    isClaiming: claimBonusMutation.isPending,
  };
}

/**
 * Hook for activity log
 */
export function useActivityLog(limit = 20) {
  return api.gamification.getActivityLog.useInfiniteQuery(
    { limit },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 1000 * 60 * 5,
    }
  );
}

/**
 * Hook for leaderboard
 */
export function useLeaderboard(type: 'xp' | 'streak' | 'completions' = 'xp') {
  return api.gamification.getLeaderboard.useQuery(
    { type },
    {
      staleTime: 1000 * 60 * 10,
    }
  );
}
