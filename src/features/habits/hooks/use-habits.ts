/**
 * Habits Hook (tRPC)
 * 
 * Custom hook for habit operations using tRPC.
 */

'use client';

import { api } from '@/lib/trpc';
import { useHabitStore } from '@/stores';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { CreateHabitInput, UpdateHabitInput } from '@/types';

/**
 * Hook for fetching and managing habits
 */
export function useHabits(category?: string) {
  const setHabits = useHabitStore((state) => state.setHabits);
  const setLoading = useHabitStore((state) => state.setLoading);
  const setError = useHabitStore((state) => state.setError);
  const storeHabits = useHabitStore((state) => state.habits);

  const { data, isLoading, error, refetch } = api.habits.getAll.useQuery(
    { category },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
    }
  );

  // Sync with Zustand store
  useEffect(() => {
    if (data) {
      setHabits(data.map(h => ({
        ...h,
        frequencyDays: h.frequencyDays as number[],
        reminderTimes: h.reminderTimes as string[],
      })));
    }
  }, [data, setHabits]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (error) {
      setError(error.message);
    }
  }, [error, setError]);

  return {
    habits: storeHabits,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for habit mutations (create, update, delete, toggle)
 */
export function useHabitMutations() {
  const utils = api.useUtils();
  const toggleCompletionOptimistic = useHabitStore((state) => state.toggleCompletion);

  // Create habit mutation
  const createMutation = api.habits.create.useMutation({
    onSuccess: () => {
      utils.habits.getAll.invalidate();
      toast.success('Habit created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create habit', {
        description: error.message,
      });
    },
  });

  // Update habit mutation
  const updateMutation = api.habits.update.useMutation({
    onSuccess: () => {
      utils.habits.getAll.invalidate();
      toast.success('Habit updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update habit', {
        description: error.message,
      });
    },
  });

  // Toggle completion mutation with optimistic updates
  const toggleMutation = api.habits.toggleCompletion.useMutation({
    onMutate: async ({ habitId }) => {
      // Optimistic update in Zustand
      toggleCompletionOptimistic(habitId);
    },
    onSuccess: (result) => {
      utils.habits.getAll.invalidate();
      if (result.completed) {
        toast.success(result.message, {
          icon: '🎉',
        });
      }
    },
    onError: (error, { habitId }) => {
      // Revert optimistic update
      toggleCompletionOptimistic(habitId);
      toast.error('Failed to update habit', {
        description: error.message,
      });
    },
  });

  // Delete habit mutation
  const deleteMutation = api.habits.delete.useMutation({
    onSuccess: () => {
      utils.habits.getAll.invalidate();
      toast.success('Habit deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete habit', {
        description: error.message,
      });
    },
  });

  // Archive habit mutation
  const archiveMutation = api.habits.archive.useMutation({
    onSuccess: () => {
      utils.habits.getAll.invalidate();
      toast.success('Habit archived');
    },
    onError: (error) => {
      toast.error('Failed to archive habit', {
        description: error.message,
      });
    },
  });

  // Pin toggle mutation
  const pinMutation = api.habits.togglePin.useMutation({
    onSuccess: (result) => {
      utils.habits.getAll.invalidate();
      toast.success(result.isPinned ? 'Habit pinned' : 'Habit unpinned');
    },
    onError: (error) => {
      toast.error('Failed to update habit', {
        description: error.message,
      });
    },
  });

  // Reorder mutation
  const reorderMutation = api.habits.reorder.useMutation({
    onError: (error) => {
      toast.error('Failed to reorder habits', {
        description: error.message,
      });
    },
  });

  return {
    createHabit: useCallback(
      (data: CreateHabitInput) => createMutation.mutateAsync(data),
      [createMutation]
    ),
    updateHabit: useCallback(
      (id: string, data: UpdateHabitInput) =>
        updateMutation.mutateAsync({ id, data }),
      [updateMutation]
    ),
    toggleCompletion: useCallback(
      (habitId: string, date?: Date, value?: number) =>
        toggleMutation.mutate({ habitId, date, value }),
      [toggleMutation]
    ),
    deleteHabit: useCallback(
      (id: string) => deleteMutation.mutateAsync({ id }),
      [deleteMutation]
    ),
    archiveHabit: useCallback(
      (id: string) => archiveMutation.mutateAsync({ id }),
      [archiveMutation]
    ),
    togglePin: useCallback(
      (id: string) => pinMutation.mutateAsync({ id }),
      [pinMutation]
    ),
    reorderHabits: useCallback(
      (habitIds: string[]) => reorderMutation.mutateAsync({ habitIds }),
      [reorderMutation]
    ),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isToggling: toggleMutation.isPending,
    isDeleting: deleteMutation.isPending,
    togglingHabitId: toggleMutation.variables?.habitId,
  };
}

/**
 * Hook for habit statistics
 */
export function useHabitStats(habitId?: string, period?: 'week' | 'month' | 'year' | 'all') {
  return api.habits.getStats.useQuery(
    { habitId, period: period || 'month' },
    {
      staleTime: 1000 * 60 * 10, // 10 minutes
    }
  );
}

/**
 * Hook for habit completion history (calendar view)
 */
export function useHabitHistory(
  habitId?: string,
  startDate?: Date,
  endDate?: Date
) {
  return api.habits.getCompletionHistory.useQuery(
    {
      habitId,
      startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate || new Date(),
    },
    {
      staleTime: 1000 * 60 * 5,
      enabled: !!startDate && !!endDate,
    }
  );
}

/**
 * Hook for a single habit with details
 */
export function useHabit(habitId: string) {
  return api.habits.getById.useQuery(
    { id: habitId },
    {
      enabled: !!habitId,
      staleTime: 1000 * 60 * 5,
    }
  );
}
