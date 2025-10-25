import { z } from "zod";

/**
 * Validation schema for analyzing food with Nutritionix
 */
export const analyzeFoodSchema = z.object({
  query: z
    .string()
    .min(2, "Food description must be at least 2 characters")
    .max(500, "Food description must be less than 500 characters")
    .trim(),
});

/**
 * Validation schema for creating a nutrition log
 */
export const createNutritionLogSchema = z.object({
  date: z.string().datetime().optional(),
  calories: z
    .number()
    .int("Calories must be a whole number")
    .min(0, "Calories cannot be negative")
    .max(10000, "Calories cannot exceed 10,000 per entry"),
  protein: z
    .number()
    .min(0, "Protein cannot be negative")
    .max(1000, "Protein cannot exceed 1000g"),
  carbs: z
    .number()
    .min(0, "Carbs cannot be negative")
    .max(2000, "Carbs cannot exceed 2000g"),
  fat: z
    .number()
    .min(0, "Fat cannot be negative")
    .max(500, "Fat cannot exceed 500g"),
  note: z
    .string()
    .max(500, "Note must be less than 500 characters")
    .trim()
    .optional(),
});

/**
 * Validation schema for updating a nutrition log
 */
export const updateNutritionLogSchema = createNutritionLogSchema.partial();

/**
 * Validation schema for querying nutrition logs
 */
export const queryNutritionLogsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .optional(),
});

// Type exports
export type AnalyzeFoodData = z.infer<typeof analyzeFoodSchema>;
export type CreateNutritionLogData = z.infer<typeof createNutritionLogSchema>;
export type UpdateNutritionLogData = z.infer<typeof updateNutritionLogSchema>;
export type QueryNutritionLogsData = z.infer<typeof queryNutritionLogsSchema>;

