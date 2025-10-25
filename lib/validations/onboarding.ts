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
    .number()
    .int("Age must be a whole number")
    .min(13, "You must be at least 13 years old")
    .max(120, "Age must be less than 120"),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]),
  height: z
    .number()
    .min(50, "Height must be at least 50cm")
    .max(300, "Height must be less than 300cm"),
  weight: z
    .number()
    .min(20, "Weight must be at least 20kg")
    .max(500, "Weight must be less than 500kg"),
});

/**
 * Validation schema for onboarding Step 2: Goals
 */
export const goalsSchema = z.object({
  goals: z.enum(["weight-loss", "muscle-gain", "endurance", "flexibility", "general-fitness"]),
});

/**
 * Valid equipment types (matching ExerciseDB API exactly)
 */
const validEquipment = [
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
 * Validation schema for onboarding Step 3: Equipment
 */
export const equipmentSchema = z.object({
  equipment: z
    .array(z.enum(validEquipment))
    .min(1, "Please select at least one equipment option"),
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

