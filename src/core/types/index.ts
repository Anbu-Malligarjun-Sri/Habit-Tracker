/**
 * Application Types
 * 
 * Central type definitions for the entire application.
 */

import type { 
  ResourceType as PrismaResourceType, 
  FrequencyType as PrismaFrequencyType, 
  TargetType as PrismaTargetType, 
  AchievementTier as PrismaAchievementTier 
} from '@prisma/client';

// Re-export Prisma enums
export type ResourceType = PrismaResourceType;
export type FrequencyType = PrismaFrequencyType;
export type TargetType = PrismaTargetType;
export type AchievementTier = PrismaAchievementTier;

// ============ Habit Types ============

/**
 * Legacy Habit type for backward compatibility with local storage
 * @deprecated Use Habit from Prisma instead
 */
export interface LegacyHabit {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  frequency: string;
  difficulty: number;
  isActive: boolean;
}

export interface Habit {
  id: string;
  userId: string;
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
  reminderEnabled: boolean;
  reminderTimes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitWithStatus extends Habit {
  isCompletedToday: boolean;
  currentStreak: number;
  todayValue?: number | null;
}

// ============ Form Input Types ============

export interface CreateHabitInput {
  name: string;
  description?: string;
  category: string;
  icon?: string;
  color?: string;
  frequencyType?: FrequencyType;
  frequencyDays?: number[];
  frequencyCount?: number;
  targetType?: TargetType;
  targetValue?: number;
  targetUnit?: string;
  difficulty?: number;
  reminderEnabled?: boolean;
  reminderTimes?: string[];
}

export interface UpdateHabitInput extends Partial<CreateHabitInput> {}

// ============ Gamification Types ============

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

// ============ User Types ============

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  xp: number;
  currentStreak: number;
  longestStreak: number;
}
