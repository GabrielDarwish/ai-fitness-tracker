"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";

interface GeneratedExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  restTime: number;
  notes?: string;
}

interface GeneratedWorkout {
  name: string;
  description: string;
  estimatedDuration: number;
  exercises: GeneratedExercise[];
}

export default function AIWorkoutBuilderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    goal: "",
    equipment: [] as string[],
    duration: 30,
    focusArea: "full-body" as "full-body" | "upper-body" | "lower-body" | "core",
  });

  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch user profile to pre-fill form
  const { data: userData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error("Failed to fetch user profile");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  // Auto-fill form when user data loads
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        goal: userData.goals || "",
        equipment: userData.equipment || [],
      }));
    }
  }, [userData]);

  // Generate workout mutation
  const handleGenerate = async () => {
    if (!formData.goal || formData.equipment.length === 0) {
      setGenerateError("Please fill in all fields");
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    setGeneratedWorkout(null);
    setDebugInfo(null);

    try {
      const res = await fetch("/api/ai/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setDebugInfo(data.debug || null);
        throw new Error(data.message || "Failed to generate workout");
      }

      setGeneratedWorkout(data.workout);
    } catch (error: any) {
      console.error("Error generating workout:", error);
      setGenerateError(error.message || "Failed to generate workout. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save workout mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!generatedWorkout) throw new Error("No workout to save");

      const res = await fetch("/api/workout-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generatedWorkout.name,
          description: generatedWorkout.description,
          exercises: generatedWorkout.exercises,
        }),
      });

      if (!res.ok) throw new Error("Failed to save workout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-templates"] });
      showToast("Workout saved successfully! 🎉", "success");
      setTimeout(() => {
        router.push("/workouts");
      }, 1000);
    },
    onError: (error: any) => {
      showToast(error.message || "Failed to save workout", "error");
    },
  });

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <img src="/logo.png" alt="Loading" className="h-40 w-40 animate-pulse" />
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl shadow-lg">
              🤖
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">AI Workout Builder</h1>
              <p className="text-slate-600">Generate personalized workouts powered by AI</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Form */}
          <div className="space-y-6">
            {/* Form Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">Workout Preferences</h2>

              <div className="space-y-4">
                {/* Goal */}
                <div>
                  <label htmlFor="goal" className="mb-2 block text-sm font-medium text-slate-700">
                    Fitness Goal
                  </label>
                  <select
                    id="goal"
                    value={formData.goal}
                    onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select your goal</option>
                    <option value="weight-loss">Weight Loss</option>
                    <option value="muscle-gain">Muscle Gain</option>
                    <option value="endurance">Endurance</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="general-fitness">General Fitness</option>
                  </select>
                </div>

                {/* Focus Area */}
                <div>
                  <label htmlFor="focusArea" className="mb-2 block text-sm font-medium text-slate-700">
                    Focus Area
                  </label>
                  <select
                    id="focusArea"
                    value={formData.focusArea}
                    onChange={(e) => setFormData(prev => ({ ...prev, focusArea: e.target.value as any }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="full-body">Full Body</option>
                    <option value="upper-body">Upper Body</option>
                    <option value="lower-body">Lower Body</option>
                    <option value="core">Core</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label htmlFor="duration" className="mb-2 block text-sm font-medium text-slate-700">
                    Duration: {formData.duration} minutes
                  </label>
                  <input
                    type="range"
                    id="duration"
                    min="15"
                    max="90"
                    step="15"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>15 min</span>
                    <span>45 min</span>
                    <span>90 min</span>
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Available Equipment ({formData.equipment.length} selected)
                  </label>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-3">
                    {userData?.equipment && userData.equipment.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {userData.equipment.map((eq: string) => (
                          <span
                            key={eq}
                            className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No equipment selected during onboarding</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !formData.goal || formData.equipment.length === 0}
                className="mt-6 w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:from-amber-600 hover:to-orange-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Workout...
                  </span>
                ) : (
                  "✨ Generate AI Workout"
                )}
              </button>

              {generateError && (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-800">❌ Error</p>
                    <p className="mt-1 text-sm text-red-600">{generateError}</p>
                  </div>
                  
                  {debugInfo && (
                    <details className="rounded-lg bg-amber-50 p-4">
                      <summary className="cursor-pointer text-sm font-semibold text-amber-800">
                        🔍 Debug Information (click to expand)
                      </summary>
                      <div className="mt-3 space-y-2 text-xs text-amber-900">
                        <div>
                          <strong>AI Suggested Exercises:</strong>
                          <ul className="ml-4 mt-1 list-disc">
                            {debugInfo.aiSuggested?.map((name: string, i: number) => (
                              <li key={i}>{name}</li>
                            ))}
                          </ul>
                        </div>
                        {debugInfo.unmatchedExercises?.length > 0 && (
                          <div>
                            <strong>Unmatched:</strong>
                            <ul className="ml-4 mt-1 list-disc">
                              {debugInfo.unmatchedExercises.map((name: string, i: number) => (
                                <li key={i} className="text-red-700">{name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <strong>Total exercises available:</strong> {debugInfo.totalAvailable || 0}
                        </div>
                        <div className="mt-3 rounded bg-amber-100 p-2">
                          <strong>💡 Tip:</strong> Visit the <a href="/library" className="underline">Exercise Library</a> to ensure exercises are synced from ExerciseDB.
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Generated Workout */}
          <div>
            {generatedWorkout ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-slate-900">{generatedWorkout.name}</h2>
                    <p className="text-slate-600">{generatedWorkout.description}</p>
                    <div className="mt-3 flex gap-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                        ⏱️ {generatedWorkout.estimatedDuration} min
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                        💪 {generatedWorkout.exercises.length} exercises
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-4">
                  {generatedWorkout.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-2 font-bold text-slate-900">{exercise.name}</h3>
                          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                            <span>📊 {exercise.sets} sets</span>
                            <span>🔁 {exercise.reps} reps</span>
                            <span>⏸️ {exercise.restTime}s rest</span>
                          </div>
                          {exercise.notes && (
                            <p className="mt-2 text-sm italic text-slate-500">💡 {exercise.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Save Button */}
                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="mt-6 w-full rounded-lg bg-green-500 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-green-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saveMutation.isPending ? "Saving..." : "💾 Save Workout Template"}
                </button>
              </div>
            ) : (
              <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50">
                <div className="text-center">
                  <div className="mb-4 text-6xl">🤖</div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900">Ready to Generate</h3>
                  <p className="text-slate-600">Fill in your preferences and click "Generate AI Workout"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

