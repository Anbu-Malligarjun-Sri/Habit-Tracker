/**
 * Page Header Component
 * 
 * Consistent page header with title, description, and actions.
 */

'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  icon,
  actions,
  className,
  children,
}: PageHeaderProps) {
  return (
    <motion.div
      className={cn('mb-8', className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {icon && (
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                {icon}
              </motion.div>
            )}
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h1>
          </div>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {actions}
          </motion.div>
        )}
      </div>
      {children}
    </motion.div>
  );
}

interface PageSectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function PageSection({
  title,
  description,
  actions,
  className,
  children,
}: PageSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function PageContainer({
  children,
  className,
  maxWidth = '2xl',
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn('container mx-auto px-4 py-6', maxWidthClasses[maxWidth], className)}>
      {children}
    </div>
  );
}
