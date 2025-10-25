"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles, 
  Target, 
  Clock, 
  Dumbbell, 
  Zap,
  Save,
  AlertCircle 
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import LoadingLogo from "@/components/ui/loading-logo";

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const { data: userData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error("Failed to fetch user profile");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (userData?.user) {
      setFormData(prev => ({
        ...prev,
        goal: userData.user.goals || "",
        equipment: userData.user.equipment || [],
      }));
    }
  }, [userData]);

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

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!generatedWorkout) throw new Error("No workout to save");

      const exercisesForTemplate = generatedWorkout.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        restTime: ex.restTime,
      }));

      const res = await fetch("/api/workout-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generatedWorkout.name,
          description: generatedWorkout.description,
          exercises: exercisesForTemplate,
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
          <LoadingLogo />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10 animate-slide-up">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/40">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700">AI POWERED</span>
                </div>
                <h1 className="text-4xl font-bold text-gradient-amber">AI Workout Builder</h1>
                <p className="text-slate-600">Generate personalized workouts with artificial intelligence</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6 animate-scale-in delay-100">
            <div className="group relative">
              <div className="relative rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="h-6 w-6 text-amber-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Workout Preferences</h2>
                </div>

                <div className="space-y-4">
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

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Available Equipment ({formData.equipment.length} selected)
                    </label>
                    <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-3">
                      {userData?.user?.equipment && userData.user.equipment.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {userData.user.equipment.map((eq: string) => (
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

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !formData.goal || formData.equipment.length === 0}
                  className="group relative mt-6 w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 text-lg font-semibold text-white shadow-xl shadow-amber-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isGenerating ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating Workout...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Generate AI Workout
                        <Zap className="h-5 w-5" />
                      </>
                    )}
                  </span>
                </button>

                {generateError && (
                  <div className="mt-4 space-y-3 animate-scale-in">
                    <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-4 shadow-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <p className="text-sm font-semibold text-red-800">Error</p>
                      </div>
                      <p className="mt-2 text-sm text-red-600">{generateError}</p>
                    </div>
                    
                    {debugInfo && (
                      <details className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-lg">
                        <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-amber-800">
                          <Target className="h-4 w-4" />
                          Debug Information (click to expand)
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
          </div>

          <div className="animate-scale-in delay-200">
            {generatedWorkout ? (
              <div className="group relative">
                <div className="relative rounded-2xl border border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50 p-6 shadow-xl">
                  <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300">
                    <Sparkles className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-bold text-green-700">AI GENERATED</span>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="mb-2 text-2xl font-bold text-slate-900">{generatedWorkout.name}</h2>
                    <p className="text-slate-600">{generatedWorkout.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 px-3 py-1.5 text-sm font-semibold text-blue-700">
                        <Clock className="h-4 w-4" />
                        {generatedWorkout.estimatedDuration} min
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-50 to-green-100 border border-green-200 px-3 py-1.5 text-sm font-semibold text-green-700">
                        <Dumbbell className="h-4 w-4" />
                        {generatedWorkout.exercises.length} exercises
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {generatedWorkout.exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="group/exercise relative rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5"
                      >
                        <div className="flex gap-4">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-bold text-white shadow-md shadow-blue-500/30 transition-transform group-hover/exercise:scale-110">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-2 font-bold text-slate-900 capitalize group-hover/exercise:text-blue-600 transition-colors">{exercise.name}</h3>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="inline-flex items-center gap-1 text-slate-600">
                                <Target className="h-3.5 w-3.5" />
                                {exercise.sets} sets
                              </span>
                              <span className="inline-flex items-center gap-1 text-slate-600">
                                <Dumbbell className="h-3.5 w-3.5" />
                                {exercise.reps} reps
                              </span>
                              <span className="inline-flex items-center gap-1 text-slate-600">
                                <Clock className="h-3.5 w-3.5" />
                                {exercise.restTime}s rest
                              </span>
                            </div>
                            {exercise.notes && (
                              <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 border border-amber-200 p-2">
                                <Sparkles className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-amber-700">{exercise.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-hover/exercise:scale-x-100 transition-transform duration-300 origin-left rounded-b-xl" />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className="group relative mt-6 w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-lg font-semibold text-white shadow-xl shadow-green-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/50 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {saveMutation.isPending ? (
                        <>
                          <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          Save Workout Template
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[500px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-8">
                <div className="text-center">
                  <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/30">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900">No workout generated yet</h3>
                  <p className="text-slate-600">
                    Fill in your preferences and click "Generate AI Workout"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

