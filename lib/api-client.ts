/**
 * API Client
 * Type-safe API client wrapper with error handling
 */

import { API_ENDPOINTS } from "./constants";

/**
 * Custom API Error
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Base fetch wrapper with error handling
 */
async function fetchAPI<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: response.statusText,
      }));

      throw new APIError(
        error.error || error.message || "An error occurred",
        response.status,
        error.code
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(
      error instanceof Error ? error.message : "Network error",
      500
    );
  }
}

/**
 * Exercise API Client
 */
export const exerciseAPI = {
  /**
   * Get exercises with filters
   */
  getExercises: async (params?: {
    bodyPart?: string;
    equipment?: string;
    target?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    return fetchAPI<{
      exercises: Array<{
        id: string;
        name: string;
        gifUrl: string | null;
        bodyPart: string;
        equipment: string;
        target: string;
        instructions: string | null;
      }>;
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    }>(`${API_ENDPOINTS.EXERCISES}?${searchParams}`);
  },

  /**
   * Get exercise by ID
   */
  getExerciseById: async (id: string) => {
    return fetchAPI<{
      id: string;
      name: string;
      gifUrl: string | null;
      bodyPart: string;
      equipment: string;
      target: string;
      instructions: string | null;
    }>(`${API_ENDPOINTS.EXERCISES}/${id}`);
  },

  /**
   * Check exercise sync status
   */
  checkSync: async () => {
    return fetchAPI<{
      synced: boolean;
      count: number;
      error?: string;
    }>(API_ENDPOINTS.EXERCISES_CHECK_SYNC);
  },

  /**
   * Sync exercises from ExerciseDB
   */
  syncExercises: async () => {
    return fetchAPI<{
      success: boolean;
      count: number;
      message: string;
    }>(API_ENDPOINTS.EXERCISES_SYNC, {
      method: "POST",
    });
  },
};

/**
 * Saved Exercise API Client
 */
export const savedExerciseAPI = {
  /**
   * Get saved exercises
   */
  getSaved: async () => {
    return fetchAPI<{
      savedExercises: Array<{
        id: string;
        exerciseId: string;
        exercise: {
          id: string;
          name: string;
          gifUrl: string | null;
          bodyPart: string;
          equipment: string;
          target: string;
        };
      }>;
    }>(API_ENDPOINTS.SAVED_EXERCISES);
  },

  /**
   * Save exercise
   */
  save: async (exerciseId: string) => {
    return fetchAPI<{ success: boolean; message: string }>(
      API_ENDPOINTS.SAVED_EXERCISES,
      {
        method: "POST",
        body: JSON.stringify({ exerciseId }),
      }
    );
  },

  /**
   * Unsave exercise
   */
  unsave: async (exerciseId: string) => {
    return fetchAPI<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.SAVED_EXERCISES}?exerciseId=${exerciseId}`,
      {
        method: "DELETE",
      }
    );
  },
};

/**
 * Workout Template API Client
 */
export const workoutTemplateAPI = {
  /**
   * Get all workout templates
   */
  getTemplates: async () => {
    return fetchAPI<{
      templates: Array<{
        id: string;
        name: string;
        description: string | null;
        createdAt: string;
        exercises: Array<{
          id: string;
          sets: number;
          reps: string;
          restTime: number;
          exercise: {
            id: string;
            name: string;
            gifUrl: string | null;
            bodyPart: string;
            equipment: string;
            target: string;
          };
        }>;
      }>;
    }>(API_ENDPOINTS.WORKOUT_TEMPLATES);
  },

  /**
   * Create workout template
   */
  create: async (data: {
    name: string;
    description?: string;
    exercises: Array<{
      exerciseId: string;
      sets: number;
      reps: string;
      restTime: number;
    }>;
  }) => {
    return fetchAPI<{
      success: boolean;
      template: unknown;
    }>(API_ENDPOINTS.WORKOUT_TEMPLATES, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete workout template
   */
  delete: async (id: string) => {
    return fetchAPI<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.WORKOUT_TEMPLATES}/${id}`,
      {
        method: "DELETE",
      }
    );
  },
};

/**
 * Workout Log API Client
 */
export const workoutLogAPI = {
  /**
   * Start workout from template
   */
  start: async (templateId: string) => {
    return fetchAPI<{
      success: boolean;
      workoutLog: unknown;
    }>(API_ENDPOINTS.WORKOUT_LOGS, {
      method: "POST",
      body: JSON.stringify({ templateId }),
    });
  },

  /**
   * Get workout stats
   */
  getStats: async () => {
    return fetchAPI<{
      totalWorkouts: number;
      totalDuration: number;
      totalSets: number;
      recentWorkouts: unknown[];
    }>(API_ENDPOINTS.WORKOUT_LOG_STATS);
  },

  /**
   * Get workout history
   */
  getHistory: async () => {
    return fetchAPI<{
      workouts: unknown[];
    }>(API_ENDPOINTS.WORKOUT_LOG_HISTORY);
  },
};

/**
 * AI API Client
 */
export const aiAPI = {
  /**
   * Generate workout with AI
   */
  generateWorkout: async (data: {
    goal: string;
    equipment: string[];
    duration: number;
    focusArea: "full-body" | "upper-body" | "lower-body" | "core";
  }) => {
    return fetchAPI<{
      success: boolean;
      workout: {
        name: string;
        description: string;
        estimatedDuration: number;
        exercises: Array<{
          exerciseId: string;
          name: string;
          sets: number;
          reps: string;
          restTime: number;
          notes?: string;
        }>;
      };
    }>(API_ENDPOINTS.AI_GENERATE_WORKOUT, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get AI insights
   */
  getInsights: async (focusArea?: string) => {
    const searchParams = focusArea
      ? `?focusArea=${encodeURIComponent(focusArea)}`
      : "";
    return fetchAPI<{ insights: string }>(
      `${API_ENDPOINTS.AI_INSIGHTS}${searchParams}`
    );
  },
};

/**
 * User API Client
 */
export const userAPI = {
  /**
   * Get current user
   */
  getUser: async () => {
    return fetchAPI<{
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
    }>(API_ENDPOINTS.USER);
  },

  /**
   * Update user profile
   */
  update: async (data: {
    name?: string;
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    goals?: string;
    equipment?: string[];
    dietaryInfo?: string;
  }) => {
    return fetchAPI<{
      success: boolean;
      user: unknown;
    }>(API_ENDPOINTS.USER, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

/**
 * Unified API Client Export
 */
export const api = {
  exercises: exerciseAPI,
  savedExercises: savedExerciseAPI,
  workoutTemplates: workoutTemplateAPI,
  workoutLogs: workoutLogAPI,
  ai: aiAPI,
  user: userAPI,
};

