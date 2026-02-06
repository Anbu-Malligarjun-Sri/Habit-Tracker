/**
 * Auth Utilities
 * 
 * Helper functions for authentication with Clerk.
 * Provides easy access to user data and auth state.
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/server/db';
import { redirect } from 'next/navigation';
import { cache } from 'react';

/**
 * Get the current user's auth info (server-side)
 * Throws if not authenticated
 */
export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  return { userId };
}

/**
 * Get the current user from our database
 * Creates the user if they don't exist
 */
export const getCurrentUser = cache(async () => {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }
  
  // Try to find user in our database
  let user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      resources: true,
    },
  });
  
  // If user doesn't exist, create them
  if (!user) {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }
    
    user = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        username: clerkUser.username,
        avatarUrl: clerkUser.imageUrl,
      },
      include: {
        resources: true,
      },
    });
    
    // Initialize resources
    await db.userResource.createMany({
      data: [
        { userId: user.id, resourceType: 'GOLD', amount: 100 },
        { userId: user.id, resourceType: 'ELIXIR', amount: 50 },
        { userId: user.id, resourceType: 'DARK_MATTER', amount: 0 },
        { userId: user.id, resourceType: 'GEMS', amount: 10 },
      ],
    });
    
    // Refetch with resources
    user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        resources: true,
      },
    });
  }
  
  return user;
});

/**
 * Get auth status without throwing
 */
export async function getAuthStatus() {
  const { userId } = await auth();
  return {
    isAuthenticated: !!userId,
    userId,
  };
}

/**
 * Check if user has completed onboarding
 */
export async function checkOnboardingStatus() {
  const user = await getCurrentUser();
  
  if (!user) {
    return { isComplete: false, step: 'auth' as const };
  }
  
  // Check if user has any habits (basic onboarding check)
  const habitCount = await db.habit.count({
    where: { userId: user.id },
  });
  
  if (habitCount === 0) {
    return { isComplete: false, step: 'habits' as const };
  }
  
  return { isComplete: true, step: 'complete' as const };
}

/**
 * Calculate user level from XP
 */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

/**
 * Calculate level progress
 */
export function calculateLevelProgress(xp: number) {
  const level = calculateLevel(xp);
  const currentLevelXP = 50 * Math.pow(level - 1, 2);
  const nextLevelXP = 50 * Math.pow(level, 2);
  const xpInLevel = xp - currentLevelXP;
  const xpForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercent = Math.round((xpInLevel / xpForNextLevel) * 100);
  
  return {
    level,
    currentLevelXP,
    nextLevelXP,
    xpInLevel,
    xpForNextLevel,
    progressPercent,
  };
}

/**
 * Get rank info based on XP
 */
export function getRankInfo(xp: number) {
  const ranks = [
    { id: 'unranked', name: 'Unranked', minXP: 0, color: '#9CA3AF', icon: '🌱' },
    { id: 'bronze', name: 'Bronze', minXP: 100, color: '#CD7F32', icon: '🥉' },
    { id: 'silver', name: 'Silver', minXP: 300, color: '#C0C0C0', icon: '🥈' },
    { id: 'gold', name: 'Gold', minXP: 600, color: '#FFD700', icon: '🥇' },
    { id: 'platinum', name: 'Platinum', minXP: 1000, color: '#E5E4E2', icon: '💎' },
    { id: 'diamond', name: 'Diamond', minXP: 1500, color: '#B9F2FF', icon: '💠' },
    { id: 'master', name: 'Master', minXP: 2200, color: '#9B59B6', icon: '🔮' },
    { id: 'champion', name: 'Champion', minXP: 3000, color: '#E74C3C', icon: '👑' },
    { id: 'legend', name: 'Legend', minXP: 4000, color: '#F39C12', icon: '🌟' },
  ];
  
  let currentRank = ranks[0];
  for (const rank of ranks) {
    if (xp >= rank.minXP) {
      currentRank = rank;
    }
  }
  
  const currentIndex = ranks.indexOf(currentRank);
  const nextRank = currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : null;
  
  return {
    current: currentRank,
    next: nextRank,
    progress: nextRank 
      ? Math.round(((xp - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100)
      : 100,
  };
}
