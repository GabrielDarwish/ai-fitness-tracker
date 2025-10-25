"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import LoadingLogo from "@/components/ui/loading-logo";

export default function WorkoutSummaryPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const { data: workoutData, isLoading } = useQuery({
    queryKey: ["workout-log", id],
    queryFn: async () => {
      const res = await fetch(`/api/workout-logs/${id}`);
      if (!res.ok) throw new Error("Failed to fetch workout");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <LoadingLogo />
          <p className="text-slate-600">Loading workout...</p>
        </div>
      </div>
    );
  }

  const workoutLog = workoutData?.workoutLog;

  if (!workoutLog) {
    return null;
  }

  const totalSets = workoutLog.exercises.reduce((sum: number, ex: any) => sum + ex.sets.length, 0);
  const totalVolume = workoutLog.exercises.reduce(
    (sum: number, ex: any) =>
      sum + ex.sets.reduce((setSum: number, set: any) => setSum + (set.weight || 0) * set.reps, 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Calendar
          </Link>
        </div>

        {/* Workout Summary Card */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-blue-50 p-8 shadow-xl">
          <div className="mb-6">
            <h1 className="mb-2 text-4xl font-bold text-slate-900">Workout Summary</h1>
            <p className="text-slate-600">
              {new Date(workoutLog.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-1 text-sm font-medium text-slate-600">Exercises</div>
              <div className="text-3xl font-bold text-slate-900">{workoutLog.exercises.length}</div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-1 text-sm font-medium text-slate-600">Total Sets</div>
              <div className="text-3xl font-bold text-slate-900">{totalSets}</div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-1 text-sm font-medium text-slate-600">Volume</div>
              <div className="text-3xl font-bold text-slate-900">{Math.round(totalVolume)}</div>
              <div className="text-xs text-slate-500">kg lifted</div>
            </div>
            {workoutLog.duration && (
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-1 text-sm font-medium text-slate-600">Duration</div>
                <div className="text-3xl font-bold text-slate-900">{workoutLog.duration}</div>
                <div className="text-xs text-slate-500">minutes</div>
              </div>
            )}
          </div>
        </div>

        {/* Exercise Details */}
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Exercises</h2>
        <div className="space-y-4">
          {workoutLog.exercises.map((loggedEx: any, idx: number) => (
            <div
              key={loggedEx.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-xl font-bold text-slate-900">{loggedEx.exercise.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {loggedEx.exercise.bodyPart}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                      {loggedEx.exercise.target}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{loggedEx.sets.length}</div>
                  <div className="text-xs text-slate-600">sets</div>
                </div>
              </div>

              {/* Sets Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-600">
                      <th className="pb-2">Set</th>
                      <th className="pb-2">Reps</th>
                      <th className="pb-2">Weight</th>
                      <th className="pb-2">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loggedEx.sets.map((set: any, setIdx: number) => (
                      <tr key={set.id} className="border-b border-slate-100">
                        <td className="py-2 font-medium text-slate-900">{setIdx + 1}</td>
                        <td className="py-2 text-slate-700">{set.reps}</td>
                        <td className="py-2 text-slate-700">{set.weight ? `${set.weight} kg` : "-"}</td>
                        <td className="py-2 font-medium text-slate-900">
                          {set.weight ? `${Math.round(set.weight * set.reps)} kg` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-medium text-slate-900">
                      <td className="pt-2">Total</td>
                      <td className="pt-2">
                        {loggedEx.sets.reduce((sum: number, s: any) => sum + s.reps, 0)} reps
                      </td>
                      <td className="pt-2"></td>
                      <td className="pt-2">
                        {Math.round(
                          loggedEx.sets.reduce(
                            (sum: number, s: any) => sum + (s.weight || 0) * s.reps,
                            0
                          )
                        )}{" "}
                        kg
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {workoutLog.notes && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-bold text-slate-900">Notes</h3>
            <p className="text-slate-700">{workoutLog.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

