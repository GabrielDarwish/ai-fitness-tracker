import { z } from "zod";

/**
 * Common validation schemas used across multiple endpoints
 */

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z
    .number()
    .int("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .optional()
    .default(1),
  limit: z
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .optional()
    .default(20),
});

/**
 * Date range schema
 */
export const dateRangeSchema = z.object({
  startDate: z
    .string()
    .datetime("Start date must be a valid ISO datetime")
    .optional(),
  endDate: z
    .string()
    .datetime("End date must be a valid ISO datetime")
    .optional(),
});

/**
 * ID parameter schema
 */
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

/**
 * Sort schema
 */
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Type exports
export type PaginationData = z.infer<typeof paginationSchema>;
export type DateRangeData = z.infer<typeof dateRangeSchema>;
export type IdParamData = z.infer<typeof idParamSchema>;
export type SortData = z.infer<typeof sortSchema>;

