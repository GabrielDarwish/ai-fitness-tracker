"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import LoadingLogo from "@/components/ui/loading-logo";

interface LoggedSet {
  id: string;
  reps: number;
  weight: number | null;
  restTime: number | null;
}

interface LoggedExercise {
  id: string;
  exerciseId: string;
  sets: LoggedSet[];
  exercise: {
    id: string;
    name: string;
    bodyPart: string;
    equipment: string;
    target: string;
  };
}

interface WorkoutLog {
  id: string;
  date: string;
  duration: number | null;
  notes: string | null;
  exercises: LoggedExercise[];
}

interface TemplateExercise {
  sets: number;
  reps: string;
  restTime: number;
}

export default function ActiveWorkoutPage({
  params,
}: {
  params: { id: string };
}) {
  const { id: templateId } = params;
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [setInputs, setSetInputs] = useState<{[key: string]: {reps: string, weight: string}}>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch template to get exercise details
  const { data: templateData } = useQuery({
    queryKey: ["workout-template", templateId],
    queryFn: async () => {
      const res = await fetch(`/api/workout-templates`);
      if (!res.ok) throw new Error("Failed to fetch template");
      const data = await res.json();
      return data.templates.find((t: any) => t.id === templateId);
    },
    enabled: status === "authenticated" && !!templateId,
  });

  // Start workout mutation
  const startWorkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/workout-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      if (!res.ok) throw new Error("Failed to start workout");
      return res.json();
    },
    onSuccess: (data) => {
      setWorkoutLogId(data.workoutLog.id);
      setStartTime(new Date(data.workoutLog.date));
      showToast("Workout started! Let's go! 💪", "success");
    },
    onError: () => {
      showToast("Failed to start workout", "error");
    },
  });

  // Fetch workout log (with logged exercises and sets)
  const { data: workoutLogData, refetch: refetchWorkoutLog } = useQuery<{ workoutLog: WorkoutLog }>({
    queryKey: ["workout-log", workoutLogId],
    queryFn: async () => {
      const res = await fetch(`/api/workout-logs/${workoutLogId}`);
      if (!res.ok) throw new Error("Failed to fetch workout log");
      return res.json();
    },
    enabled: !!workoutLogId,
    refetchInterval: 2000, // Auto-refresh every 2 seconds
  });

  // Add set mutation
  const addSetMutation = useMutation({
    mutationFn: async ({ loggedExerciseId, reps, weight }: { loggedExerciseId: string, reps: number, weight: number | null }) => {
      const res = await fetch(`/api/workout-logs/${workoutLogId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loggedExerciseId, reps, weight }),
      });
      if (!res.ok) throw new Error("Failed to add set");
      return res.json();
    },
    onSuccess: () => {
      refetchWorkoutLog();
      showToast("Set logged! 🎯", "success");
    },
    onError: () => {
      showToast("Failed to log set", "error");
    },
  });

  // Complete workout mutation
  const completeWorkoutMutation = useMutation({
    mutationFn: async () => {
      // Calculate duration in minutes
      const durationMinutes = Math.floor(elapsedSeconds / 60);
      
      const res = await fetch(`/api/workout-logs/${workoutLogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: durationMinutes }),
      });
      if (!res.ok) throw new Error("Failed to complete workout");
      return res.json();
    },
    onSuccess: () => {
      showToast("Workout completed! Great job! 🎉", "success");
      setTimeout(() => {
        router.push("/workouts");
      }, 1500);
    },
    onError: () => {
      showToast("Failed to complete workout", "error");
    },
  });

  // Timer effect
  useEffect(() => {
    if (!startTime) return;
    
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Start workout on mount if not started
  useEffect(() => {
    if (status === "authenticated" && !workoutLogId && !startWorkoutMutation.isPending) {
      startWorkoutMutation.mutate();
    }
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddSet = (loggedExerciseId: string) => {
    const inputs = setInputs[loggedExerciseId] || { reps: "", weight: "" };
    if (!inputs.reps) {
      showToast("Please enter reps", "error");
      return;
    }

    addSetMutation.mutate({
      loggedExerciseId,
      reps: parseInt(inputs.reps),
      weight: inputs.weight ? parseFloat(inputs.weight) : null,
    });

    // Clear inputs
    setSetInputs(prev => ({
      ...prev,
      [loggedExerciseId]: { reps: "", weight: "" },
    }));
  };

  const updateSetInput = (loggedExerciseId: string, field: "reps" | "weight", value: string) => {
    setSetInputs(prev => ({
      ...prev,
      [loggedExerciseId]: {
        ...prev[loggedExerciseId] || { reps: "", weight: "" },
        [field]: value,
      },
    }));
  };

  if (status === "loading" || startWorkoutMutation.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <LoadingLogo />
          <p className="text-slate-600">Starting workout...</p>
        </div>
      </div>
    );
  }

  const workoutLog = workoutLogData?.workoutLog;
  const template = templateData;

  if (!workoutLog || !template) {
    return null;
  }

  const totalSets = workoutLog.exercises.reduce((sum: number, ex) => sum + ex.sets.length, 0);
  const progress = workoutLog.exercises.length > 0 
    ? Math.round((currentExerciseIdx / workoutLog.exercises.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Timer */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-r from-green-50 to-blue-50 p-4 md:p-6 shadow-xl">
          <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="mb-2 text-2xl md:text-3xl font-bold text-slate-900">{template.name}</h1>
              <p className="text-slate-600">Active Workout Session</p>
            </div>
            <div className="text-center w-full md:w-auto">
              <div className="text-3xl md:text-4xl font-bold text-blue-600">{formatTime(elapsedSeconds)}</div>
              <p className="text-sm text-slate-600">Elapsed Time</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Progress</span>
              <span className="text-slate-600">{progress}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700">
              📋 {workoutLog.exercises.length} exercises
            </span>
            <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700">
              ✅ {totalSets} sets logged
            </span>
          </div>
        </div>

        {/* Exercise List */}
        <div className="space-y-4">
          {workoutLog.exercises.map((loggedEx, idx) => {
            const templateEx = template.exercises.find((t: any) => t.exerciseId === loggedEx.exerciseId);
            const isActive = idx === currentExerciseIdx;
            const inputs = setInputs[loggedEx.id] || { reps: "", weight: "" };

            return (
              <div
                key={loggedEx.id}
                className={`rounded-2xl border-2 bg-white p-6 shadow-lg transition-all ${
                  isActive
                    ? "border-blue-500 ring-4 ring-blue-100"
                    : "border-slate-200"
                }`}
              >
                {/* Exercise Header */}
                <div className="mb-4 flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
                      isActive ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{loggedEx.exercise.name}</h3>
                      <p className="text-sm text-slate-600">
                        Target: {templateEx?.sets} sets × {templateEx?.reps} reps • {templateEx?.restTime}s rest
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentExerciseIdx(idx)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isActive ? "Active" : "Select"}
                  </button>
                </div>

                {/* Logged Sets */}
                {loggedEx.sets.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {loggedEx.sets.map((set, setIdx) => (
                      <div
                        key={set.id}
                        className="flex items-center gap-3 rounded-lg bg-green-50 p-3"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                          ✓
                        </div>
                        <span className="font-medium text-slate-900">Set {setIdx + 1}:</span>
                        <span className="text-slate-700">{set.reps} reps</span>
                        {set.weight && (
                          <span className="text-slate-700">@ {set.weight}kg</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Set Form */}
                {isActive && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="mb-3 text-sm font-medium text-slate-700">
                      Log Set {loggedEx.sets.length + 1}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="number"
                        placeholder="Reps"
                        value={inputs.reps}
                        onChange={(e) => updateSetInput(loggedEx.id, "reps", e.target.value)}
                        className="w-full sm:w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Weight (kg)"
                        value={inputs.weight}
                        onChange={(e) => updateSetInput(loggedEx.id, "weight", e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        onClick={() => handleAddSet(loggedEx.id)}
                        disabled={addSetMutation.isPending}
                        className="w-full sm:w-auto rounded-lg bg-green-500 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-green-600 disabled:opacity-50"
                      >
                        + Add Set
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-8">
          <button
            onClick={() => completeWorkoutMutation.mutate()}
            disabled={completeWorkoutMutation.isPending}
            className="w-full rounded-lg bg-green-500 px-6 py-4 text-center text-sm font-semibold text-white shadow-lg transition-all hover:bg-green-600 disabled:opacity-50"
          >
            {completeWorkoutMutation.isPending ? "Finishing..." : "✅ Finish Workout"}
          </button>
        </div>
      </div>
    </div>
  );
}

