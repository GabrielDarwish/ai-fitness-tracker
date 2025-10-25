"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle,
  Dumbbell
} from "lucide-react";
import LoadingLogo from "@/components/ui/loading-logo";

interface WorkoutSummary {
  id: string;
  date: string;
  duration: number | null;
  notes: string | null;
  exerciseCount: number;
  totalSets: number;
  totalVolume: number;
  exercises: Array<{
    name: string;
    bodyPart: string;
    setsCount: number;
  }>;
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Start with current week
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Get start and end of week (Monday to Sunday)
  const getWeekRange = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { start: monday, end: sunday };
  };

  const { start: weekStart, end: weekEnd } = getWeekRange(currentDate);

  // Generate array of 7 days for the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  // Fetch workouts for the week
  const { data: workoutsData, isLoading } = useQuery<{ workouts: WorkoutSummary[] }>({
    queryKey: ["workout-history", weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
      });
      const res = await fetch(`/api/workout-logs/history?${params}`);
      if (!res.ok) throw new Error("Failed to fetch workouts");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const workouts = workoutsData?.workouts || [];

  // Group workouts by date
  const workoutsByDate = workouts.reduce((acc, workout) => {
    const dateKey = new Date(workout.date).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(workout);
    return acc;
  }, {} as Record<string, WorkoutSummary[]>);

  // Navigation handlers
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToThisWeek = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isFutureDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  // Calculate weekly stats
  const weeklyStats = {
    totalWorkouts: workouts.length,
    totalSets: workouts.reduce((sum: number, w) => sum + w.totalSets, 0),
    totalVolume: workouts.reduce((sum: number, w) => sum + w.totalVolume, 0),
    totalMinutes: workouts.reduce((sum: number, w) => sum + (w.duration || 0), 0),
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <LoadingLogo />
          <p className="text-slate-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const startStr = weekStart.toLocaleDateString("en-US", options);
    const endStr = weekEnd.toLocaleDateString("en-US", options);
    const year = weekStart.getFullYear();
    return `${startStr} – ${endStr}, ${year}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30">
              <CalendarIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="mb-1 text-display">Workout Calendar</h1>
              <p className="text-lg text-slate-600">Track your training consistency</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Dashboard
          </Link>
        </div>

        {/* Weekly Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative animate-scale-in delay-100">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 opacity-20 blur-sm" />
            <div className="relative rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-5 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-700">
                <CheckCircle className="h-4 w-4" />
                Workouts
              </div>
              <div className="text-3xl font-bold text-green-900">{weeklyStats.totalWorkouts}</div>
              <div className="mt-1 text-xs text-green-600">This week</div>
            </div>
          </div>
          <div className="group relative animate-scale-in delay-200">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur-sm" />
            <div className="relative rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
                <Dumbbell className="h-4 w-4" />
                Total Sets
              </div>
              <div className="text-3xl font-bold text-blue-900">{weeklyStats.totalSets}</div>
              <div className="mt-1 text-xs text-blue-600">Completed</div>
            </div>
          </div>
          <div className="group relative animate-scale-in delay-300">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 blur-sm" />
            <div className="relative rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-5 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mb-2 text-sm font-semibold text-purple-700">Volume</div>
              <div className="text-3xl font-bold text-purple-900">{weeklyStats.totalVolume.toLocaleString()}</div>
              <div className="mt-1 text-xs text-purple-600">kg lifted</div>
            </div>
          </div>
          <div className="group relative animate-scale-in delay-400">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 opacity-20 blur-sm" />
            <div className="relative rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-5 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mb-2 text-sm font-semibold text-amber-700">Time</div>
              <div className="text-3xl font-bold text-amber-900">{weeklyStats.totalMinutes}</div>
              <div className="mt-1 text-xs text-amber-600">minutes</div>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          <button
            onClick={goToPreviousWeek}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="text-center">
            <div className="text-xl font-bold text-slate-900">{formatDateRange()}</div>
            <button
              onClick={goToThisWeek}
              className="mt-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              This Week
            </button>
          </div>

          <button
            onClick={goToNextWeek}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100"
          >
            Next
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Weekly Calendar Grid */}
        <div className="grid gap-4 md:grid-cols-7">
          {weekDays.map((day, index) => {
            const dayWorkouts = workoutsByDate[day.toDateString()] || [];
            const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
            const dayNumber = day.getDate();
            const hasWorkout = dayWorkouts.length > 0;
            const future = isFutureDate(day);
            const today = isToday(day);

            return (
              <div
                key={index}
                className={`min-h-[200px] rounded-xl border-2 p-4 shadow-lg transition-all ${
                  today
                    ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100"
                    : hasWorkout
                    ? "border-green-300 bg-white hover:shadow-xl"
                    : future
                    ? "border-slate-200 bg-slate-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                {/* Day Header */}
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className={`text-xs font-semibold uppercase ${today ? "text-blue-600" : "text-slate-500"}`}>
                      {dayName}
                    </div>
                    <div className={`text-2xl font-bold ${today ? "text-blue-900" : "text-slate-900"}`}>
                      {dayNumber}
                    </div>
                  </div>
                  {hasWorkout && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-md">
                      ✓
                    </div>
                  )}
                </div>

                {/* Workout Cards */}
                {dayWorkouts.length > 0 ? (
                  <div className="space-y-2">
                    {dayWorkouts.map((workout) => (
                      <Link
                        key={workout.id}
                        href={`/workouts/summary/${workout.id}`}
                        className="block rounded-lg border border-green-200 bg-green-50 p-3 transition-all hover:border-green-400 hover:bg-green-100 hover:shadow-md"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <div className="text-lg">💪</div>
                          <div className="font-medium text-slate-900">Workout</div>
                        </div>
                        <div className="space-y-1 text-xs text-slate-600">
                          <div>📋 {workout.exerciseCount} exercises</div>
                          <div>✅ {workout.totalSets} sets</div>
                          {workout.duration && <div>⏱️ {workout.duration} min</div>}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : future ? (
                  <div className="flex h-24 items-center justify-center text-sm text-slate-400">
                    Upcoming
                  </div>
                ) : (
                  <div className="flex h-24 items-center justify-center text-sm text-slate-400">
                    Rest day
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Indicator */}
        {weeklyStats.totalWorkouts > 0 && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Weekly Progress</h3>
              <span className="text-sm font-medium text-slate-600">
                {weeklyStats.totalWorkouts} / 7 days
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
                style={{ width: `${(weeklyStats.totalWorkouts / 7) * 100}%` }}
              ></div>
            </div>
            <div className="mt-3 flex gap-1">
              {weekDays.map((day, i) => {
                const hasWorkout = (workoutsByDate[day.toDateString()] || []).length > 0;
                return (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      hasWorkout ? "bg-green-500" : isFutureDate(day) ? "bg-slate-200" : "bg-slate-300"
                    }`}
                  ></div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

