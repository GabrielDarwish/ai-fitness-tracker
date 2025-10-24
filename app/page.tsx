import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // If user is authenticated, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-blue-400 to-green-400">
      <main className="mx-auto max-w-4xl px-6 text-center">
        <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl">
          AI Fitness Tracker
        </h1>
        <p className="mb-8 text-xl text-blue-50 md:text-2xl">
          Track workouts, log nutrition, and get AI-powered insights to reach
          your fitness goals
        </p>
        
        <Link
          href="/auth/signin"
          className="inline-block rounded-lg bg-white px-8 py-3 text-base font-semibold text-blue-600 transition-colors hover:bg-blue-50"
        >
          Get Started
        </Link>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-3 text-4xl">💪</div>
            <h3 className="mb-2 text-lg font-bold text-white">
              Track Workouts
            </h3>
            <p className="text-sm text-blue-50">
              Log exercises with AI-powered suggestions
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-3 text-4xl">🥗</div>
            <h3 className="mb-2 text-lg font-bold text-white">
              Log Nutrition
            </h3>
            <p className="text-sm text-blue-50">
              Track macros with natural language input
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-3 text-4xl">📊</div>
            <h3 className="mb-2 text-lg font-bold text-white">
              View Progress
            </h3>
            <p className="text-sm text-blue-50">
              Visualize your fitness journey over time
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

