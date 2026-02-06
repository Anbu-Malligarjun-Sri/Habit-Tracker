/**
 * Root tRPC Router
 * 
 * This is the main router that combines all sub-routers.
 * All API endpoints are defined through this router.
 */

import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { createCallerFactory, createTRPCRouter } from './trpc';
import { userRouter } from './routers/user';
import { habitsRouter } from './routers/habits';
import { gamificationRouter } from './routers/gamification';

/**
 * Main App Router
 * All sub-routers are merged here
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  habits: habitsRouter,
  gamification: gamificationRouter,
});

/**
 * Export type definition of API
 * Used for client-side type inference
 */
export type AppRouter = typeof appRouter;

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Create a server-side caller for the tRPC API
 * Used in Server Components
 * 
 * @example
 * const trpc = createCaller(createContext);
 * const users = await trpc.user.getProfile();
 */
export const createCaller = createCallerFactory(appRouter);
