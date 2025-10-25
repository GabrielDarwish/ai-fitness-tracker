import { z } from "zod";

/**
 * Validation schema for onboarding Step 1: Profile Information
 */
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  age: z
    .number({ invalid_type_error: "Age must be a number" })
    .int("Age must be a whole number")
    .min(13, "You must be at least 13 years old")
    .max(120, "Age must be less than 120"),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  height: z
    .number({ invalid_type_error: "Height must be a number" })
    .min(50, "Height must be at least 50cm")
    .max(300, "Height must be less than 300cm"),
  weight: z
    .number({ invalid_type_error: "Weight must be a number" })
    .min(20, "Weight must be at least 20kg")
    .max(500, "Weight must be less than 500kg"),
});

/**
 * Validation schema for onboarding Step 2: Goals
 */
export const goalsSchema = z.object({
  goals: z.enum(
    ["weight-loss", "muscle-gain", "endurance", "flexibility", "general-fitness"],
    {
      errorMap: () => ({ message: "Please select a fitness goal" }),
    }
  ),
});

/**
 * Validation schema for onboarding Step 3: Equipment
 */
export const equipmentSchema = z.object({
  equipment: z
    .array(z.string())
    .min(1, "Please select at least one equipment option")
    .refine(
      (items) => items.every((item) => item.length > 0),
      "Invalid equipment selection"
    ),
});

/**
 * Complete onboarding validation schema (all steps combined)
 */
export const onboardingSchema = profileSchema
  .merge(goalsSchema)
  .merge(equipmentSchema);

export type ProfileData = z.infer<typeof profileSchema>;
export type GoalsData = z.infer<typeof goalsSchema>;
export type EquipmentData = z.infer<typeof equipmentSchema>;
export type OnboardingData = z.infer<typeof onboardingSchema>;

