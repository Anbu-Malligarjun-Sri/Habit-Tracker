/**
 * App Header Component
 * 
 * Main header with user info, XP progress, resources, and navigation.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser, SignOutButton, UserButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  Settings,
  Trophy,
  Flame,
  Sparkles,
  ChevronDown,
  LogOut,
  User,
  Coins,
  Droplet,
  Gem,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores';

interface ResourceDisplayProps {
  type: 'gold' | 'elixir' | 'darkMatter' | 'gems';
  amount: number;
}

function ResourceDisplay({ type, amount }: ResourceDisplayProps) {
  const icons = {
    gold: { icon: Coins, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    elixir: { icon: Droplet, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    darkMatter: { icon: Star, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    gems: { icon: Gem, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  };

  const { icon: Icon, color, bg } = icons[type];

  return (
    <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-full', bg)}>
      <Icon className={cn('h-4 w-4', color)} />
      <span className="text-sm font-medium tabular-nums">
        {amount.toLocaleString()}
      </span>
    </div>
  );
}

interface XPProgressProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progressPercent: number;
}

function XPProgress({ level, currentXP, nextLevelXP, progressPercent }: XPProgressProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold shadow-lg">
          {level}
        </div>
        <div className="hidden md:block">
          <div className="text-xs text-muted-foreground">Level {level}</div>
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
      <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        <span>{currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</span>
      </div>
    </div>
  );
}

interface StreakDisplayProps {
  streak: number;
}

function StreakDisplay({ streak }: StreakDisplayProps) {
  const isOnFire = streak >= 7;

  return (
    <motion.div
      className={cn(
        'flex items-center gap-1.5 px-3 py-1 rounded-full',
        isOnFire
          ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20'
          : 'bg-muted'
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={isOnFire ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        <Flame
          className={cn(
            'h-4 w-4',
            isOnFire ? 'text-orange-500' : 'text-muted-foreground'
          )}
        />
      </motion.div>
      <span
        className={cn(
          'text-sm font-bold tabular-nums',
          isOnFire ? 'text-orange-500' : 'text-muted-foreground'
        )}
      >
        {streak}
      </span>
    </motion.div>
  );
}

export function AppHeader() {
  const { user: clerkUser } = useUser();
  const { user, levelProgress, resources, currentRank } = useUserStore();
  const [searchOpen, setSearchOpen] = useState(false);

  // Use store data or fallback to defaults
  const level = levelProgress?.level ?? 1;
  const currentXP = user?.xp ?? 0;
  const nextLevelXP = levelProgress?.nextLevelXP ?? 100;
  const progressPercent = levelProgress?.progressPercent ?? 0;
  const streak = user?.currentStreak ?? 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="hidden font-bold sm:inline-block">
              HabitQuest
            </span>
          </Link>
        </div>

        {/* XP Progress */}
        <div className="hidden md:flex mr-4">
          <XPProgress
            level={level}
            currentXP={currentXP}
            nextLevelXP={nextLevelXP}
            progressPercent={progressPercent}
          />
        </div>

        {/* Streak */}
        <div className="hidden sm:flex mr-4">
          <StreakDisplay streak={streak} />
        </div>

        {/* Spacer */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Resources */}
          <div className="hidden lg:flex items-center gap-2 mr-4">
            <ResourceDisplay type="gold" amount={resources.GOLD ?? 0} />
            <ResourceDisplay type="elixir" amount={resources.ELIXIR ?? 0} />
            <ResourceDisplay type="gems" amount={resources.GEMS ?? 0} />
          </div>

          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'h-8 w-8',
                    },
                  }}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {clerkUser?.firstName || clerkUser?.username || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {clerkUser?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {currentRank && (
                <>
                  <DropdownMenuItem className="gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: currentRank.color }}
                    />
                    <span>{currentRank.name} Rank</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="gap-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-red-600">
                <LogOut className="h-4 w-4" />
                <SignOutButton>
                  <span>Log out</span>
                </SignOutButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
