/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter (for production, use Redis/Upstash)
 */

import { RateLimitError } from "./errors";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // AI endpoints - expensive operations
  AI_GENERATION: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 requests per minute
  },
  
  // Write operations
  CREATE_WORKOUT: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 requests per minute
  },
  
  // External API calls
  EXERCISE_SYNC: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 requests per minute
  },
  
  // Nutrition analysis
  NUTRITION_ANALYZE: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 requests per minute
  },
  
  // Default for all other endpoints
  DEFAULT: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests per minute
  },
} as const;

/**
 * Check if request should be rate limited
 * @param identifier - Unique identifier (userId, IP, etc.)
 * @param config - Rate limit configuration
 * @throws RateLimitError if limit exceeded
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT
): void {
  const now = Date.now();
  const key = `${identifier}:${config.maxRequests}:${config.windowMs}`;
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }
  
  let entry = rateLimitStore.get(key);
  
  // Initialize or reset if window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
    return;
  }
  
  // Increment count
  entry.count++;
  
  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    throw new RateLimitError(
      `You've made too many requests. Please wait ${retryAfter} seconds and try again.`,
      retryAfter
    );
  }
  
  rateLimitStore.set(key, entry);
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach((key) => rateLimitStore.delete(key));
}

/**
 * Get rate limit status for an identifier
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT
): {
  remaining: number;
  resetTime: number;
  limit: number;
} {
  const key = `${identifier}:${config.maxRequests}:${config.windowMs}`;
  const entry = rateLimitStore.get(key);
  
  if (!entry || Date.now() > entry.resetTime) {
    return {
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
      limit: config.maxRequests,
    };
  }
  
  return {
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
    limit: config.maxRequests,
  };
}

/**
 * Reset rate limit for an identifier (useful for testing)
 */
export function resetRateLimit(identifier: string): void {
  const keysToDelete: string[] = [];
  
  rateLimitStore.forEach((_, key) => {
    if (key.startsWith(identifier)) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach((key) => rateLimitStore.delete(key));
}

