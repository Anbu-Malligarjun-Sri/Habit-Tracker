/**
 * Progress Bar Component
 * 
 * Animated progress bar with multiple variants.
 */

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'striped';
  animated?: boolean;
}

export function Progress({
  value,
  max = 100,
  className,
  indicatorClassName,
  showLabel = false,
  size = 'md',
  variant = 'default',
  animated = true,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantClasses = {
    default: 'bg-primary',
    gradient: 'bg-gradient-to-r from-violet-500 to-purple-500',
    striped: 'bg-primary bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)]',
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-muted',
          sizeClasses[size]
        )}
      >
        <motion.div
          className={cn(
            'h-full rounded-full',
            variantClasses[variant],
            variant === 'striped' && animated && 'animate-[progress-stripes_1s_linear_infinite]',
            indicatorClassName
          )}
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  labelClassName?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 60,
  strokeWidth = 4,
  className,
  showLabel = true,
  labelClassName,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex', className)} style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <motion.circle
          className="text-primary"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showLabel && (
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center text-sm font-semibold',
            labelClassName
          )}
        >
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
