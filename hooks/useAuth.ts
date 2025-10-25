/**
 * Authentication Hooks
 * Custom hooks for authentication logic
 */

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/lib/constants";

/**
 * Require authentication
 * Redirects to sign in if not authenticated
 */
export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(ROUTES.SIGNIN);
    }
  }, [status, router]);

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}

/**
 * Get current user
 */
export function useCurrentUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}

