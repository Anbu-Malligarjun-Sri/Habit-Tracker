/**
 * Empty State Component
 * 
 * Consistent empty state UI for when there's no data.
 */

'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <motion.div
      className={cn(
        'flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8 text-center',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {icon && (
        <motion.div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {icon}
        </motion.div>
      )}
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mb-4 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2">
          {action && (
            <Button onClick={action.onClick} className="gap-2">
              {action.icon}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
}

interface EmptyHabitsProps {
  onCreateHabit: () => void;
}

export function EmptyHabits({ onCreateHabit }: EmptyHabitsProps) {
  return (
    <EmptyState
      icon={
        <span className="text-4xl">🎯</span>
      }
      title="No habits yet"
      description="Start building better habits today. Create your first habit and begin your journey to self-improvement."
      action={{
        label: 'Create Your First Habit',
        onClick: onCreateHabit,
      }}
    />
  );
}

interface EmptySearchProps {
  query: string;
  onClear: () => void;
}

export function EmptySearch({ query, onClear }: EmptySearchProps) {
  return (
    <EmptyState
      icon={
        <span className="text-4xl">🔍</span>
      }
      title={`No results for "${query}"`}
      description="Try searching with different keywords or check your spelling."
      action={{
        label: 'Clear Search',
        onClick: onClear,
      }}
    />
  );
}

interface EmptyAchievementsProps {
  type: 'all' | 'unlocked';
}

export function EmptyAchievements({ type }: EmptyAchievementsProps) {
  return (
    <EmptyState
      icon={
        <span className="text-4xl">🏆</span>
      }
      title={type === 'unlocked' ? 'No achievements unlocked yet' : 'No achievements available'}
      description={
        type === 'unlocked'
          ? 'Complete habits and maintain streaks to unlock achievements and earn rewards.'
          : 'Achievements are being prepared. Check back soon!'
      }
    />
  );
}
