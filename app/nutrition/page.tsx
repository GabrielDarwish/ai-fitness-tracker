"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function NutritionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [foodQuery, setFoodQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedFood, setAnalyzedFood] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch nutrition logs
  const { data: nutritionData, refetch: refetchNutrition } = useQuery({
    queryKey: ["nutrition-logs"],
    queryFn: async () => {
      const res = await fetch("/api/nutrition/logs?days=7");
      if (!res.ok) throw new Error("Failed to fetch nutrition");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  // Analyze food mutation
  const handleAnalyzeFood = async () => {
    if (!foodQuery.trim()) {
      showToast("Please enter what you ate", "error");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/nutrition/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: foodQuery }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to analyze food");
      }

      setAnalyzedFood(data);
      showToast("Food analyzed successfully! 🍽️", "success");
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Log nutrition mutation
  const logNutritionMutation = useMutation({
    mutationFn: async () => {
      if (!analyzedFood) return;

      const res = await fetch("/api/nutrition/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories: analyzedFood.totals.calories,
          protein: analyzedFood.totals.protein,
          carbs: analyzedFood.totals.carbs,
          fat: analyzedFood.totals.fat,
          note: analyzedFood.query,
        }),
      });

      if (!res.ok) throw new Error("Failed to log nutrition");
      return res.json();
    },
    onSuccess: () => {
      showToast("Nutrition logged successfully! ✅", "success");
      setFoodQuery("");
      setAnalyzedFood(null);
      refetchNutrition();
    },
    onError: () => {
      showToast("Failed to log nutrition", "error");
    },
  });

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <img src="/logo.png" alt="Loading" className="h-40 w-40 animate-pulse" />
          </div>
          <p className="text-slate-600">Loading nutrition...</p>
        </div>
      </div>
    );
  }

  const nutritionLogs = nutritionData?.logs || [];

  // Prepare chart data
  const nutritionChartData = nutritionLogs.map((log: any) => ({
    date: new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    calories: log.calories,
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
  }));

  // Calculate weekly stats
  const weeklyStats = nutritionLogs.length > 0
    ? {
        totalCalories: nutritionLogs.reduce((sum: number, l: any) => sum + l.calories, 0),
        avgCalories: Math.round(nutritionLogs.reduce((sum: number, l: any) => sum + l.calories, 0) / nutritionLogs.length),
        avgProtein: Math.round(nutritionLogs.reduce((sum: number, l: any) => sum + l.protein, 0) / nutritionLogs.length),
        avgCarbs: Math.round(nutritionLogs.reduce((sum: number, l: any) => sum + l.carbs, 0) / nutritionLogs.length),
        avgFat: Math.round(nutritionLogs.reduce((sum: number, l: any) => sum + l.fat, 0) / nutritionLogs.length),
      }
    : { totalCalories: 0, avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0 };

  // Macro pie chart data (average)
  const macroPieData = [
    { name: "Protein", value: weeklyStats.avgProtein, color: "#3B82F6" },
    { name: "Carbs", value: weeklyStats.avgCarbs, color: "#10B981" },
    { name: "Fat", value: weeklyStats.avgFat, color: "#F59E0B" },
  ];

  // Today's nutrition
  const today = new Date().toDateString();
  const todayLog = nutritionLogs.find((log: any) => new Date(log.date).toDateString() === today);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-slate-900">Nutrition Tracker</h1>
            <p className="text-slate-600">Log your meals with natural language</p>
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

        {/* Weekly Stats */}
        {nutritionLogs.length > 0 && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-lg">
              <div className="mb-2 text-sm font-medium text-green-700">Days Logged</div>
              <div className="text-4xl font-bold text-green-900">{nutritionLogs.length}</div>
              <div className="mt-2 text-xs text-green-600">Last 7 days</div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-lg">
              <div className="mb-2 text-sm font-medium text-blue-700">Avg Calories</div>
              <div className="text-4xl font-bold text-blue-900">{weeklyStats.avgCalories}</div>
              <div className="mt-2 text-xs text-blue-600">kcal/day</div>
            </div>
            <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-lg">
              <div className="mb-2 text-sm font-medium text-purple-700">Avg Protein</div>
              <div className="text-4xl font-bold text-purple-900">{weeklyStats.avgProtein}g</div>
              <div className="mt-2 text-xs text-purple-600">per day</div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-lg">
              <div className="mb-2 text-sm font-medium text-amber-700">Total Calories</div>
              <div className="text-4xl font-bold text-amber-900">{weeklyStats.totalCalories.toLocaleString()}</div>
              <div className="mt-2 text-xs text-amber-600">this week</div>
            </div>
          </div>
        )}

        {/* Food Logger */}
        <div className="mb-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="text-4xl">🍽️</div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">What did you eat?</h2>
              <p className="text-slate-600">Describe your meal in plain English</p>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={foodQuery}
              onChange={(e) => setFoodQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAnalyzeFood()}
              placeholder="e.g., grilled chicken breast with brown rice and broccoli"
              className="w-full rounded-lg border-2 border-amber-300 px-4 py-4 text-lg text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/20"
            />
          </div>

          <button
            onClick={handleAnalyzeFood}
            disabled={isAnalyzing}
            className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 sm:w-auto"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              "🔍 Analyze Food"
            )}
          </button>

          {/* Analyzed Food Results */}
          {analyzedFood && (
            <div className="mt-6 rounded-xl border-2 border-amber-300 bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-xl font-bold text-slate-900">Analysis Results</h3>
              
              {/* Food Items */}
              <div className="mb-6 space-y-3">
                {analyzedFood.foods.map((food: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                    <div>
                      <div className="font-semibold text-slate-900">{food.name}</div>
                      <div className="text-sm text-slate-600">{food.serving}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{food.calories} kcal</div>
                      <div className="text-xs text-slate-600">
                        P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mb-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-6">
                <div className="mb-3 text-lg font-bold text-slate-900">Total Macros:</div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                    <div className="text-xs font-medium text-slate-600">Calories</div>
                    <div className="text-2xl font-bold text-slate-900">{analyzedFood.totals.calories}</div>
                  </div>
                  <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                    <div className="text-xs font-medium text-slate-600">Protein</div>
                    <div className="text-2xl font-bold text-blue-600">{analyzedFood.totals.protein}g</div>
                  </div>
                  <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                    <div className="text-xs font-medium text-slate-600">Carbs</div>
                    <div className="text-2xl font-bold text-green-600">{analyzedFood.totals.carbs}g</div>
                  </div>
                  <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                    <div className="text-xs font-medium text-slate-600">Fat</div>
                    <div className="text-2xl font-bold text-amber-600">{analyzedFood.totals.fat}g</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => logNutritionMutation.mutate()}
                disabled={logNutritionMutation.isPending}
                className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
              >
                {logNutritionMutation.isPending ? "Logging..." : "✅ Log to Today"}
              </button>
            </div>
          )}

          {/* Today's Total */}
          {todayLog && (
            <div className="mt-6 rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-lg">
              <div className="mb-3 flex items-center gap-2">
                <div className="text-2xl">📊</div>
                <div className="text-lg font-bold text-green-900">Today's Total:</div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="text-center">
                  <div className="text-xs font-medium text-green-700">Calories</div>
                  <div className="text-2xl font-bold text-green-900">{todayLog.calories}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-green-700">Protein</div>
                  <div className="text-2xl font-bold text-green-900">{todayLog.protein}g</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-green-700">Carbs</div>
                  <div className="text-2xl font-bold text-green-900">{todayLog.carbs}g</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-green-700">Fat</div>
                  <div className="text-2xl font-bold text-green-900">{todayLog.fat}g</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charts Section */}
        {nutritionLogs.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Calories Trend */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Daily Calories (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={nutritionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="calories" stroke="#10B981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Macro Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Average Macro Split</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={macroPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}g`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {macroPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Empty State */}
        {nutritionLogs.length === 0 && !analyzedFood && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 p-12 text-center">
            <div className="mb-4 text-6xl">🥗</div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">No nutrition data yet</h3>
            <p className="text-slate-600">Start by logging your first meal above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
