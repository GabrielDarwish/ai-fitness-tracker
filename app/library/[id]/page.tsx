"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Exercise {
  id: string;
  apiId: string | null;
  name: string;
  gifUrl: string | null;
  bodyPart: string;
  equipment: string;
  target: string;
  instructions: string | null;
}

interface ExerciseDetailResponse {
  exercise: Exercise;
  isSaved: boolean;
}

export default function ExerciseDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const exerciseId = params.id as string;

  const [showAiTips, setShowAiTips] = useState(false);
  const [aiTips, setAiTips] = useState<string | null>(null);
  const [loadingTips, setLoadingTips] = useState(false);

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  // Fetch exercise details
  const { data, isLoading, error } = useQuery<ExerciseDetailResponse>({
    queryKey: ["exercise", exerciseId],
    queryFn: async () => {
      const res = await fetch(`/api/exercises/${exerciseId}`);
      if (!res.ok) throw new Error("Failed to fetch exercise");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  // Save exercise mutation
  const saveMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const res = await fetch("/api/saved-exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId }),
      });
      if (!res.ok) throw new Error("Failed to save exercise");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercise", exerciseId] });
      queryClient.invalidateQueries({ queryKey: ["saved-exercises"] });
    },
  });

  // Unsave exercise mutation
  const unsaveMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const res = await fetch(`/api/saved-exercises?exerciseId=${exerciseId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to unsave exercise");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercise", exerciseId] });
      queryClient.invalidateQueries({ queryKey: ["saved-exercises"] });
    },
  });

  const handleToggleSave = async () => {
    if (data?.isSaved) {
      await unsaveMutation.mutateAsync(exerciseId);
    } else {
      await saveMutation.mutateAsync(exerciseId);
    }
  };

  const handleGetAiTips = async () => {
    if (!data?.exercise) return;

    setLoadingTips(true);
    setShowAiTips(true);

    try {
      const res = await fetch("/api/ai/form-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseName: data.exercise.name,
          bodyPart: data.exercise.bodyPart,
          target: data.exercise.target,
          equipment: data.exercise.equipment,
        }),
      });

      const result = await res.json();
      setAiTips(result.tips || "No tips available at this time.");
    } catch (error) {
      console.error("Error fetching AI tips:", error);
      setAiTips("Failed to generate AI tips. Please try again later.");
    } finally {
      setLoadingTips(false);
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <img 
              src="/logo.png" 
              alt="Loading" 
              className="h-40 w-40 animate-pulse"
            />
          </div>
          <p className="text-slate-600">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <img 
              src="/logo.png" 
              alt="Not found" 
              className="h-40 w-40 opacity-50"
            />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Exercise Not Found</h2>
          <p className="mb-6 text-slate-600">The exercise you're looking for doesn't exist.</p>
          <Link
            href="/library"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-600"
          >
            ← Back to Library
          </Link>
        </div>
      </div>
    );
  }

  const { exercise, isSaved } = data;
  const instructions = exercise.instructions?.split("\n").filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/library"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Library
        </Link>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Media */}
          <div className="space-y-6">
            {/* Exercise GIF */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="relative aspect-square w-full bg-slate-100">
                {exercise.gifUrl ? (
                  <img
                    src={exercise.gifUrl}
                    alt={exercise.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-6xl text-slate-400">
                    💪
                  </div>
                )}
              </div>
            </div>

            {/* Save Button - Desktop */}
            <button
              onClick={handleToggleSave}
              disabled={saveMutation.isPending || unsaveMutation.isPending}
              className={`hidden w-full items-center justify-center gap-2 rounded-lg px-6 py-4 text-sm font-semibold shadow-md transition-all duration-200 lg:flex ${
                isSaved
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "border-2 border-slate-200 bg-white text-slate-700 hover:border-red-500 hover:bg-red-50 hover:text-red-600"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <svg className="h-5 w-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {isSaved ? "Saved to Favorites" : "Save to Favorites"}
            </button>
          </div>

          {/* Right Column: Info */}
          <div className="space-y-6">
            {/* Exercise Name */}
            <div>
              <h1 className="mb-4 text-4xl font-bold text-slate-900">{exercise.name}</h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                  {exercise.bodyPart}
                </span>
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                  {exercise.equipment}
                </span>
                <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700">
                  Target: {exercise.target}
                </span>
              </div>
            </div>

            {/* Save Button - Mobile */}
            <button
              onClick={handleToggleSave}
              disabled={saveMutation.isPending || unsaveMutation.isPending}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-4 text-sm font-semibold shadow-md transition-all duration-200 lg:hidden ${
                isSaved
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "border-2 border-slate-200 bg-white text-slate-700 hover:border-red-500 hover:bg-red-50 hover:text-red-600"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <svg className="h-5 w-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {isSaved ? "Saved to Favorites" : "Save to Favorites"}
            </button>

            {/* Instructions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">How to Perform</h2>
              {instructions.length > 0 ? (
                <ul className="space-y-3">
                  {instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3 text-slate-700">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{instruction}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-600">No instructions available for this exercise.</p>
              )}
            </div>

            {/* AI Form Tips */}
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-xl">
                  🤖
                </div>
                <h2 className="text-2xl font-bold text-amber-900">AI Form Tips</h2>
              </div>

              {!showAiTips ? (
                <button
                  onClick={handleGetAiTips}
                  className="w-full rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-amber-600 hover:shadow-lg"
                >
                  Get AI-Powered Form Tips
                </button>
              ) : loadingTips ? (
                <div className="flex items-center justify-center gap-3 py-4">
                  <svg className="h-6 w-6 animate-spin text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-amber-800">Generating tips...</span>
                </div>
              ) : (
                <div className="text-amber-900">
                  {aiTips?.split('\n').map((line, index) => {
                    const trimmedLine = line.trim();
                    
                    // Skip empty lines
                    if (!trimmedLine) return null;
                    
                    // Handle bullet points (lines starting with *)
                    if (trimmedLine.startsWith('*')) {
                      const content = trimmedLine.replace(/^\*\s+/, '');
                      // Convert **text** to bold
                      const parts = content.split(/(\*\*.*?\*\*)/g);
                      
                      return (
                        <div key={index} className="mb-3 flex gap-3">
                          <span className="text-amber-600 flex-shrink-0">•</span>
                          <span className="leading-relaxed">
                            {parts.map((part, i) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={i}>{part.slice(2, -2)}</strong>;
                              }
                              return <span key={i}>{part}</span>;
                            })}
                          </span>
                        </div>
                      );
                    }
                    
                    // Regular paragraph
                    return (
                      <p key={index} className="mb-3 leading-relaxed">
                        {trimmedLine}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

