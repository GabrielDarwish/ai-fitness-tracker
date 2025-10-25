"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ExerciseCard from "./components/ExerciseCard";
import FilterBar from "./components/FilterBar";
import Pagination from "./components/Pagination";

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

interface ExercisesResponse {
  exercises: Exercise[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
  const [filters, setFilters] = useState({
    bodyPart: "",
    equipment: "",
    target: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const itemsPerPage = 24;

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Auto-sync exercises on first load
  useEffect(() => {
    const checkAndSync = async () => {
      if (status !== "authenticated") return;

      setIsSyncing(true);
      setSyncError(null);

      try {
        const res = await fetch("/api/exercises/check-sync");
        const data = await res.json();

        if (!res.ok || !data.synced) {
          setSyncError(data.error || "Failed to load exercises");
        } else if (data.count > 0) {
          console.log(`✅ ${data.count} exercises ready!`);
          // Invalidate exercises query to fetch fresh data
          queryClient.invalidateQueries({ queryKey: ["exercises"] });
        }
      } catch (error) {
        console.error("Error checking exercises:", error);
        setSyncError("Failed to load exercises. Please refresh the page.");
      } finally {
        setIsSyncing(false);
      }
    };

    checkAndSync();
  }, [status, queryClient]);

  // Fetch exercises
  const { data: exercisesData, isLoading: exercisesLoading } = useQuery<ExercisesResponse>({
    queryKey: ["exercises", filters, currentPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * itemsPerPage;
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: offset.toString(),
      });

      if (filters.bodyPart) params.append("bodyPart", filters.bodyPart);
      if (filters.equipment) params.append("equipment", filters.equipment);
      if (filters.target) params.append("target", filters.target);
      if (filters.search) params.append("search", filters.search);

      const res = await fetch(`/api/exercises?${params}`);
      if (!res.ok) throw new Error("Failed to fetch exercises");
      return res.json();
    },
    enabled: status === "authenticated" && activeTab === "all",
  });

  // Fetch saved exercises
  const { data: savedData, isLoading: savedLoading } = useQuery({
    queryKey: ["saved-exercises"],
    queryFn: async () => {
      const res = await fetch("/api/saved-exercises");
      if (!res.ok) throw new Error("Failed to fetch saved exercises");
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
      queryClient.invalidateQueries({ queryKey: ["saved-exercises"] });
    },
  });

  const handleToggleSave = async (exerciseId: string, isSaved: boolean) => {
    if (isSaved) {
      await unsaveMutation.mutateAsync(exerciseId);
    } else {
      await saveMutation.mutateAsync(exerciseId);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Get saved exercise IDs for quick lookup
  const savedExerciseIds = new Set(
    savedData?.savedExercises?.map((se: any) => se.exerciseId) || []
  );

  // Determine which exercises to show
  const displayExercises =
    activeTab === "all"
      ? exercisesData?.exercises || []
      : savedData?.savedExercises?.map((se: any) => se.exercise) || [];

  const isLoading = activeTab === "all" ? exercisesLoading : savedLoading;

  if (status === "loading" || isSyncing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-md text-center">
          <div className="mb-4 text-6xl animate-pulse">💪</div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">
            {isSyncing ? "Loading Exercise Library..." : "Loading..."}
          </h2>
          <p className="mb-4 text-slate-600">
            {isSyncing
              ? "Syncing exercises from ExerciseDB..."
              : "Preparing your fitness experience"}
          </p>
          {isSyncing && (
            <>
              <div className="mx-auto h-2 w-64 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 bg-[length:200%_100%]"></div>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Fetching all available exercises...
              </p>
              <p className="mt-2 text-xs text-slate-400">
                This happens once and may take 30-60 seconds
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Show error if sync failed
  if (syncError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-md text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Setup Required</h2>
          <p className="mb-6 text-slate-600">{syncError}</p>
          {syncError.includes("API key") && (
            <div className="rounded-lg bg-amber-50 p-4 text-left text-sm">
              <p className="mb-2 font-semibold text-amber-900">To fix this:</p>
              <ol className="list-inside list-decimal space-y-1 text-amber-800">
                <li>Get an API key from RapidAPI ExerciseDB</li>
                <li>Add <code className="rounded bg-amber-100 px-1">EXERCISEDB_API_KEY</code> to your .env file</li>
                <li>Restart your dev server</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-slate-900">
                Exercise Library 📚
              </h1>
              <p className="text-slate-600">
                Discover and save exercises for your workouts
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                activeTab === "all"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Exercises
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                activeTab === "saved"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              My Saved ({savedData?.savedExercises?.length || 0})
            </button>
          </div>

          {/* Filters (only show for "all" tab) */}
          {activeTab === "all" && (
            <FilterBar filters={filters} onFilterChange={handleFilterChange} />
          )}
        </div>

        {/* Results Info */}
        {activeTab === "all" && exercisesData && exercisesData.total > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">
                {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, exercisesData.total)}
              </span>
              <span>of</span>
              <span className="font-semibold text-slate-900">{exercisesData.total}</span>
              <span>exercises</span>
            </div>
            <div className="text-sm text-slate-500">
              Page {currentPage} of {Math.ceil(exercisesData.total / itemsPerPage)}
            </div>
          </div>
        )}

        {/* Exercise Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-xl bg-slate-200"
              ></div>
            ))}
          </div>
        ) : displayExercises.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">
              {activeTab === "saved" ? "No saved exercises yet" : "No exercises found"}
            </h3>
            <p className="text-slate-600">
              {activeTab === "saved"
                ? "Start exploring and save your favorite exercises!"
                : "Try adjusting your filters or search terms"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayExercises.map((exercise: Exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  isSaved={savedExerciseIds.has(exercise.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>

            {/* Pagination */}
            {activeTab === "all" && exercisesData && exercisesData.total > 0 && (
              <div className="mt-10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(exercisesData.total / itemsPerPage)}
                  totalItems={exercisesData.total}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

