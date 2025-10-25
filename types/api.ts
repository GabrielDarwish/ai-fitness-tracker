/**
 * API Request & Response Types
 * Type definitions for all API endpoints
 */

import {
  Exercise,
  WorkoutTemplate,
  WorkoutTemplateWithExercises,
  SavedExerciseWithExercise,
  WorkoutLogWithExercises,
} from "./entities";

/**
 * Common API Response Types
 */
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Exercise API Types
 */
export interface GetExercisesParams {
  bodyPart?: string;
  equipment?: string;
  target?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetExercisesResponse extends PaginatedResponse<Exercise> {
  exercises: Exercise[];
}

export interface ExerciseSyncResponse {
  synced: boolean;
  count: number;
  error?: string;
}

/**
 * Saved Exercise API Types
 */
export interface SaveExerciseRequest {
  exerciseId: string;
}

export interface GetSavedExercisesResponse {
  savedExercises: SavedExerciseWithExercise[];
}

/**
 * Workout Template API Types
 */
export interface CreateWorkoutTemplateRequest {
  name: string;
  description?: string;
  exercises: Array<{
    exerciseId: string;
    sets: number;
    reps: string;
    restTime: number;
  }>;
}

export interface GetWorkoutTemplatesResponse {
  templates: WorkoutTemplateWithExercises[];
}

/**
 * Workout Log API Types
 */
export interface CreateWorkoutLogRequest {
  templateId: string;
}

export interface CreateWorkoutLogResponse {
  success: boolean;
  workoutLog: WorkoutLogWithExercises;
}

export interface UpdateWorkoutLogRequest {
  duration?: number;
  notes?: string;
}

export interface AddSetRequest {
  loggedExerciseId: string;
  weight?: number;
  reps: number;
  restTime?: number;
}

export interface WorkoutStatsResponse {
  totalWorkouts: number;
  totalDuration: number;
  totalSets: number;
  recentWorkouts: WorkoutLogWithExercises[];
}

/**
 * AI API Types
 */
export interface GenerateWorkoutRequest {
  goal: string;
  equipment: string[];
  duration: number;
  focusArea: "full-body" | "upper-body" | "lower-body" | "core";
}

export interface GeneratedExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  restTime: number;
  notes?: string;
}

export interface GenerateWorkoutResponse {
  success: boolean;
  workout: {
    name: string;
    description: string;
    estimatedDuration: number;
    exercises: GeneratedExercise[];
  };
}

export interface GetInsightsRequest {
  focusArea?: string;
}

export interface GetInsightsResponse {
  insights: string;
}

/**
 * Nutrition API Types
 */
export interface AnalyzeNutritionRequest {
  foodDescription: string;
}

export interface AnalyzeNutritionResponse {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

export interface CreateNutritionLogRequest {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
}

export interface GetNutritionLogsResponse {
  logs: Array<{
    id: string;
    date: Date;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    note: string | null;
  }>;
}

/**
 * User/Profile API Types
 */
export interface UpdateUserRequest {
  name?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  goals?: string;
  equipment?: string[];
  dietaryInfo?: string;
}

export interface GetUserResponse {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    age: number | null;
    gender: string | null;
    height: number | null;
    weight: number | null;
    goals: string | null;
    equipment: string[];
    dietaryInfo: string | null;
  };
}

