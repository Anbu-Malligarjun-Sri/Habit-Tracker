/**
 * tRPC React Client
 * 
 * This file sets up the tRPC client for use in React components.
 * Uses TanStack Query for caching and state management.
 */

import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@/server/api/root';

/**
 * A set of typesafe react-query hooks for tRPC
 */
export const api = createTRPCReact<AppRouter>();

/**
 * Inference helpers for input/output types
 */
export type { RouterInputs, RouterOutputs } from '@/server/api/root';
