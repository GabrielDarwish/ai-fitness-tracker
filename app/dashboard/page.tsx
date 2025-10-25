import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "./components/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      goals: true,
      equipment: true,
    },
  });

  if (!user?.goals) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Logout */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-slate-900">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-slate-600">
              Your fitness journey starts here
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Exercise Library Card - Active */}
          <Link
            href="/library"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition-all duration-200 hover:border-blue-300 hover:shadow-2xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl transition-colors group-hover:bg-blue-200">
                📚
              </div>
              <h2 className="text-xl font-bold text-slate-900">Exercise Library</h2>
            </div>
            <p className="text-slate-600">Browse and save exercises</p>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600">
              Explore now
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* AI Workout Builder Card - Active */}
          <Link
            href="/ai-builder"
            className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-xl transition-all duration-200 hover:border-amber-300 hover:shadow-2xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-2xl shadow-lg transition-transform group-hover:scale-110">
                🤖
              </div>
              <h2 className="text-xl font-bold text-slate-900">AI Workout Builder</h2>
            </div>
            <p className="text-slate-600">Generate personalized workout plans</p>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-amber-600">
              Create workout
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Workouts Card - Coming Soon */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl opacity-60">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
                💪
              </div>
              <h2 className="text-xl font-bold text-slate-900">Workouts</h2>
            </div>
            <p className="text-slate-600">Track and log your exercises</p>
            <div className="mt-4 text-sm text-slate-500">Coming soon...</div>
          </div>

          {/* Nutrition Card - Coming Soon */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl opacity-60">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
                🥗
              </div>
              <h2 className="text-xl font-bold text-slate-900">Nutrition</h2>
            </div>
            <p className="text-slate-600">Monitor your daily intake</p>
            <div className="mt-4 text-sm text-slate-500">Coming soon...</div>
          </div>

          {/* Progress Card - Coming Soon */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl opacity-60">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-2xl">
                📊
              </div>
              <h2 className="text-xl font-bold text-slate-900">Progress</h2>
            </div>
            <p className="text-slate-600">View your achievements</p>
            <div className="mt-4 text-sm text-slate-500">Coming soon...</div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Your Profile</h3>
          <div className="space-y-2 text-sm">
            <p className="text-slate-600">
              <span className="font-medium text-slate-900">Goal:</span>{" "}
              {user.goals?.replace("-", " ")}
            </p>
            <p className="text-slate-600">
              <span className="font-medium text-slate-900">Equipment:</span>{" "}
              {user.equipment && user.equipment.length > 0
                ? user.equipment.join(", ")
                : "None"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

