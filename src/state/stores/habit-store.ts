/**
 * Habit Store
 * 
 * Global state management for habits using Zustand.
 * Provides optimistic updates and syncs with tRPC.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { FrequencyType, TargetType } from '@prisma/client';

// Types
export interface Habit {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  icon: string;
  color: string;
  frequencyType: FrequencyType;
  frequencyDays: number[];
  frequencyCount?: number | null;
  targetType: TargetType;
  targetValue?: number | null;
  targetUnit?: string | null;
  difficulty: number;
  xpReward: number;
  isArchived: boolean;
  isPinned: boolean;
  orderIndex: number;
  currentStreak: number;
  isCompletedToday: boolean;
  createdAt: Date;
}

export interface HabitFilter {
  category?: string;
  showArchived: boolean;
  showCompleted: boolean;
  searchQuery: string;
}

interface HabitStore {
  // State
  habits: Habit[];
  filter: HabitFilter;
  isLoading: boolean;
  error: string | null;
  selectedDate: Date;
  viewMode: 'grid' | 'list' | 'calendar';

  // Actions
  setHabits: (habits: Habit[]) => void;
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  removeHabit: (id: string) => void;
  toggleCompletion: (id: string) => void;
  setFilter: (filter: Partial<HabitFilter>) => void;
  clearFilter: () => void;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: 'grid' | 'list' | 'calendar') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reorderHabits: (fromIndex: number, toIndex: number) => void;

  // Computed
  getFilteredHabits: () => Habit[];
  getHabitsByCategory: () => Record<string, Habit[]>;
  getTodayProgress: () => { completed: number; total: number; percentage: number };
}

const defaultFilter: HabitFilter = {
  showArchived: false,
  showCompleted: true,
  searchQuery: '',
};

export const useHabitStore = create<HabitStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        habits: [],
        filter: defaultFilter,
        isLoading: false,
        error: null,
        selectedDate: new Date(),
        viewMode: 'grid',

        // Actions
        setHabits: (habits) =>
          set((state) => {
            state.habits = habits;
            state.isLoading = false;
            state.error = null;
          }),

        addHabit: (habit) =>
          set((state) => {
            state.habits.push(habit);
          }),

        updateHabit: (id, updates) =>
          set((state) => {
            const index = state.habits.findIndex((h) => h.id === id);
            if (index !== -1) {
              Object.assign(state.habits[index], updates);
            }
          }),

        removeHabit: (id) =>
          set((state) => {
            state.habits = state.habits.filter((h) => h.id !== id);
          }),

        toggleCompletion: (id) =>
          set((state) => {
            const habit = state.habits.find((h) => h.id === id);
            if (habit) {
              habit.isCompletedToday = !habit.isCompletedToday;
              if (habit.isCompletedToday) {
                habit.currentStreak += 1;
              } else {
                habit.currentStreak = Math.max(0, habit.currentStreak - 1);
              }
            }
          }),

        setFilter: (filter) =>
          set((state) => {
            Object.assign(state.filter, filter);
          }),

        clearFilter: () =>
          set((state) => {
            state.filter = defaultFilter;
          }),

        setSelectedDate: (date) =>
          set((state) => {
            state.selectedDate = date;
          }),

        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode;
          }),

        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
          }),

        reorderHabits: (fromIndex, toIndex) =>
          set((state) => {
            const [removed] = state.habits.splice(fromIndex, 1);
            state.habits.splice(toIndex, 0, removed);
            // Update order indices
            state.habits.forEach((habit, index) => {
              habit.orderIndex = index;
            });
          }),

        // Computed values
        getFilteredHabits: () => {
          const { habits, filter } = get();
          let filtered = [...habits];

          // Filter by archived status
          if (!filter.showArchived) {
            filtered = filtered.filter((h) => !h.isArchived);
          }

          // Filter by completion status
          if (!filter.showCompleted) {
            filtered = filtered.filter((h) => !h.isCompletedToday);
          }

          // Filter by category
          if (filter.category) {
            filtered = filtered.filter((h) => h.category === filter.category);
          }

          // Filter by search query
          if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase();
            filtered = filtered.filter(
              (h) =>
                h.name.toLowerCase().includes(query) ||
                h.description?.toLowerCase().includes(query) ||
                h.category.toLowerCase().includes(query)
            );
          }

          // Sort: pinned first, then by order index
          return filtered.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return a.orderIndex - b.orderIndex;
          });
        },

        getHabitsByCategory: () => {
          const filtered = get().getFilteredHabits();
          return filtered.reduce((acc, habit) => {
            if (!acc[habit.category]) {
              acc[habit.category] = [];
            }
            acc[habit.category].push(habit);
            return acc;
          }, {} as Record<string, Habit[]>);
        },

        getTodayProgress: () => {
          const habits = get().habits.filter((h) => !h.isArchived);
          const completed = habits.filter((h) => h.isCompletedToday).length;
          const total = habits.length;
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
          return { completed, total, percentage };
        },
      })),
      {
        name: 'habit-store',
        partialize: (state) => ({
          filter: state.filter,
          viewMode: state.viewMode,
        }),
      }
    ),
    { name: 'HabitStore' }
  )
);
