/**
 * API Middleware Utilities
 * Reusable middleware functions for API routes
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createErrorResponse } from "./errors";

/**
 * Middleware to check if user is authenticated
 * Usage: const session = await requireAuth(req);
 */
export async function requireAuth(req: Request): Promise<{ id: string }> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  return { id: session.user.id };
}

/**
 * Higher-order function to wrap API route handlers with auth check
 * Usage: export const GET = withAuth(async (req, user) => { ... });
 */
export function withAuth(
  handler: (req: Request, user: { id: string }) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    try {
      const user = await requireAuth(req);
      return await handler(req, user);
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        return createErrorResponse(new AppError("Unauthorized", 401));
      }
      throw error;
    }
  };
}

/**
 * Optional auth - returns user if authenticated, null otherwise
 * Usage: const user = await optionalAuth(req);
 */
export async function optionalAuth(req: Request): Promise<{ id: string } | null> {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null;
  }

  return { id: session.user.id };
}

