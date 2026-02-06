/**
 * Habits Router
 * 
 * Handles all habit-related API endpoints:
 * - CRUD operations
 * - Completion tracking
 * - Statistics and analytics
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { FrequencyType, TargetType } from '@prisma/client';
import { startOfDay, endOfDay, subDays, format, differenceInDays } from 'date-fns';

// Validation schemas
const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1),
  icon: z.string().default('📌'),
  color: z.string().default('#6366F1'),
  frequencyType: z.nativeEnum(FrequencyType).default(FrequencyType.DAILY),
  frequencyDays: z.array(z.number().min(0).max(6)).optional(),
  frequencyCount: z.number().min(1).optional(),
  targetType: z.nativeEnum(TargetType).default(TargetType.BOOLEAN),
  targetValue: z.number().optional(),
  targetUnit: z.string().optional(),
  difficulty: z.number().min(1).max(5).default(3),
  reminderEnabled: z.boolean().default(false),
  reminderTimes: z.array(z.string()).optional(),
});

const updateHabitSchema = createHabitSchema.partial();

const toggleCompletionSchema = z.object({
  habitId: z.string(),
  date: z.coerce.date().optional(),
  value: z.number().optional(),
  notes: z.string().optional(),
  qualityRating: z.number().min(1).max(5).optional(),
});

export const habitsRouter = createTRPCRouter({
  /**
   * Get all habits for the current user
   */
  getAll: protectedProcedure
    .input(z.object({
      includeArchived: z.boolean().default(false),
      category: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const today = startOfDay(new Date());
      const tomorrow = endOfDay(new Date());

      const habits = await ctx.db.habit.findMany({
        where: {
          userId: ctx.user.id,
          isArchived: input?.includeArchived ? undefined : false,
          category: input?.category,
        },
        include: {
          completions: {
            where: {
              date: {
                gte: today,
                lte: tomorrow,
              },
            },
            take: 1,
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { orderIndex: 'asc' },
          { createdAt: 'asc' },
        ],
      });

      // Enhance with computed fields
      const enhancedHabits = await Promise.all(
        habits.map(async (habit) => {
          const streak = await calculateStreak(ctx.db, habit.id, ctx.user.id);
          const isCompletedToday = habit.completions.length > 0 && habit.completions[0].completed;

          return {
            ...habit,
            isCompletedToday,
            currentStreak: streak,
            completions: undefined, // Remove raw completions from response
          };
        })
      );

      return enhancedHabits;
    }),

  /**
   * Get a single habit by ID with detailed stats
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const habit = await ctx.db.habit.findUnique({
        where: { id: input.id },
        include: {
          completions: {
            orderBy: { date: 'desc' },
            take: 30,
          },
        },
      });

      if (!habit || habit.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Habit not found',
        });
      }

      const streak = await calculateStreak(ctx.db, habit.id, ctx.user.id);
      const stats = await calculateHabitStats(ctx.db, habit.id, ctx.user.id);

      return {
        ...habit,
        currentStreak: streak,
        stats,
      };
    }),

  /**
   * Create a new habit
   */
  create: protectedProcedure
    .input(createHabitSchema)
    .mutation(async ({ ctx, input }) => {
      // Calculate XP reward based on difficulty
      const xpReward = calculateXPReward(input.difficulty);

      // Get max order index
      const lastHabit = await ctx.db.habit.findFirst({
        where: { userId: ctx.user.id },
        orderBy: { orderIndex: 'desc' },
      });
      const orderIndex = (lastHabit?.orderIndex ?? -1) + 1;

      const habit = await ctx.db.habit.create({
        data: {
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          category: input.category,
          icon: input.icon,
          color: input.color,
          frequencyType: input.frequencyType,
          frequencyDays: input.frequencyDays || [],
          frequencyCount: input.frequencyCount,
          targetType: input.targetType,
          targetValue: input.targetValue,
          targetUnit: input.targetUnit,
          difficulty: input.difficulty,
          xpReward,
          reminderEnabled: input.reminderEnabled,
          reminderTimes: input.reminderTimes || [],
          orderIndex,
        },
      });

      // Log activity
      await ctx.db.activityLog.create({
        data: {
          userId: ctx.user.id,
          action: 'habit_created',
          entityType: 'habit',
          entityId: habit.id,
          metadata: { habitName: habit.name },
        },
      });

      return habit;
    }),

  /**
   * Update an existing habit
   */
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: updateHabitSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const habit = await ctx.db.habit.findUnique({
        where: { id: input.id },
      });

      if (!habit || habit.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Habit not found',
        });
      }

      // Recalculate XP if difficulty changed
      const updateData = { ...input.data };
      if (input.data.difficulty) {
        (updateData as Record<string, unknown>).xpReward = calculateXPReward(input.data.difficulty);
      }

      return ctx.db.habit.update({
        where: { id: input.id },
        data: updateData,
      });
    }),

  /**
   * Toggle habit completion for a specific date
   */
  toggleCompletion: protectedProcedure
    .input(toggleCompletionSchema)
    .mutation(async ({ ctx, input }) => {
      const date = input.date ? startOfDay(input.date) : startOfDay(new Date());

      // Prevent future completions
      if (date > startOfDay(new Date())) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot complete habits for future dates',
        });
      }

      const habit = await ctx.db.habit.findUnique({
        where: { id: input.habitId },
      });

      if (!habit || habit.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Habit not found',
        });
      }

      // Check if completion exists
      const existing = await ctx.db.habitCompletion.findUnique({
        where: {
          habitId_date: {
            habitId: input.habitId,
            date,
          },
        },
      });

      if (existing) {
        // Toggle off - delete completion
        await ctx.db.habitCompletion.delete({
          where: { id: existing.id },
        });

        // Deduct XP
        await ctx.db.user.update({
          where: { id: ctx.user.id },
          data: {
            xp: { decrement: habit.xpReward },
          },
        });

        // Update streak
        await updateUserStreak(ctx.db, ctx.user.id);

        return {
          completed: false,
          xpChange: -habit.xpReward,
          message: 'Habit unmarked',
        };
      } else {
        // Create completion
        await ctx.db.habitCompletion.create({
          data: {
            habitId: input.habitId,
            userId: ctx.user.id,
            date,
            completed: true,
            value: input.value,
            notes: input.notes,
            qualityRating: input.qualityRating,
          },
        });

        // Add XP
        await ctx.db.user.update({
          where: { id: ctx.user.id },
          data: {
            xp: { increment: habit.xpReward },
          },
        });

        // Update streak
        await updateUserStreak(ctx.db, ctx.user.id);

        // Log activity
        await ctx.db.activityLog.create({
          data: {
            userId: ctx.user.id,
            action: 'habit_completed',
            entityType: 'habit',
            entityId: habit.id,
            xpEarned: habit.xpReward,
            metadata: { habitName: habit.name, date: date.toISOString() },
          },
        });

        // Check for achievements (async, don't wait)
        checkAchievements(ctx.db, ctx.user.id).catch(console.error);

        return {
          completed: true,
          xpChange: habit.xpReward,
          message: 'Habit completed! +' + habit.xpReward + ' XP',
        };
      }
    }),

  /**
   * Get habit statistics
   */
  getStats: protectedProcedure
    .input(z.object({
      habitId: z.string().optional(),
      period: z.enum(['week', 'month', 'year', 'all']).default('month'),
    }))
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = getDateRange(input.period);

      const where = {
        userId: ctx.user.id,
        completed: true,
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(input.habitId ? { habitId: input.habitId } : {}),
      };

      const completions = await ctx.db.habitCompletion.findMany({
        where,
        include: { habit: true },
      });

      // Calculate statistics
      const totalCompletions = completions.length;
      const uniqueDays = new Set(
        completions.map((c) => format(c.date, 'yyyy-MM-dd'))
      ).size;

      // Group by category
      const byCategory = completions.reduce((acc, c) => {
        const cat = c.habit.category;
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Group by day of week
      const byDayOfWeek = completions.reduce((acc, c) => {
        const day = c.date.getDay();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // Calculate completion rate
      const totalDays = differenceInDays(endDate, startDate) + 1;
      const totalHabits = await ctx.db.habit.count({
        where: { userId: ctx.user.id, isArchived: false },
      });
      const expectedCompletions = totalDays * totalHabits;
      const completionRate = expectedCompletions > 0
        ? Math.round((totalCompletions / expectedCompletions) * 100)
        : 0;

      return {
        totalCompletions,
        uniqueDays,
        byCategory,
        byDayOfWeek,
        completionRate,
        period: input.period,
      };
    }),

  /**
   * Get completion history for calendar view
   */
  getCompletionHistory: protectedProcedure
    .input(z.object({
      habitId: z.string().optional(),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    }))
    .query(async ({ ctx, input }) => {
      const completions = await ctx.db.habitCompletion.findMany({
        where: {
          userId: ctx.user.id,
          habitId: input.habitId,
          date: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        include: {
          habit: {
            select: { id: true, name: true, color: true, icon: true },
          },
        },
      });

      // Group by date
      const byDate = completions.reduce((acc, c) => {
        const dateKey = format(c.date, 'yyyy-MM-dd');
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push({
          habitId: c.habitId,
          habitName: c.habit.name,
          habitColor: c.habit.color,
          habitIcon: c.habit.icon,
          completed: c.completed,
          value: c.value,
        });
        return acc;
      }, {} as Record<string, Array<{
        habitId: string;
        habitName: string;
        habitColor: string;
        habitIcon: string;
        completed: boolean;
        value: number | null;
      }>>);

      return byDate;
    }),

  /**
   * Archive a habit
   */
  archive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const habit = await ctx.db.habit.findUnique({
        where: { id: input.id },
      });

      if (!habit || habit.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return ctx.db.habit.update({
        where: { id: input.id },
        data: { isArchived: true },
      });
    }),

  /**
   * Restore an archived habit
   */
  restore: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.habit.update({
        where: { id: input.id },
        data: { isArchived: false },
      });
    }),

  /**
   * Delete a habit permanently
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const habit = await ctx.db.habit.findUnique({
        where: { id: input.id },
      });

      if (!habit || habit.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      await ctx.db.habit.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Reorder habits
   */
  reorder: protectedProcedure
    .input(z.object({
      habitIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const updates = input.habitIds.map((id, index) =>
        ctx.db.habit.update({
          where: { id },
          data: { orderIndex: index },
        })
      );

      await Promise.all(updates);

      return { success: true };
    }),

  /**
   * Toggle pin status
   */
  togglePin: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const habit = await ctx.db.habit.findUnique({
        where: { id: input.id },
      });

      if (!habit || habit.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return ctx.db.habit.update({
        where: { id: input.id },
        data: { isPinned: !habit.isPinned },
      });
    }),
});

// Helper functions

function calculateXPReward(difficulty: number): number {
  // Base XP is 10, scales with difficulty
  const baseXP = 10;
  const multiplier = [0.5, 0.75, 1, 1.5, 2][difficulty - 1] || 1;
  return Math.round(baseXP * multiplier * 10) / 10 * 10; // Round to nearest 10
}

async function calculateStreak(
  db: typeof import('@/server/db').db,
  habitId: string,
  userId: string
): Promise<number> {
  const completions = await db.habitCompletion.findMany({
    where: {
      habitId,
      userId,
      completed: true,
    },
    orderBy: { date: 'desc' },
    take: 365, // Max 1 year
  });

  if (completions.length === 0) return 0;

  let streak = 0;
  let currentDate = startOfDay(new Date());

  for (const completion of completions) {
    const completionDate = startOfDay(completion.date);
    const diffDays = differenceInDays(currentDate, completionDate);

    if (diffDays === 0) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else if (diffDays === 1) {
      streak++;
      currentDate = completionDate;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }

  return streak;
}

async function calculateHabitStats(
  db: typeof import('@/server/db').db,
  habitId: string,
  userId: string
) {
  const thirtyDaysAgo = subDays(new Date(), 30);

  const completions = await db.habitCompletion.findMany({
    where: {
      habitId,
      userId,
      date: { gte: thirtyDaysAgo },
    },
  });

  const totalCompletions = completions.filter((c) => c.completed).length;
  const completionRate = Math.round((totalCompletions / 30) * 100);

  return {
    last30Days: totalCompletions,
    completionRate,
    totalAllTime: await db.habitCompletion.count({
      where: { habitId, userId, completed: true },
    }),
  };
}

async function updateUserStreak(
  db: typeof import('@/server/db').db,
  userId: string
) {
  // Get all user's active habits
  const habits = await db.habit.findMany({
    where: { userId, isArchived: false },
    select: { id: true },
  });

  if (habits.length === 0) return;

  // Check if user completed at least one habit each day
  let streak = 0;
  let currentDate = startOfDay(new Date());

  for (let i = 0; i < 365; i++) {
    const dayCompletions = await db.habitCompletion.count({
      where: {
        userId,
        date: currentDate,
        completed: true,
      },
    });

    if (dayCompletions > 0) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else if (i > 0) {
      // Allow today to be incomplete
      break;
    } else {
      currentDate = subDays(currentDate, 1);
    }
  }

  // Update user's streak
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { longestStreak: true },
  });

  await db.user.update({
    where: { id: userId },
    data: {
      currentStreak: streak,
      longestStreak: Math.max(streak, user?.longestStreak || 0),
    },
  });
}

async function checkAchievements(
  db: typeof import('@/server/db').db,
  userId: string
) {
  // Get all achievements not yet unlocked by user
  const unlockedIds = await db.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });

  const unlockedSet = new Set(unlockedIds.map((u) => u.achievementId));

  const achievements = await db.achievement.findMany({
    where: {
      id: { notIn: Array.from(unlockedSet) },
    },
  });

  // Get user stats
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  const totalCompletions = await db.habitCompletion.count({
    where: { userId, completed: true },
  });

  // Check each achievement
  for (const achievement of achievements) {
    const config = achievement.criteriaConfig as { threshold: number };
    let shouldUnlock = false;

    switch (achievement.criteriaType) {
      case 'streak':
        shouldUnlock = (user?.currentStreak || 0) >= config.threshold;
        break;
      case 'total_completions':
        shouldUnlock = totalCompletions >= config.threshold;
        break;
      // Add more criteria types as needed
    }

    if (shouldUnlock) {
      await db.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      // Award XP
      await db.user.update({
        where: { id: userId },
        data: { xp: { increment: achievement.xpReward } },
      });

      // Log activity
      await db.activityLog.create({
        data: {
          userId,
          action: 'achievement_unlocked',
          entityType: 'achievement',
          entityId: achievement.id,
          xpEarned: achievement.xpReward,
          metadata: { achievementName: achievement.name },
        },
      });
    }
  }
}

function getDateRange(period: 'week' | 'month' | 'year' | 'all'): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = endOfDay(new Date());
  let startDate: Date;

  switch (period) {
    case 'week':
      startDate = subDays(endDate, 7);
      break;
    case 'month':
      startDate = subDays(endDate, 30);
      break;
    case 'year':
      startDate = subDays(endDate, 365);
      break;
    case 'all':
      startDate = new Date(0); // Beginning of time
      break;
  }

  return { startDate: startOfDay(startDate), endDate };
}
