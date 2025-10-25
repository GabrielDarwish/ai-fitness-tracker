import { z } from "zod";

/**
 * Valid body parts (matching ExerciseDB API)
 */
export const validBodyParts = [
  "back",
  "cardio",
  "chest",
  "lower arms",
  "lower legs",
  "neck",
  "shoulders",
  "upper arms",
  "upper legs",
  "waist",
] as const;

/**
 * Valid equipment types (matching ExerciseDB API)
 */
export const validEquipment = [
  "assisted",
  "band",
  "barbell",
  "body weight",
  "bosu ball",
  "cable",
  "dumbbell",
  "elliptical machine",
  "ez barbell",
  "hammer",
  "kettlebell",
  "leverage machine",
  "medicine ball",
  "olympic barbell",
  "resistance band",
  "roller",
  "rope",
  "skierg machine",
  "sled machine",
  "smith machine",
  "stability ball",
  "stationary bike",
  "stepmill machine",
  "tire",
  "trap bar",
  "upper body ergometer",
  "weighted",
  "wheel roller",
] as const;

/**
 * Validation schema for querying exercises
 */
export const queryExercisesSchema = z.object({
  search: z
    .string()
    .max(100, "Search query must be less than 100 characters")
    .trim()
    .optional(),
  bodyPart: z.enum(validBodyParts).optional(),
  equipment: z.enum(validEquipment).optional(),
  target: z
    .string()
    .max(50, "Target must be less than 50 characters")
    .trim()
    .optional(),
  limit: z
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .optional(),
  offset: z
    .number()
    .int("Offset must be a whole number")
    .min(0, "Offset cannot be negative")
    .optional(),
});

/**
 * Validation schema for saving/unsaving exercises
 */
export const saveExerciseSchema = z.object({
  exerciseId: z.string().min(1, "Exercise ID is required"),
});

/**
 * Validation schema for syncing exercises from ExerciseDB
 */
export const syncExercisesSchema = z.object({
  limit: z
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(1500, "Cannot sync more than 1500 exercises at once")
    .optional(),
});

// Type exports
export type QueryExercisesData = z.infer<typeof queryExercisesSchema>;
export type SaveExerciseData = z.infer<typeof saveExerciseSchema>;
export type SyncExercisesData = z.infer<typeof syncExercisesSchema>;

