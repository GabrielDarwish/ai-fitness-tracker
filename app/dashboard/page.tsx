import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "next-auth/react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                AI Fitness Tracker
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.user?.name || session.user?.email}
              </span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user?.name?.split(" ")[0] || "there"}!
          </h2>
          <p className="mt-2 text-gray-600">
            Your AI-powered fitness dashboard
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Workouts</h3>
              <span className="text-2xl">💪</span>
            </div>
            <p className="text-gray-600">No workouts logged yet</p>
            <button className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600">
              Log Workout
            </button>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Progress</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-gray-600">Track your progress over time</p>
            <button className="mt-4 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600">
              View Progress
            </button>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Nutrition</h3>
              <span className="text-2xl">🥗</span>
            </div>
            <p className="text-gray-600">No meals logged today</p>
            <button className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">
              Log Meal
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-bold text-gray-900">
            Recent Activity
          </h3>
          <p className="text-gray-500">No activity yet. Start by logging your first workout!</p>
        </div>
      </main>
    </div>
  );
}

