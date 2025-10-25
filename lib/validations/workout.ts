import { z } from "zod";

/**
 * Validation schema for creating a workout template
 */
export const createWorkoutTemplateSchema = z.object({
  name: z
    .string()
    .min(3, "Workout name must be at least 3 characters")
    .max(100, "Workout name must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .trim()
    .optional(),
  exercises: z
    .array(
      z.object({
        exerciseId: z.string().min(1, "Exercise ID is required"),
        sets: z
          .number()
          .int("Sets must be a whole number")
          .min(1, "Must have at least 1 set")
          .max(10, "Cannot exceed 10 sets"),
        reps: z
          .string()
          .min(1, "Reps are required")
          .max(20, "Reps description too long")
          .trim(),
        restTime: z
          .number()
          .int("Rest time must be a whole number")
          .min(0, "Rest time cannot be negative")
          .max(600, "Rest time cannot exceed 10 minutes (600 seconds)"),
      })
    )
    .min(1, "Must include at least 1 exercise")
    .max(15, "Cannot exceed 15 exercises per workout"),
});

/**
 * Validation schema for updating a workout template
 */
export const updateWorkoutTemplateSchema = createWorkoutTemplateSchema.partial();

/**
 * Validation schema for creating a workout log
 */
export const createWorkoutLogSchema = z.object({
  templateId: z.string().optional(),
  date: z.string().datetime().optional(),
  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 minute")
    .max(480, "Duration cannot exceed 8 hours (480 minutes)")
    .optional(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .trim()
    .optional(),
  exercises: z
    .array(
      z.object({
        exerciseId: z.string().min(1, "Exercise ID is required"),
        sets: z
          .array(
            z.object({
              weight: z
                .number()
                .min(0, "Weight cannot be negative")
                .max(1000, "Weight cannot exceed 1000kg")
                .optional(),
              reps: z
                .number()
                .int("Reps must be a whole number")
                .min(0, "Reps cannot be negative")
                .max(1000, "Reps cannot exceed 1000"),
              restTime: z
                .number()
                .int("Rest time must be a whole number")
                .min(0, "Rest time cannot be negative")
                .max(600, "Rest time cannot exceed 10 minutes")
                .optional(),
            })
          )
          .min(1, "Must log at least 1 set per exercise"),
      })
    )
    .min(1, "Must log at least 1 exercise")
    .max(20, "Cannot log more than 20 exercises per workout"),
});

/**
 * Validation schema for updating a workout log
 */
export const updateWorkoutLogSchema = z.object({
  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 minute")
    .max(480, "Duration cannot exceed 8 hours")
    .optional(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .trim()
    .optional(),
});

/**
 * Validation schema for adding sets to a logged exercise
 */
export const addSetsSchema = z.object({
  sets: z
    .array(
      z.object({
        weight: z
          .number()
          .min(0, "Weight cannot be negative")
          .max(1000, "Weight cannot exceed 1000kg")
          .optional(),
        reps: z
          .number()
          .int("Reps must be a whole number")
          .min(0, "Reps cannot be negative")
          .max(1000, "Reps cannot exceed 1000"),
        restTime: z
          .number()
          .int("Rest time must be a whole number")
          .min(0, "Rest time cannot be negative")
          .max(600, "Rest time cannot exceed 10 minutes")
          .optional(),
      })
    )
    .min(1, "Must add at least 1 set")
    .max(15, "Cannot add more than 15 sets at once"),
});

// Type exports
export type CreateWorkoutTemplateData = z.infer<typeof createWorkoutTemplateSchema>;
export type UpdateWorkoutTemplateData = z.infer<typeof updateWorkoutTemplateSchema>;
export type CreateWorkoutLogData = z.infer<typeof createWorkoutLogSchema>;
export type UpdateWorkoutLogData = z.infer<typeof updateWorkoutLogSchema>;
export type AddSetsData = z.infer<typeof addSetsSchema>;

