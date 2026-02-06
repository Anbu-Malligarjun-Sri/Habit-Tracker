/**
 * tRPC Server Configuration
 * 
 * This file sets up the core tRPC configuration including:
 * - Context creation with database and auth
 * - Procedure definitions (public and protected)
 * - Error formatting
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/server/db';

/**
 * Context Interface
 * Defines what's available in every tRPC procedure
 */
interface CreateContextOptions {
  req: Request;
}

/**
 * Create inner context (without request-specific data)
 * Used for testing and CLI usage
 */
export const createInnerTRPCContext = (opts: { userId: string | null }) => {
  return {
    db,
    userId: opts.userId,
  };
};

/**
 * Create context for each request
 * This runs for every incoming request
 */
export const createTRPCContext = async (opts: CreateContextOptions) => {
  const { userId } = await auth();

  return {
    db,
    userId,
    headers: opts.req.headers,
  };
};

/**
 * Initialize tRPC
 * - Uses superjson for serialization (handles Dates, Maps, etc.)
 * - Formats Zod errors for better client-side handling
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller
 * Used for server components to call tRPC procedures
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * Router creation helper
 */
export const createTRPCRouter = t.router;

/**
 * Middleware to measure procedure execution time
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (process.env.NODE_ENV === 'development') {
    // Artificial delay in development for testing loading states
    const waitMs = Math.floor(Math.random() * 100) + 50;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[tRPC] ${path} took ${end - start}ms`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 * Can be used by anyone, logged in or not
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Middleware that enforces authentication
 * Throws UNAUTHORIZED if user is not logged in
 */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    });
  }

  // Fetch or create user in database
  let user = await ctx.db.user.findUnique({
    where: { clerkId: ctx.userId },
  });

  // If user doesn't exist in our database, we'll need to sync them
  // This happens on first API call after Clerk auth
  if (!user) {
    // User will be synced via webhook or first protected call
    // For now, throw an error - user sync should happen via webhook
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User not found. Please try logging in again.',
    });
  }

  return next({
    ctx: {
      // Narrow the type to exclude null
      userId: ctx.userId,
      user,
    },
  });
});

/**
 * Protected (authenticated) procedure
 * Guaranteed to have a valid userId in context
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(enforceUserIsAuthed);

/**
 * Type exports for use in routers
 */
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
export type ProtectedContext = Context & {
  userId: string;
  user: NonNullable<Awaited<ReturnType<typeof db.user.findUnique>>>;
};
