"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import LoadingLogo from "@/components/ui/loading-logo";

export default function ProgressPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch workout stats
  const { data: workoutStats } = useQuery({
    queryKey: ["workout-stats"],
    queryFn: async () => {
      const res = await fetch("/api/workout-logs/stats?days=30");
      if (!res.ok) throw new Error("Failed to fetch workout stats");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  // Fetch nutrition stats
  const { data: nutritionStats } = useQuery({
    queryKey: ["nutrition-stats"],
    queryFn: async () => {
      const res = await fetch("/api/nutrition/logs?days=30");
      if (!res.ok) throw new Error("Failed to fetch nutrition stats");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  // Fetch AI insights
  const { data: aiInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: async () => {
      const res = await fetch("/api/ai/insights");
      if (!res.ok) throw new Error("Failed to fetch AI insights");
      return res.json();
    },
    enabled: status === "authenticated" && !!workoutStats && !!nutritionStats,
  });

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <LoadingLogo />
          <p className="text-slate-600">Loading progress...</p>
        </div>
      </div>
    );
  }

  // Process workout data for charts
  const workoutChartData = workoutStats?.logs?.map((log: any) => ({
    date: new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    volume: log.totalVolume || 0,
    sets: log.totalSets || 0,
    duration: log.duration || 0,
  })) || [];

  // Process nutrition data for charts
  const nutritionChartData = nutritionStats?.logs?.map((log: any) => ({
    date: new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    calories: log.calories,
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
  })) || [];

  // Calculate overall stats
  const totalWorkouts = workoutStats?.logs?.length || 0;
  const totalVolume = workoutStats?.logs?.reduce((sum: number, log: any) => sum + (log.totalVolume || 0), 0) || 0;
  const totalSets = workoutStats?.logs?.reduce((sum: number, log: any) => sum + (log.totalSets || 0), 0) || 0;
  const avgCalories = nutritionStats?.logs?.length > 0
    ? Math.round(nutritionStats.logs.reduce((sum: number, log: any) => sum + log.calories, 0) / nutritionStats.logs.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-slate-900">Progress Dashboard</h1>
            <p className="text-slate-600">Track your fitness journey with data & AI insights</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </Link>
        </div>

        {/* Overall Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-lg">
            <div className="mb-2 text-sm font-medium text-blue-700">Total Workouts</div>
            <div className="text-4xl font-bold text-blue-900">{totalWorkouts}</div>
            <div className="mt-2 text-xs text-blue-600">Last 30 days</div>
          </div>
          <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-lg">
            <div className="mb-2 text-sm font-medium text-green-700">Total Volume</div>
            <div className="text-4xl font-bold text-green-900">{totalVolume.toLocaleString()}</div>
            <div className="mt-2 text-xs text-green-600">lbs lifted</div>
          </div>
          <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-lg">
            <div className="mb-2 text-sm font-medium text-purple-700">Total Sets</div>
            <div className="text-4xl font-bold text-purple-900">{totalSets}</div>
            <div className="mt-2 text-xs text-purple-600">completed</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-lg">
            <div className="mb-2 text-sm font-medium text-amber-700">Avg Calories</div>
            <div className="text-4xl font-bold text-amber-900">{avgCalories}</div>
            <div className="mt-2 text-xs text-amber-600">per day</div>
          </div>
        </div>

        {/* AI Insights */}
        {aiInsights && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="text-4xl">🤖</div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">AI Insights</h2>
                <p className="text-slate-600">Personalized analysis powered by Gemini AI</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-white p-4">
                <div className="mt-1 text-xl">💡</div>
                <p className="flex-1 text-slate-700">{aiInsights.insights}</p>
              </div>
            </div>
          </div>
        )}

        {insightsLoading && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-xl">
            <div className="flex items-center justify-center gap-3 py-8">
              <svg className="h-8 w-8 animate-spin text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg text-slate-700">Generating AI insights...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {workoutChartData.length === 0 && nutritionChartData.length === 0 && (
          <div className="mb-8 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <div className="mx-auto mb-4 text-6xl">📊</div>
            <h3 className="mb-2 text-2xl font-bold text-slate-900">No Progress Data Yet</h3>
            <p className="mb-6 text-slate-600">
              Start logging your workouts and nutrition to see your progress visualized here!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/workouts"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-600"
              >
                🏋️ Log Workout
              </Link>
              <Link
                href="/nutrition"
                className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-green-600"
              >
                🥗 Log Nutrition
              </Link>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        {(workoutChartData.length > 0 || nutritionChartData.length > 0) && (
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Workout Volume Chart */}
          {workoutChartData.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Workout Volume (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workoutChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip />
                  <Bar dataKey="volume" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Workout Duration Chart */}
          {workoutChartData.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Workout Duration (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={workoutChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="duration" stroke="#10B981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Nutrition Calories Chart */}
          {nutritionChartData.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Daily Calories (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={nutritionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="calories" stroke="#F59E0B" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Nutrition Macros Chart */}
          {nutritionChartData.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Daily Macros (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={nutritionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="protein" stroke="#3B82F6" strokeWidth={2} name="Protein (g)" />
                  <Line type="monotone" dataKey="carbs" stroke="#10B981" strokeWidth={2} name="Carbs (g)" />
                  <Line type="monotone" dataKey="fat" stroke="#F59E0B" strokeWidth={2} name="Fat (g)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        )}

        {/* Quick Action Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/calendar"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 hover:border-purple-300 hover:shadow-xl"
          >
            <div className="mb-3 text-3xl">🗓️</div>
            <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-purple-600">View Calendar</h3>
            <p className="text-sm text-slate-600">See your workout history</p>
          </Link>
          <Link
            href="/workouts"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 hover:border-green-300 hover:shadow-xl"
          >
            <div className="mb-3 text-3xl">💪</div>
            <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-green-600">My Workouts</h3>
            <p className="text-sm text-slate-600">Start a workout session</p>
          </Link>
          <Link
            href="/library"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 hover:border-blue-300 hover:shadow-xl"
          >
            <div className="mb-3 text-3xl">📚</div>
            <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-blue-600">Exercise Library</h3>
            <p className="text-sm text-slate-600">Discover new exercises</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
