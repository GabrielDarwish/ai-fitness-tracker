import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { 
  Dumbbell, 
  Sparkles, 
  Target, 
  Calendar, 
  Utensils, 
  TrendingUp,
  ArrowRight 
} from "lucide-react";
import ProfileDropdown from "./components/ProfileDropdown";

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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Profile Dropdown */}
        <div className="mb-12 flex items-start justify-between animate-slide-up">
          <div>
            <h1 className="mb-3 text-display">
              Welcome back, {user.name}!
            </h1>
            <p className="text-lg text-slate-600">
              Your fitness journey starts here ✨
            </p>
          </div>
          <ProfileDropdown 
            userName={user.name || "User"} 
            goals={user.goals || ""}
            equipment={user.equipment || []}
          />
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Exercise Library Card */}
          <Link href="/library" className="group relative animate-scale-in delay-100">
            {/* Subtle gradient border on hover */}
            <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
            
            <div className="relative rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
              {/* Icon with gradient background */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Dumbbell className="h-7 w-7 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Exercise Library
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Browse 1000+ exercises with form videos
              </p>
              
              {/* CTA with arrow animation */}
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                Explore now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
              
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl" />
            </div>
          </Link>

          {/* AI Workout Builder Card - Special AI Treatment */}
          <Link href="/ai-builder" className="group relative animate-scale-in delay-200">
            {/* Gradient border */}
            <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
            
            <div className="relative rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
              {/* AI Badge - Floating in corner */}
              <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-sm">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wide">AI</span>
              </div>
              
              {/* Icon */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              
              {/* Content with gradient text */}
              <h3 className="mb-2 text-xl font-bold text-gradient-amber">
                AI Workout Builder
              </h3>
              <p className="mb-4 text-sm text-slate-700">
                Generate personalized workouts with AI
              </p>
              
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">
                Create workout
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl" />
            </div>
          </Link>

          {/* My Workouts Card */}
          <Link href="/workouts" className="group relative animate-scale-in delay-300">
            <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
            
            <div className="relative rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Target className="h-7 w-7 text-white" />
              </div>
              
              <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                My Workouts
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                View and start your workout templates
              </p>
              
              <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                Manage workouts
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl" />
            </div>
          </Link>

          {/* Calendar Card */}
          <Link href="/calendar" className="group relative animate-scale-in delay-400">
            <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
            
            <div className="relative rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              
              <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                Calendar
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Track your training schedule
              </p>
              
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                View calendar
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl" />
            </div>
          </Link>

          {/* Nutrition Tracker Card */}
          <Link href="/nutrition" className="group relative animate-scale-in delay-500">
            <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
            
            <div className="relative rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Utensils className="h-7 w-7 text-white" />
              </div>
              
              <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                Nutrition Tracker
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Log meals with natural language
              </p>
              
              <div className="flex items-center gap-2 text-sm font-semibold text-orange-600">
                Log food
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl" />
            </div>
          </Link>

          {/* Progress Dashboard Card - AI POWERED */}
          <Link href="/progress" className="group relative animate-scale-in delay-500">
            <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
            
            <div className="relative rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
              {/* AI Badge - Floating in corner */}
              <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 shadow-sm">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wide">AI</span>
              </div>
              
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              
              <h3 className="mb-2 text-xl font-bold text-gradient-blue">
                Progress Dashboard
              </h3>
              <p className="mb-4 text-sm text-slate-700">
                Charts, stats & AI insights
              </p>
              
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                View analytics
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

