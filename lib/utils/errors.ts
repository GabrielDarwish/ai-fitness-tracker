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
 * Error Response Builder
 */
export function createErrorResponse(
  error: unknown,
  fallbackMessage: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR
): NextResponse {
  console.error("Error:", error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message || fallbackMessage,
      },
      { status: 500 }
    );
  }

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
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
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
 * Handle Prisma Errors
 */
export function handlePrismaError(error: unknown): never {
  // Check for Prisma-specific errors
  if (typeof error === "object" && error !== null && "code" in error) {
    const prismaError = error as { code: string; meta?: Record<string, unknown> };
    
    switch (prismaError.code) {
      case "P2002":
        throw new ValidationError("A record with this value already exists");
      case "P2025":
        throw new NotFoundError("Record");
      case "P2003":
        throw new ValidationError("Related record not found");
      default:
        throw new AppError("Database operation failed", 500);
    }
  }

  throw error;
}

