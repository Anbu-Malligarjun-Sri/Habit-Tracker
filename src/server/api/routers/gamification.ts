/**
 * Gamification Router
 * 
 * Handles all gamification-related API endpoints:
 * - XP and leveling
 * - Achievements
 * - Resources (Gold, Elixir, etc.)
 * - Leaderboards
 * - Streak management
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { ResourceType } from '@prisma/client';

// Constants
const RANKS = [
  { id: 'unranked', name: 'Unranked', minXP: 0, color: '#9CA3AF', icon: '🌱' },
  { id: 'bronze', name: 'Bronze', minXP: 100, color: '#CD7F32', icon: '🥉' },
  { id: 'silver', name: 'Silver', minXP: 300, color: '#C0C0C0', icon: '🥈' },
  { id: 'gold', name: 'Gold', minXP: 600, color: '#FFD700', icon: '🥇' },
  { id: 'platinum', name: 'Platinum', minXP: 1000, color: '#E5E4E2', icon: '💎' },
  { id: 'diamond', name: 'Diamond', minXP: 1500, color: '#B9F2FF', icon: '💠' },
  { id: 'master', name: 'Master', minXP: 2200, color: '#9B59B6', icon: '👑' },
  { id: 'champion', name: 'Champion', minXP: 3000, color: '#E74C3C', icon: '🏆' },
  { id: 'legend', name: 'Legend', minXP: 4000, color: '#F39C12', icon: '⭐' },
] as const;

const RESOURCE_COSTS = {
  STREAK_REPAIR_1: { resource: 'GOLD' as ResourceType, amount: 50 },
  STREAK_REPAIR_2: { resource: 'ELIXIR' as ResourceType, amount: 25 },
  STREAK_REPAIR_3: { resource: 'DARK_MATTER' as ResourceType, amount: 10 },
} as const;

export const gamificationRouter = createTRPCRouter({
  /**
   * Get user's gamification status
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        resources: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    const currentRank = getRank(user.xp);
    const nextRank = getNextRank(user.xp);
    const level = calculateLevel(user.xp);
    const levelProgress = calculateLevelProgress(user.xp);

    // Transform resources to object
    const resources = user.resources.reduce((acc, r) => {
      acc[r.resourceType] = r.amount;
      return acc;
    }, {} as Record<ResourceType, number>);

    return {
      xp: user.xp,
      level,
      levelProgress,
      currentRank,
      nextRank,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      resources,
    };
  }),

  /**
   * Get all ranks
   */
  getRanks: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: { xp: true },
    });

    return RANKS.map((rank) => ({
      ...rank,
      isUnlocked: (user?.xp || 0) >= rank.minXP,
      isCurrent: getRank(user?.xp || 0).id === rank.id,
    }));
  }),

  /**
   * Get all achievements
   */
  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    const [achievements, userAchievements] = await Promise.all([
      ctx.db.achievement.findMany({
        orderBy: [{ tier: 'asc' }, { xpReward: 'asc' }],
      }),
      ctx.db.userAchievement.findMany({
        where: { userId: ctx.user.id },
      }),
    ]);

    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    return achievements.map((achievement) => ({
      ...achievement,
      isUnlocked: unlockedIds.has(achievement.id),
      unlockedAt: userAchievements.find((ua) => ua.achievementId === achievement.id)?.unlockedAt,
    }));
  }),

  /**
   * Get user's unlocked achievements
   */
  getUnlockedAchievements: protectedProcedure.query(async ({ ctx }) => {
    const userAchievements = await ctx.db.userAchievement.findMany({
      where: { userId: ctx.user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });

    return userAchievements.map((ua) => ({
      ...ua.achievement,
      unlockedAt: ua.unlockedAt,
    }));
  }),

  /**
   * Get resources
   */
  getResources: protectedProcedure.query(async ({ ctx }) => {
    const resources = await ctx.db.userResource.findMany({
      where: { userId: ctx.user.id },
    });

    // Ensure all resource types exist
    const resourceMap: Record<ResourceType, number> = {
      GOLD: 0,
      ELIXIR: 0,
      DARK_MATTER: 0,
      GEMS: 0,
    };

    resources.forEach((r) => {
      resourceMap[r.resourceType] = r.amount;
    });

    return resourceMap;
  }),

  /**
   * Add resources (for testing or rewards)
   */
  addResource: protectedProcedure
    .input(z.object({
      resourceType: z.nativeEnum(ResourceType),
      amount: z.number().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const resource = await ctx.db.userResource.upsert({
        where: {
          userId_resourceType: {
            userId: ctx.user.id,
            resourceType: input.resourceType,
          },
        },
        update: {
          amount: { increment: input.amount },
        },
        create: {
          userId: ctx.user.id,
          resourceType: input.resourceType,
          amount: input.amount,
        },
      });

      return resource;
    }),

  /**
   * Repair streak using resources
   */
  repairStreak: protectedProcedure
    .input(z.object({
      daysAgo: z.number().min(1).max(7),
    }))
    .mutation(async ({ ctx, input }) => {
      // Determine cost based on days ago
      let cost: { resource: ResourceType; amount: number };
      if (input.daysAgo === 1) {
        cost = RESOURCE_COSTS.STREAK_REPAIR_1;
      } else if (input.daysAgo <= 3) {
        cost = RESOURCE_COSTS.STREAK_REPAIR_2;
      } else {
        cost = RESOURCE_COSTS.STREAK_REPAIR_3;
      }

      // Check if user has enough resources
      const resource = await ctx.db.userResource.findUnique({
        where: {
          userId_resourceType: {
            userId: ctx.user.id,
            resourceType: cost.resource,
          },
        },
      });

      if (!resource || resource.amount < cost.amount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Not enough ${cost.resource}. Need ${cost.amount}, have ${resource?.amount || 0}`,
        });
      }

      // Deduct resource
      await ctx.db.userResource.update({
        where: {
          userId_resourceType: {
            userId: ctx.user.id,
            resourceType: cost.resource,
          },
        },
        data: {
          amount: { decrement: cost.amount },
        },
      });

      // Calculate the target date
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - input.daysAgo);
      targetDate.setHours(0, 0, 0, 0);

      // Get all active habits
      const habits = await ctx.db.habit.findMany({
        where: { userId: ctx.user.id, isArchived: false },
      });

      // Create completions for all habits on that day
      for (const habit of habits) {
        await ctx.db.habitCompletion.upsert({
          where: {
            habitId_date: {
              habitId: habit.id,
              date: targetDate,
            },
          },
          update: { completed: true },
          create: {
            habitId: habit.id,
            userId: ctx.user.id,
            date: targetDate,
            completed: true,
            notes: 'Streak repaired',
          },
        });
      }

      // Log activity
      await ctx.db.activityLog.create({
        data: {
          userId: ctx.user.id,
          action: 'streak_repaired',
          entityType: 'streak',
          metadata: {
            daysAgo: input.daysAgo,
            cost: cost.amount,
            resourceUsed: cost.resource,
          },
        },
      });

      return {
        success: true,
        message: `Streak repaired for ${targetDate.toDateString()}`,
        resourceUsed: cost.resource,
        amountSpent: cost.amount,
      };
    }),

  /**
   * Get recent activity log
   */
  getActivityLog: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const activities = await ctx.db.activityLog.findMany({
        where: { userId: ctx.user.id },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      let nextCursor: string | undefined = undefined;
      if (activities.length > input.limit) {
        const nextItem = activities.pop();
        nextCursor = nextItem!.id;
      }

      return {
        activities,
        nextCursor,
      };
    }),

  /**
   * Get leaderboard
   */
  getLeaderboard: protectedProcedure
    .input(z.object({
      type: z.enum(['xp', 'streak', 'completions']).default('xp'),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      // For now, just return user's own stats
      // In Phase 9 (Social), this will return actual leaderboard
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          username: true,
          firstName: true,
          avatarUrl: true,
          xp: true,
          currentStreak: true,
          _count: {
            select: {
              habitCompletions: true,
            },
          },
        },
      });

      if (!user) {
        return { entries: [], userRank: 0 };
      }

      const entry = {
        userId: user.id,
        username: user.username || user.firstName || 'Anonymous',
        avatarUrl: user.avatarUrl,
        value: input.type === 'xp'
          ? user.xp
          : input.type === 'streak'
            ? user.currentStreak
            : user._count.habitCompletions,
        rank: 1,
      };

      return {
        entries: [entry],
        userRank: 1,
      };
    }),

  /**
   * Award daily bonus (called once per day)
   */
  claimDailyBonus: protectedProcedure.mutation(async ({ ctx }) => {
    // Check if user already claimed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingClaim = await ctx.db.activityLog.findFirst({
      where: {
        userId: ctx.user.id,
        action: 'daily_bonus_claimed',
        createdAt: { gte: today },
      },
    });

    if (existingClaim) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Daily bonus already claimed today',
      });
    }

    // Calculate bonus based on streak
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
    });

    const streakMultiplier = Math.min(Math.floor((user?.currentStreak || 0) / 7) + 1, 5);
    const goldReward = 10 * streakMultiplier;
    const xpReward = 5 * streakMultiplier;

    // Award resources
    await ctx.db.userResource.upsert({
      where: {
        userId_resourceType: {
          userId: ctx.user.id,
          resourceType: 'GOLD',
        },
      },
      update: { amount: { increment: goldReward } },
      create: {
        userId: ctx.user.id,
        resourceType: 'GOLD',
        amount: goldReward,
      },
    });

    // Award XP
    await ctx.db.user.update({
      where: { id: ctx.user.id },
      data: { xp: { increment: xpReward } },
    });

    // Log activity
    await ctx.db.activityLog.create({
      data: {
        userId: ctx.user.id,
        action: 'daily_bonus_claimed',
        entityType: 'bonus',
        xpEarned: xpReward,
        metadata: {
          goldReward,
          xpReward,
          streakMultiplier,
        },
      },
    });

    return {
      goldReward,
      xpReward,
      streakMultiplier,
      message: `Claimed ${goldReward} Gold and ${xpReward} XP!`,
    };
  }),
});

// Helper functions

function getRank(xp: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

function getNextRank(xp: number) {
  const currentRank = getRank(xp);
  const currentIndex = RANKS.findIndex((r) => r.id === currentRank.id);

  if (currentIndex === RANKS.length - 1) {
    return null; // Max rank
  }

  const nextRank = RANKS[currentIndex + 1];
  return {
    ...nextRank,
    xpRequired: nextRank.minXP - xp,
    progress: Math.round(((xp - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100),
  };
}

function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

function calculateLevelProgress(xp: number): {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  xpInLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
} {
  const level = calculateLevel(xp);
  const currentLevelXP = 50 * Math.pow(level - 1, 2);
  const nextLevelXP = 50 * Math.pow(level, 2);
  const xpInLevel = xp - currentLevelXP;
  const xpForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercent = Math.min(100, Math.round((xpInLevel / xpForNextLevel) * 100));

  return {
    level,
    currentLevelXP,
    nextLevelXP,
    xpInLevel,
    xpForNextLevel,
    progressPercent,
  };
}
