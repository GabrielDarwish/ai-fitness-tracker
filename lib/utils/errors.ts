/**
 * Error Handling Utilities
 * Centralized error handling and formatting
 */

import { NextResponse } from "next/server";
import { ERROR_MESSAGES } from "../constants";

/**
 * Custom Application Error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error Response Builder with Field-Level Details
 */
export function createErrorResponse(
  error: unknown,
  fallbackMessage: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR
): NextResponse {
  // Log error for debugging (in production, use proper logging service)
  if (process.env.NODE_ENV === "development") {
    console.error("API Error:", error);
  }

  // Handle ValidationError with field details
  if (error instanceof ValidationError) {
    const response: {
      error: string;
      code: string;
      fields?: Record<string, string>;
    } = {
      error: error.message,
      code: error.code || "VALIDATION_ERROR",
    };

    if (error.fields && Object.keys(error.fields).length > 0) {
      response.fields = error.fields;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle RateLimitError with retry-after
  if (error instanceof RateLimitError) {
    const headers: Record<string, string> = {};
    if (error.retryAfter) {
      headers["Retry-After"] = String(error.retryAfter);
    }

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode, headers }
    );
  }

  // Handle other AppErrors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message || fallbackMessage,
      },
      { status: 500 }
    );
  }

  // Fallback for unknown errors
  return NextResponse.json(
    {
      error: fallbackMessage,
    },
    { status: 500 }
  );
}

/**
 * Create Success Response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    { status }
  );
}

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(
  handler: (req: Request, context?: Record<string, unknown>) => Promise<NextResponse>
) {
  return async (req: Request, context?: Record<string, unknown>) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
}

/**
 * Validation Error with Field-Level Details
 */
export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed. Please check your input.",
    public fields?: Record<string, string>
  ) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

/**
 * Unauthorized Error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * Forbidden Error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends AppError {
  constructor(
    message: string = "Too many requests. Please try again later.",
    public retryAfter?: number
  ) {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}

/**
 * Handle Prisma Errors with User-Friendly Messages
 */
export function handlePrismaError(error: unknown): never {
  // Check for Prisma-specific errors
  if (typeof error === "object" && error !== null && "code" in error) {
    const prismaError = error as { code: string; meta?: Record<string, unknown> };
    
    switch (prismaError.code) {
      case "P2002":
        throw new ConflictError(
          "This record already exists. Please use a different value."
        );
      case "P2025":
        throw new NotFoundError("The requested record was not found");
      case "P2003":
        throw new ValidationError(
          "Cannot complete this action because a related record is missing"
        );
      case "P2014":
        throw new ValidationError(
          "This action would violate a required relationship"
        );
      case "P2023":
        throw new ValidationError("The provided ID format is invalid");
      default:
        throw new AppError(
          "We couldn't complete your request. Please try again.",
          500
        );
    }
  }

  throw error;
}

/**
 * Convert Zod Error to ValidationError with Field Details
 */
export function handleZodError(error: unknown): never {
  // Dynamic import to avoid circular dependency
  const { ZodError } = require("zod");
  
  if (error instanceof ZodError) {
    const fields: Record<string, string> = {};
    
    error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      fields[path] = issue.message;
    });

    throw new ValidationError(
      "Please check your input and try again.",
      fields
    );
  }

  throw error;
}

