/**
 * Auth Utilities
 * Helper functions for authentication and authorization
 */

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { prisma } from "../db";
import { UnauthorizedError, NotFoundError } from "./errors";

/**
 * Get Current User from Session
 * Returns user ID from session or throws error
 */
export async function getCurrentUser(): Promise<{ id: string; email: string }> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new UnauthorizedError();
  }

  return {
    id: session.user.id,
    email: session.user.email,
  };
}

/**
 * Get Current User with Full Profile
 * Returns full user object from database
 */
export async function getCurrentUserProfile() {
  const { email } = await getCurrentUser();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  return user;
}

/**
 * Require Authentication
 * Middleware to check if user is authenticated
 */
export async function requireAuth(): Promise<string> {
  const { id } = await getCurrentUser();
  return id;
}

/**
 * Check Resource Ownership
 * Verify that the current user owns a resource
 */
export async function checkOwnership(
  resourceUserId: string,
  errorMessage: string = "You do not have permission to access this resource"
): Promise<void> {
  const { id } = await getCurrentUser();

  if (id !== resourceUserId) {
    throw new UnauthorizedError(errorMessage);
  }
}

