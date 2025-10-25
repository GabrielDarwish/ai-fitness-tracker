/**
 * Application Constants
 * Centralized constants, enums, and configuration values
 */

/**
 * Exercise Categories
 */
export const BODY_PARTS = [
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

export const EQUIPMENT_TYPES = [
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

export const TARGET_MUSCLES = [
  "abs",
  "adductors",
  "abductors",
  "biceps",
  "calves",
  "cardiovascular system",
  "delts",
  "forearms",
  "glutes",
  "hamstrings",
  "lats",
  "levator scapulae",
  "pectorals",
  "quads",
  "serratus anterior",
  "spine",
  "traps",
  "triceps",
  "upper back",
] as const;

/**
 * User Goals
 */
export const FITNESS_GOALS = [
  "weight-loss",
  "muscle-gain",
  "endurance",
  "strength",
  "flexibility",
  "general-fitness",
] as const;

export const GOAL_LABELS: Record<(typeof FITNESS_GOALS)[number], string> = {
  "weight-loss": "Weight Loss",
  "muscle-gain": "Muscle Gain",
  endurance: "Endurance",
  strength: "Strength",
  flexibility: "Flexibility",
  "general-fitness": "General Fitness",
};

/**
 * Workout Focus Areas
 */
export const FOCUS_AREAS = [
  "full-body",
  "upper-body",
  "lower-body",
  "core",
] as const;

export const FOCUS_AREA_LABELS: Record<(typeof FOCUS_AREAS)[number], string> = {
  "full-body": "Full Body",
  "upper-body": "Upper Body",
  "lower-body": "Lower Body",
  core: "Core",
};

/**
 * Gender Options
 */
export const GENDERS = ["male", "female", "other"] as const;

export const GENDER_LABELS: Record<(typeof GENDERS)[number], string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

/**
 * Pagination
 */
export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;

/**
 * API Configuration
 */
export const API_ENDPOINTS = {
  // Exercises
  EXERCISES: "/api/exercises",
  EXERCISES_SYNC: "/api/exercises/sync",
  EXERCISES_CHECK_SYNC: "/api/exercises/check-sync",
  SAVED_EXERCISES: "/api/saved-exercises",

  // Workouts
  WORKOUT_TEMPLATES: "/api/workout-templates",
  WORKOUT_LOGS: "/api/workout-logs",
  WORKOUT_LOG_STATS: "/api/workout-logs/stats",
  WORKOUT_LOG_HISTORY: "/api/workout-logs/history",

  // AI
  AI_GENERATE_WORKOUT: "/api/ai/generate-workout",
  AI_INSIGHTS: "/api/ai/insights",
  AI_PROGRESS_INSIGHTS: "/api/ai/progress-insights",
  AI_FORM_TIPS: "/api/ai/form-tips",

  // Nutrition
  NUTRITION_ANALYZE: "/api/nutrition/analyze",
  NUTRITION_LOGS: "/api/nutrition/logs",

  // User
  USER: "/api/user",
} as const;

/**
 * Query Keys for React Query
 * Centralized query keys for consistent caching
 */
export const QUERY_KEYS = {
  // Exercises
  EXERCISES: (params?: Record<string, unknown>) => ["exercises", params],
  EXERCISE: (id: string) => ["exercise", id],
  SAVED_EXERCISES: ["saved-exercises"],
  EXERCISE_SYNC: ["exercise-sync-status"],

  // Workouts
  WORKOUT_TEMPLATES: ["workout-templates"],
  WORKOUT_TEMPLATE: (id: string) => ["workout-template", id],
  WORKOUT_LOGS: ["workout-logs"],
  WORKOUT_LOG: (id: string) => ["workout-log", id],
  WORKOUT_STATS: ["workout-stats"],
  WORKOUT_HISTORY: ["workout-history"],

  // Nutrition
  NUTRITION_LOGS: ["nutrition-logs"],

  // User
  USER: ["user"],
  USER_PROFILE: ["user-profile"],
  
  // AI
  AI_INSIGHTS: ["ai-insights"],
  AI_PROGRESS_INSIGHTS: ["ai-progress-insights"],
  AI_FORM_TIPS: (exerciseId: string) => ["ai-form-tips", exerciseId],
  
  // Dashboard
  DASHBOARD: ["dashboard"],
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  // Auth
  UNAUTHORIZED: "You must be signed in to access this resource",
  SESSION_NOT_FOUND: "Session not found",

  // Generic
  INTERNAL_SERVER_ERROR: "An unexpected error occurred. Please try again.",
  INVALID_REQUEST: "Invalid request data",
  NOT_FOUND: "Resource not found",

  // Exercises
  EXERCISES_FETCH_FAILED: "Failed to fetch exercises",
  EXERCISE_NOT_FOUND: "Exercise not found",
  EXERCISE_SAVE_FAILED: "Failed to save exercise",

  // Workouts
  WORKOUT_TEMPLATE_NOT_FOUND: "Workout template not found",
  WORKOUT_TEMPLATE_CREATE_FAILED: "Failed to create workout template",
  WORKOUT_LOG_CREATE_FAILED: "Failed to create workout log",

  // AI
  AI_GENERATION_FAILED: "Failed to generate workout with AI",
  AI_NOT_CONFIGURED: "AI features are not configured",
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  EXERCISE_SAVED: "Exercise saved successfully",
  EXERCISE_UNSAVED: "Exercise removed from saved",
  WORKOUT_CREATED: "Workout created successfully",
  WORKOUT_DELETED: "Workout deleted successfully",
  WORKOUT_STARTED: "Workout started successfully",
  WORKOUT_COMPLETED: "Workout completed successfully",
  PROFILE_UPDATED: "Profile updated successfully",
} as const;

/**
 * Routes
 */
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  SIGNIN: "/auth/signin",
  ONBOARDING: "/onboarding",

  // Features
  LIBRARY: "/library",
  LIBRARY_EXERCISE: (id: string) => `/library/${id}`,
  AI_BUILDER: "/ai-builder",
  WORKOUTS: "/workouts",
  WORKOUT_ACTIVE: (id: string) => `/workouts/${id}/active`,
  WORKOUT_SUMMARY: (id: string) => `/workouts/summary/${id}`,
  CALENDAR: "/calendar",
  NUTRITION: "/nutrition",
  PROGRESS: "/progress",
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  THEME: "fitness-tracker-theme",
  ACTIVE_WORKOUT: "fitness-tracker-active-workout",
} as const;

/**
 * Date/Time Formats
 */
export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  FULL: "MMMM dd, yyyy",
  SHORT: "MM/dd/yyyy",
  ISO: "yyyy-MM-dd",
} as const;

/**
 * Workout Defaults
 */
export const WORKOUT_DEFAULTS = {
  REST_TIME: 60, // seconds
  SETS: 3,
  REPS: "10-12",
  DURATION: 45, // minutes
} as const;

/**
 * Type Exports
 */
export type BodyPart = (typeof BODY_PARTS)[number];
export type Equipment = (typeof EQUIPMENT_TYPES)[number];
export type TargetMuscle = (typeof TARGET_MUSCLES)[number];
export type FitnessGoal = (typeof FITNESS_GOALS)[number];
export type FocusArea = (typeof FOCUS_AREAS)[number];
export type Gender = (typeof GENDERS)[number];

