/**
 * Exercise Hooks
 * Custom hooks for exercise-related operations
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";

/**
 * Fetch exercises with filters
 */
export function useExercises(params?: {
  bodyPart?: string;
  equipment?: string;
  target?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.EXERCISES(params),
    queryFn: () => api.exercises.getExercises(params),
  });
}

/**
 * Fetch single exercise
 */
export function useExercise(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.EXERCISE(id),
    queryFn: () => api.exercises.getExerciseById(id),
    enabled: !!id,
  });
}

/**
 * Fetch saved exercises
 */
export function useSavedExercises() {
  return useQuery({
    queryKey: QUERY_KEYS.SAVED_EXERCISES,
    queryFn: () => api.savedExercises.getSaved(),
  });
}

/**
 * Toggle save exercise (save/unsave)
 */
export function useToggleSaveExercise() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const saveMutation = useMutation({
    mutationFn: (exerciseId: string) => api.savedExercises.save(exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SAVED_EXERCISES });
      showToast("Exercise saved successfully", "success");
    },
    onError: () => {
      showToast("Failed to save exercise", "error");
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: (exerciseId: string) => api.savedExercises.unsave(exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SAVED_EXERCISES });
      showToast("Exercise removed from saved", "success");
    },
    onError: () => {
      showToast("Failed to unsave exercise", "error");
    },
  });

  const toggleSave = async (exerciseId: string, isSaved: boolean) => {
    if (isSaved) {
      await unsaveMutation.mutateAsync(exerciseId);
    } else {
      await saveMutation.mutateAsync(exerciseId);
    }
  };

  return {
    toggleSave,
    isLoading: saveMutation.isPending || unsaveMutation.isPending,
  };
}

/**
 * Check and sync exercises
 */
export function useExerciseSync() {
  const queryClient = useQueryClient();

  const { data: syncStatus, isLoading: checkingSync } = useQuery({
    queryKey: ["exercise-sync-status"],
    queryFn: () => api.exercises.checkSync(),
  });

  const syncMutation = useMutation({
    mutationFn: () => api.exercises.syncExercises(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercise-sync-status"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES() });
    },
  });

  return {
    syncStatus,
    isSyncing: syncMutation.isPending,
    isCheckingSync: checkingSync,
    syncExercises: syncMutation.mutate,
    syncError: syncMutation.error,
  };
}

