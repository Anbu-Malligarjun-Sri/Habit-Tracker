/**
 * User Store
 * 
 * Global state management for user data and gamification.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ResourceType } from '@prisma/client';

// Types
export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
}

export interface LevelProgress {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  xpInLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
}

export interface RankInfo {
  id: string;
  name: string;
  minXP: number;
  color: string;
  icon: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  weekStartsOn: number;
  defaultHabitView: 'grid' | 'list' | 'calendar';
  showCompletedHabits: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

interface UserStore {
  // State
  user: UserProfile | null;
  levelProgress: LevelProgress | null;
  currentRank: RankInfo | null;
  nextRank: (RankInfo & { xpRequired: number; progress: number }) | null;
  resources: Record<ResourceType, number>;
  preferences: UserPreferences;
  isLoading: boolean;

  // Actions
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  clearUser: () => void;
  addXP: (amount: number) => void;
  updateStreak: (current: number, longest: number) => void;
  setLevelProgress: (progress: LevelProgress) => void;
  setRankInfo: (current: RankInfo, next: (RankInfo & { xpRequired: number; progress: number }) | null) => void;
  setResources: (resources: Record<ResourceType, number>) => void;
  updateResource: (type: ResourceType, amount: number) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  setLoading: (loading: boolean) => void;

  // Computed
  getDisplayName: () => string;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  weekStartsOn: 0,
  defaultHabitView: 'grid',
  showCompletedHabits: true,
  soundEnabled: true,
  hapticEnabled: true,
};

const defaultResources: Record<ResourceType, number> = {
  GOLD: 0,
  ELIXIR: 0,
  DARK_MATTER: 0,
  GEMS: 0,
};

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        levelProgress: null,
        currentRank: null,
        nextRank: null,
        resources: defaultResources,
        preferences: defaultPreferences,
        isLoading: false,

        // Actions
        setUser: (user) =>
          set((state) => {
            state.user = user;
            state.isLoading = false;
          }),

        updateUser: (updates) =>
          set((state) => {
            if (state.user) {
              Object.assign(state.user, updates);
            }
          }),

        clearUser: () =>
          set((state) => {
            state.user = null;
            state.levelProgress = null;
            state.currentRank = null;
            state.nextRank = null;
            state.resources = defaultResources;
          }),

        addXP: (amount) =>
          set((state) => {
            if (state.user) {
              state.user.xp += amount;
              // Recalculate level
              state.user.level = Math.floor(Math.sqrt(state.user.xp / 50)) + 1;
            }
          }),

        updateStreak: (current, longest) =>
          set((state) => {
            if (state.user) {
              state.user.currentStreak = current;
              state.user.longestStreak = longest;
            }
          }),

        setLevelProgress: (progress) =>
          set((state) => {
            state.levelProgress = progress;
          }),

        setRankInfo: (current, next) =>
          set((state) => {
            state.currentRank = current;
            state.nextRank = next;
          }),

        setResources: (resources) =>
          set((state) => {
            state.resources = resources;
          }),

        updateResource: (type, amount) =>
          set((state) => {
            state.resources[type] = amount;
          }),

        setPreferences: (prefs) =>
          set((state) => {
            Object.assign(state.preferences, prefs);
          }),

        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),

        // Computed
        getDisplayName: () => {
          const { user } = get();
          if (!user) return 'User';
          return user.firstName || user.username || user.email.split('@')[0];
        },
      })),
      {
        name: 'user-store',
        partialize: (state) => ({
          preferences: state.preferences,
        }),
      }
    ),
    { name: 'UserStore' }
  )
);
