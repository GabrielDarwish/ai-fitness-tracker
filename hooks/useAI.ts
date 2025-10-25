/**
 * AI Hooks
 * Custom hooks for AI-powered features
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

/**
 * Generate workout with AI
 */
export function useGenerateWorkout() {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: {
      goal: string;
      equipment: string[];
      duration: number;
      focusArea: "full-body" | "upper-body" | "lower-body" | "core";
    }) => api.ai.generateWorkout(data),
    onError: (error) => {
      showToast(
        error instanceof Error ? error.message : "Failed to generate workout",
        "error"
      );
    },
  });
}

/**
 * Get AI insights
 */
export function useAIInsights() {
  return useMutation({
    mutationFn: (focusArea?: string) => api.ai.getInsights(focusArea),
  });
}

