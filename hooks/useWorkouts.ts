/**
 * Workout Hooks
 * Custom hooks for workout-related operations
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";

/**
 * Fetch workout templates
 */
export function useWorkoutTemplates() {
  return useQuery({
    queryKey: QUERY_KEYS.WORKOUT_TEMPLATES,
    queryFn: () => api.workoutTemplates.getTemplates(),
  });
}

/**
 * Create workout template
 */
export function useCreateWorkoutTemplate() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      exercises: Array<{
        exerciseId: string;
        sets: number;
        reps: string;
        restTime: number;
      }>;
    }) => api.workoutTemplates.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TEMPLATES });
      showToast("Workout created successfully", "success");
      router.push(ROUTES.WORKOUTS);
    },
    onError: (error) => {
      showToast(
        error instanceof Error ? error.message : "Failed to create workout",
        "error"
      );
    },
  });
}

/**
 * Delete workout template
 */
export function useDeleteWorkoutTemplate() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.workoutTemplates.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TEMPLATES });
      showToast("Workout deleted successfully", "success");
    },
    onError: () => {
      showToast("Failed to delete workout", "error");
    },
  });
}

/**
 * Start workout from template
 */
export function useStartWorkout() {
  const router = useRouter();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (templateId: string) => api.workoutLogs.start(templateId),
    onSuccess: (data) => {
      showToast("Workout started!", "success");
      // Navigate to active workout page
      // router.push(ROUTES.WORKOUT_ACTIVE(data.workoutLog.id));
    },
    onError: () => {
      showToast("Failed to start workout", "error");
    },
  });
}

/**
 * Fetch workout statistics
 */
export function useWorkoutStats() {
  return useQuery({
    queryKey: QUERY_KEYS.WORKOUT_STATS,
    queryFn: () => api.workoutLogs.getStats(),
  });
}

/**
 * Fetch workout history
 */
export function useWorkoutHistory() {
  return useQuery({
    queryKey: QUERY_KEYS.WORKOUT_HISTORY,
    queryFn: () => api.workoutLogs.getHistory(),
  });
}

