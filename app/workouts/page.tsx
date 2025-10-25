"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";

interface WorkoutTemplate {
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
}

export default function MyWorkoutsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const { data: templates, isLoading } = useQuery<{ templates: WorkoutTemplate[] }>({
    queryKey: ["workout-templates"],
    queryFn: async () => {
      const res = await fetch("/api/workout-templates");
      if (!res.ok) throw new Error("Failed to fetch workouts");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/workout-templates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete workout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-templates"] });
      showToast("Workout deleted successfully", "success");
    },
    onError: () => {
      showToast("Failed to delete workout", "error");
    },
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <img src="/logo.png" alt="Loading" className="h-40 w-40 animate-pulse" />
          </div>
          <p className="text-slate-600">Loading workouts...</p>
        </div>
      </div>
    );
  }

  const workouts = templates?.templates || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-slate-900">My Workouts</h1>
            <p className="text-slate-600">Manage and track your workout templates</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </Link>
            <Link
              href="/ai-builder"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-amber-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Workout
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {workouts.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 p-12 text-center">
            <div className="mb-6 text-6xl">💪</div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">No Workouts Yet</h3>
            <p className="mb-6 text-slate-600">Create your first workout using the AI Builder</p>
            <Link
              href="/ai-builder"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-amber-600"
            >
              🤖 Generate AI Workout
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-all duration-200 hover:shadow-2xl"
              >
                {/* Card Header */}
                <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                  <h3 className="mb-2 text-xl font-bold text-slate-900">{workout.name}</h3>
                  {workout.description && (
                    <p className="mb-4 text-sm text-slate-600">{workout.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      💪 {workout.exercises.length} exercises
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                      📅 {new Date(workout.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Exercise Preview / Expanded View */}
                <div className="p-6">
                  {expandedId === workout.id ? (
                    <div className="space-y-3">
                      {workout.exercises.map((ex, idx) => (
                        <div
                          key={ex.id}
                          className="flex items-start gap-3 rounded-lg bg-slate-50 p-3"
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{ex.exercise.name}</p>
                            <p className="text-xs text-slate-600">
                              {ex.sets} sets × {ex.reps} reps • {ex.restTime}s rest
                            </p>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => setExpandedId(null)}
                        className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Show less
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-3 text-sm text-slate-600">
                        {workout.exercises.slice(0, 3).map((ex) => ex.exercise.name).join(", ")}
                        {workout.exercises.length > 3 && ` +${workout.exercises.length - 3} more`}
                      </p>
                      <button
                        onClick={() => setExpandedId(workout.id)}
                        className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        View all exercises
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t border-slate-100 p-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/workouts/${workout.id}/active`}
                      className="flex-1 rounded-lg bg-green-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-green-600"
                    >
                      🏋️ Start Workout
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this workout?")) {
                          deleteMutation.mutate(workout.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 disabled:opacity-50"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

