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
 * Toggle save exercise (save/unsave) with optimistic updates
 */
export function useToggleSaveExercise() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const saveMutation = useMutation({
    mutationFn: (exerciseId: string) => api.savedExercises.save(exerciseId),
    // Optimistic update
    onMutate: async (exerciseId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.SAVED_EXERCISES });
      
      // Snapshot previous value
      const previousSaved = queryClient.getQueryData(QUERY_KEYS.SAVED_EXERCISES);
      
      // Optimistically update to the new value
      queryClient.setQueryData(QUERY_KEYS.SAVED_EXERCISES, (old: any) => {
        if (!old || !old.savedExercises) return old;
        return {
          ...old,
          savedExercises: [
            ...old.savedExercises,
            { exerciseId, exercise: null } // Temporary entry
          ]
        };
      });
      
      // Also update individual exercise queries
      queryClient.setQueryData(QUERY_KEYS.EXERCISE(exerciseId), (old: any) => {
        if (!old) return old;
        return { ...old, isSaved: true };
      });
      
      return { previousSaved };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SAVED_EXERCISES });
      showToast("Exercise saved", "success");
    },
    onError: (_error, _exerciseId, context) => {
      // Rollback on error
      if (context?.previousSaved) {
        queryClient.setQueryData(QUERY_KEYS.SAVED_EXERCISES, context.previousSaved);
      }
      showToast("Failed to save exercise", "error");
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: (exerciseId: string) => api.savedExercises.unsave(exerciseId),
    // Optimistic update
    onMutate: async (exerciseId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.SAVED_EXERCISES });
      
      // Snapshot previous value
      const previousSaved = queryClient.getQueryData(QUERY_KEYS.SAVED_EXERCISES);
      
      // Optimistically remove from saved
      queryClient.setQueryData(QUERY_KEYS.SAVED_EXERCISES, (old: any) => {
        if (!old || !old.savedExercises) return old;
        return {
          ...old,
          savedExercises: old.savedExercises.filter(
            (item: any) => item.exerciseId !== exerciseId
          )
        };
      });
      
      // Also update individual exercise queries
      queryClient.setQueryData(QUERY_KEYS.EXERCISE(exerciseId), (old: any) => {
        if (!old) return old;
        return { ...old, isSaved: false };
      });
      
      return { previousSaved };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SAVED_EXERCISES });
      showToast("Exercise removed", "success");
    },
    onError: (_error, _exerciseId, context) => {
      // Rollback on error
      if (context?.previousSaved) {
        queryClient.setQueryData(QUERY_KEYS.SAVED_EXERCISES, context.previousSaved);
      }
      showToast("Failed to remove exercise", "error");
    },
  });

  const toggleSave = (exerciseId: string, isSaved: boolean) => {
    if (isSaved) {
      unsaveMutation.mutate(exerciseId);
    } else {
      saveMutation.mutate(exerciseId);
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
    queryKey: QUERY_KEYS.EXERCISE_SYNC,
    queryFn: () => api.exercises.checkSync(),
  });

  const syncMutation = useMutation({
    mutationFn: () => api.exercises.syncExercises(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISE_SYNC });
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

