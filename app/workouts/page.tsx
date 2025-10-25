"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { 
  Target, 
  Dumbbell, 
  Trash2, 
  Play, 
  ChevronDown, 
  ChevronUp,
  ArrowLeft,
  Plus,
  Calendar
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import LoadingLogo from "@/components/ui/loading-logo";

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      return id;
    },
    // Optimistic update
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["workout-templates"] });
      
      // Snapshot previous value
      const previousTemplates = queryClient.getQueryData(["workout-templates"]);
      
      // Optimistically remove from cache
      queryClient.setQueryData(["workout-templates"], (old: any) => {
        if (!old || !old.templates) return old;
        return {
          ...old,
          templates: old.templates.filter((t: WorkoutTemplate) => t.id !== deletedId)
        };
      });
      
      return { previousTemplates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-templates"] });
      showToast("Workout deleted", "success");
      setDeleteModalOpen(false);
      setWorkoutToDelete(null);
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousTemplates) {
        queryClient.setQueryData(["workout-templates"], context.previousTemplates);
      }
      showToast("Failed to delete workout", "error");
      setDeleteModalOpen(false);
    },
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <LoadingLogo />
          <p className="text-slate-600">Loading workouts...</p>
        </div>
      </div>
    );
  }

  const workouts = templates?.templates || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center animate-slide-up">
          <div>
            <h1 className="mb-2 text-display">My Workouts</h1>
            <p className="text-lg text-slate-600">Manage and track your workout templates</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Dashboard
            </Link>
            <Link
              href="/ai-builder"
              className="group relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <span className="relative z-10 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Workout
              </span>
            </Link>
          </div>
        </div>

        {workouts.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-12 text-center animate-scale-in">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl shadow-green-500/30">
              <Dumbbell className="h-10 w-10 text-white" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-slate-900">No Workouts Yet</h3>
            <p className="mb-6 text-slate-600 max-w-md">Create your first workout using the AI Builder or browse our exercise library</p>
            <Link
              href="/ai-builder"
              className="group relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-amber-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/50 hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <span className="relative z-10 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Generate AI Workout
              </span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workouts.map((workout, index) => (
              <div
                key={workout.id}
                className="group relative animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-green-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
                
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="border-b border-slate-100 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                    <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-green-600 transition-colors">{workout.name}</h3>
                    {workout.description && (
                      <p className="mb-4 text-sm text-slate-600">{workout.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700">
                        <Dumbbell className="h-3.5 w-3.5" />
                        {workout.exercises.length} exercises
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(workout.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

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
                          className="group/btn w-full flex items-center justify-center gap-2 text-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <ChevronUp className="h-4 w-4 transition-transform group-hover/btn:-translate-y-0.5" />
                          Show less
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-3 text-sm text-slate-600 capitalize">
                          {workout.exercises.slice(0, 3).map((ex) => ex.exercise.name).join(", ")}
                          {workout.exercises.length > 3 && ` +${workout.exercises.length - 3} more`}
                        </p>
                        <button
                          onClick={() => setExpandedId(workout.id)}
                          className="group/btn w-full flex items-center justify-center gap-2 text-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          View all exercises
                          <ChevronDown className="h-4 w-4 transition-transform group-hover/btn:translate-y-0.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 p-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/workouts/${workout.id}/active`}
                        className="group/start relative overflow-hidden flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] active:scale-95"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/start:translate-x-[200%] transition-transform duration-700" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <Play className="h-4 w-4" />
                          Start Workout
                        </span>
                      </Link>
                      <button
                        onClick={() => {
                          setWorkoutToDelete({ id: workout.id, name: workout.name });
                          setDeleteModalOpen(true);
                        }}
                        disabled={deleteMutation.isPending}
                        className="rounded-xl border-2 border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 transition-all duration-300 hover:bg-red-50 hover:border-red-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isMounted && deleteModalOpen && workoutToDelete && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => {
            setDeleteModalOpen(false);
            setWorkoutToDelete(null);
          }}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="mb-4">
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-full bg-red-100">
                <Trash2 className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
                Delete Workout?
              </h3>
              <p className="text-sm text-slate-600 text-center">
                Are you sure you want to delete <span className="font-semibold text-slate-900">"{workoutToDelete.name}"</span>? This action cannot be undone.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setWorkoutToDelete(null);
                }}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (workoutToDelete) {
                    deleteMutation.mutate(workoutToDelete.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-red-600 hover:shadow-xl disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
