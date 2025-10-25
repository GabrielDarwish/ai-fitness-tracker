/**
 * Validation Utilities
 * Helper functions for input validation
 */

import { ValidationError } from "./errors";

/**
 * Parse and Validate JSON Body
 */
export async function parseRequestBody<T>(req: Request): Promise<T> {
  try {
    const body = await req.json();
    return body as T;
  } catch (error) {
    throw new ValidationError("Invalid JSON in request body");
  }
}

/**
 * Validate Required Fields
 */
export function validateRequiredFields(
  data: Record<string, any>,
  fields: string[]
): void {
  const missing = fields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === "";
  });

  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(", ")}`,
      Object.fromEntries(missing.map((field) => [field, "This field is required"]))
    );
  }
}

/**
 * Validate Pagination Parameters
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}

export function validatePagination(
  searchParams: URLSearchParams,
  defaultLimit: number = 24,
  maxLimit: number = 100
): PaginationParams {
  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get("limit") || String(defaultLimit))),
    maxLimit
  );
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"));

  return { limit, offset };
}

/**
 * Validate Enum Value
 */
export function validateEnum<T extends string>(
  value: string,
  enumValues: readonly T[],
  fieldName: string
): T {
  if (!enumValues.includes(value as T)) {
    throw new ValidationError(
      `Invalid ${fieldName}. Must be one of: ${enumValues.join(", ")}`
    );
  }
  return value as T;
}

/**
 * Validate Positive Number
 */
export function validatePositiveNumber(
  value: unknown,
  fieldName: string
): number {
  const num = Number(value);
  
  if (isNaN(num) || num <= 0) {
    throw new ValidationError(`${fieldName} must be a positive number`);
  }

  return num;
}

/**
 * Validate Array
 */
export function validateArray<T>(
  value: unknown,
  fieldName: string,
  minLength: number = 1
): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`);
  }

  if (value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must contain at least ${minLength} item(s)`
    );
  }

  return value;
}

