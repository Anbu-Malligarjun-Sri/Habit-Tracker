/**
 * Environment Configuration
 * 
 * Type-safe environment variable access.
 * Uses Zod for validation.
 */

import { z } from 'zod';

/**
 * Server-side environment schema
 */
const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
});

/**
 * Client-side environment schema (prefixed with NEXT_PUBLIC_)
 */
const clientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().optional(),
});

/**
 * Validate and parse server environment
 */
const serverEnv = () => {
  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid server environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid server environment variables');
    }
    
    // Return defaults for development
    return {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/habitquest',
      NODE_ENV: 'development' as const,
      CLERK_SECRET_KEY: '',
      CLERK_WEBHOOK_SECRET: undefined,
    };
  }

  return parsed.data;
};

/**
 * Validate and parse client environment
 */
const clientEnv = () => {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  });

  if (!parsed.success) {
    console.error('❌ Invalid client environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    
    // Return defaults for development
    return {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: '',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: '/dashboard',
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: '/dashboard',
    };
  }

  return parsed.data;
};

/**
 * Validated environment variables
 */
export const env = {
  ...serverEnv(),
  ...clientEnv(),
};

/**
 * Helper to check if we're in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Helper to check if we're in development
 */
export const isDevelopment = env.NODE_ENV === 'development';
