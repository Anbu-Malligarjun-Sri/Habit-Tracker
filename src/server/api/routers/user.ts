/**
 * User Router
 * 
 * Handles all user-related API endpoints:
 * - Profile management
 * - User settings
 * - User statistics
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
});

const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  weekStartsOn: z.number().min(0).max(6).optional(),
  defaultHabitView: z.enum(['grid', 'list', 'calendar']).optional(),
  showCompletedHabits: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
  hapticEnabled: z.boolean().optional(),
});

const updateNotificationSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  reminderNotifications: z.boolean().optional(),
  achievementNotifications: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  dailyReminder: z.boolean().optional(),
  dailyReminderTime: z.string().optional(),
});

export const userRouter = createTRPCRouter({
  /**
   * Get current user's profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.userId },
      include: {
        resources: true,
        _count: {
          select: {
            habits: true,
            achievements: true,
            journalEntries: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return user;
  }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      // Check username availability if being updated
      if (input.username) {
        const existing = await ctx.db.user.findFirst({
          where: {
            username: input.username,
            NOT: { clerkId: ctx.userId },
          },
        });

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Username is already taken',
          });
        }
      }

      const user = await ctx.db.user.update({
        where: { clerkId: ctx.userId },
        data: input,
      });

      return user;
    }),

  /**
   * Update user preferences
   */
  updatePreferences: protectedProcedure
    .input(updatePreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.userId },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const currentPrefs = (user.preferences as Record<string, unknown>) || {};
      const newPrefs = { ...currentPrefs, ...input };

      return ctx.db.user.update({
        where: { clerkId: ctx.userId },
        data: { preferences: newPrefs },
      });
    }),

  /**
   * Update notification settings
   */
  updateNotificationSettings: protectedProcedure
    .input(updateNotificationSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.userId },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const currentSettings = (user.notificationSettings as Record<string, unknown>) || {};
      const newSettings = { ...currentSettings, ...input };

      return ctx.db.user.update({
        where: { clerkId: ctx.userId },
        data: { notificationSettings: newSettings },
      });
    }),

  /**
   * Get user dashboard stats
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.userId },
    });

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    // Get today's date boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get habit stats
    const [totalHabits, completedToday, totalCompletions] = await Promise.all([
      ctx.db.habit.count({
        where: { userId: user.id, isArchived: false },
      }),
      ctx.db.habitCompletion.count({
        where: {
          userId: user.id,
          date: {
            gte: today,
            lt: tomorrow,
          },
          completed: true,
        },
      }),
      ctx.db.habitCompletion.count({
        where: {
          userId: user.id,
          completed: true,
        },
      }),
    ]);

    // Get achievement count
    const achievementCount = await ctx.db.userAchievement.count({
      where: { userId: user.id },
    });

    // Calculate level from XP
    const level = calculateLevel(user.xp);
    const { currentLevelXP, nextLevelXP, progressPercent } = calculateLevelProgress(user.xp);

    return {
      xp: user.xp,
      level,
      currentLevelXP,
      nextLevelXP,
      progressPercent,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalHabits,
      completedToday,
      totalCompletions,
      achievementCount,
    };
  }),

  /**
   * Sync user from Clerk (called after webhook or first auth)
   */
  syncFromClerk: publicProcedure
    .input(z.object({
      clerkId: z.string(),
      email: z.string().email(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      avatarUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findUnique({
        where: { clerkId: input.clerkId },
      });

      if (existingUser) {
        // Update existing user
        return ctx.db.user.update({
          where: { clerkId: input.clerkId },
          data: {
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            avatarUrl: input.avatarUrl,
            lastActiveAt: new Date(),
          },
        });
      }

      // Create new user
      const user = await ctx.db.user.create({
        data: {
          clerkId: input.clerkId,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          avatarUrl: input.avatarUrl,
          lastActiveAt: new Date(),
        },
      });

      // Initialize resources for new user
      await ctx.db.userResource.createMany({
        data: [
          { userId: user.id, resourceType: 'GOLD', amount: 0 },
          { userId: user.id, resourceType: 'ELIXIR', amount: 0 },
          { userId: user.id, resourceType: 'DARK_MATTER', amount: 0 },
          { userId: user.id, resourceType: 'GEMS', amount: 0 },
        ],
      });

      return user;
    }),

  /**
   * Delete user account
   */
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    // This will cascade delete all user data due to onDelete: Cascade in schema
    await ctx.db.user.delete({
      where: { clerkId: ctx.userId },
    });

    return { success: true };
  }),
});

// Helper functions

function calculateLevel(xp: number): number {
  // Level formula: Each level requires progressively more XP
  // Level 1: 0-99, Level 2: 100-299, Level 3: 300-599, etc.
  // Formula: level = floor(sqrt(xp / 50)) + 1
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

function calculateLevelProgress(xp: number): {
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
} {
  const level = calculateLevel(xp);
  
  // XP required for current level: 50 * (level - 1)^2
  const currentLevelXP = 50 * Math.pow(level - 1, 2);
  const nextLevelXP = 50 * Math.pow(level, 2);
  
  const xpInCurrentLevel = xp - currentLevelXP;
  const xpRequiredForNextLevel = nextLevelXP - currentLevelXP;
  
  const progressPercent = Math.min(
    100,
    Math.round((xpInCurrentLevel / xpRequiredForNextLevel) * 100)
  );

  return {
    currentLevelXP,
    nextLevelXP,
    progressPercent,
  };
}
