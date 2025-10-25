"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Sparkles, 
  TrendingUp, 
  Apple, 
  Dumbbell, 
  Target, 
  Clock,
  ArrowRight,
  CheckCircle,
  Github,
  Linkedin,
  Twitter,
  Instagram
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-amber-50 pt-8 pb-32">
        {/* Animated background effects */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl animate-pulse-glow delay-700" />
        
        <div className="container relative mx-auto px-4 pt-12">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.6fr] lg:gap-20 items-start">
            {/* Left: Text Content */}
            <div className="space-y-8 animate-slide-up lg:pl-16">
              {/* Logo */}
              <div className="relative h-56 w-56 mb-8">
                <Image
                  src="/logo.png"
                  alt="AI Fitness Tracker"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
                  AI-Powered <br />
                  <span className="text-gradient-blue">Fitness Tracker</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Get Fit with Your AI Personal Trainer
                </p>
                <p className="text-lg text-slate-600 max-w-xl">
                  Generate custom workouts, track your progress, and get nutrition insights — all personalized to your goals.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/auth/signin"
                  className="group relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <span className="relative z-10">Get Started</span>
                  <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-700 shadow-lg transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  Learn More
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-slate-600">Free to use</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-slate-600">AI-powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-slate-600">Personalized</span>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative animate-scale-in delay-200">
              <div className="relative mx-auto max-w-lg">
                {/* Main mockup - Add your screenshot here */}
                <div className="relative rounded-3xl border-4 border-slate-200 overflow-hidden shadow-2xl">
                  <div className="aspect-[9/16] relative">
                    <Image 
                      src="/dashboard-preview.png" 
                      alt="Dashboard Preview" 
                      fill 
                      className="object-cover" 
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/features-bg.jpg"
            alt="Features Background"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for better card visibility */}
          <div className="absolute inset-0 bg-slate-900/20" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powered by <span className="text-gradient-blue">Artificial Intelligence</span>
            </h2>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto">
              Smart features that adapt to your fitness journey
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1: AI Workout Builder */}
            <div className="group relative animate-scale-in">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
              
              <div className="relative rounded-2xl border border-slate-700/50 bg-white/95 backdrop-blur-sm p-8 shadow-2xl hover:shadow-amber-500/20 hover:bg-white transition-all duration-300">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/40">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="mb-3 text-2xl font-bold text-slate-900">AI Workout Builder</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Generate personalized training plans based on your goals & equipment.
                </p>
                <p className="text-sm text-amber-600 font-semibold">
                  Powered by Gemini AI
                </p>
              </div>
            </div>

            {/* Feature 2: Progress Tracking */}
            <div className="group relative animate-scale-in delay-100">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
              
              <div className="relative rounded-2xl border border-slate-700/50 bg-white/95 backdrop-blur-sm p-8 shadow-2xl hover:shadow-blue-500/20 hover:bg-white transition-all duration-300">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/40">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="mb-3 text-2xl font-bold text-slate-900">Progress Tracking</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Visualize performance and trends with interactive charts.
                </p>
                <p className="text-sm text-blue-600 font-semibold">
                  Real-time analytics
                </p>
              </div>
            </div>

            {/* Feature 3: Nutrition Insights */}
            <div className="group relative animate-scale-in delay-200">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-green-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
              
              <div className="relative rounded-2xl border border-slate-700/50 bg-white/95 backdrop-blur-sm p-8 shadow-2xl hover:shadow-green-500/20 hover:bg-white transition-all duration-300">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/40">
                  <Apple className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="mb-3 text-2xl font-bold text-slate-900">Nutrition Insights</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Log meals with AI and see how your diet supports your goals.
                </p>
                <p className="text-sm text-green-600 font-semibold">
                  Powered by Nutritionix
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Your entire fitness journey — <span className="text-gradient-blue">visualized</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From smart workouts to nutrition analytics, every feature adapts to you
            </p>
          </div>

          {/* Preview mockup grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <div className="relative group animate-scale-in">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 opacity-50 group-hover:opacity-100 blur transition-all duration-500" />
              <div className="relative aspect-[4/3] rounded-2xl border border-slate-200 bg-slate-50 shadow-xl overflow-hidden">
                <Image
                  src="/dashboard-overview.png"
                  alt="Dashboard Overview"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <p className="mt-4 text-center text-sm font-semibold text-slate-700">Dashboard Overview</p>
            </div>

            <div className="relative group animate-scale-in delay-100">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 opacity-50 group-hover:opacity-100 blur transition-all duration-500" />
              <div className="relative aspect-[4/3] rounded-2xl border border-slate-200 bg-slate-50 shadow-xl overflow-hidden">
                <Image
                  src="/ai-workout-builder.png"
                  alt="AI Workout Builder"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <p className="mt-4 text-center text-sm font-semibold text-slate-700">AI Workout Builder</p>
            </div>

            <div className="relative group animate-scale-in delay-200">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 opacity-50 group-hover:opacity-100 blur transition-all duration-500" />
              <div className="relative aspect-[4/3] rounded-2xl border border-slate-200 bg-slate-50 shadow-xl overflow-hidden">
                <Image
                  src="/progress-charts.png"
                  alt="Progress Charts"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <p className="mt-4 text-center text-sm font-semibold text-slate-700">Progress Charts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Loved by <span className="text-gradient-blue">Fitness Enthusiasts</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="relative group animate-scale-in">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
              <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-5 w-5 text-amber-400">⭐</div>
                  ))}
                </div>
                <p className="text-slate-600 italic mb-6">
                  "The AI workout builder gave me exactly what I needed — I've never trained this efficiently."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                    GM
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Gabriel M.</p>
                    <p className="text-sm text-slate-600">Beta Tester</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="relative group animate-scale-in delay-100">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
              <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-5 w-5 text-amber-400">⭐</div>
                  ))}
                </div>
                <p className="text-slate-600 italic mb-6">
                  "Finally, a fitness app that understands my goals and adapts. The progress charts keep me motivated!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
                    SK
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Sarah K.</p>
                    <p className="text-sm text-slate-600">Athlete</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="relative group animate-scale-in delay-200">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
              <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-5 w-5 text-amber-400">⭐</div>
                  ))}
                </div>
                <p className="text-slate-600 italic mb-6">
                  "The nutrition insights helped me understand my diet better. Game changer for my weight loss journey!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
                    MR
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Michael R.</p>
                    <p className="text-sm text-slate-600">Health Coach</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 animate-gradient-x" />
        <div className="absolute inset-0 bg-dots opacity-20" />
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8 animate-scale-in">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to start your AI-powered fitness journey?
            </h2>
            <p className="text-xl text-blue-50">
              Join thousands of users transforming their fitness with intelligent technology
            </p>
            
            <Link
              href="/auth/signin"
              className="group relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-white px-10 py-5 text-xl font-bold text-blue-600 shadow-2xl transition-all duration-300 hover:shadow-white/30 hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <span className="relative z-10">Get Started Free</span>
              <ArrowRight className="relative z-10 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Link>

            <p className="text-sm text-blue-100">
              No credit card required • Free forever
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-3 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 rounded-xl bg-white p-2 shadow-lg">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold text-white">AI Fitness Tracker</span>
              </div>
              <p className="text-slate-400">
                Your intelligent companion for fitness, nutrition, and progress tracking.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Links</h3>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/library" className="hover:text-white transition-colors">Exercise Library</Link></li>
                <li><Link href="/ai-builder" className="hover:text-white transition-colors">AI Builder</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <div className="flex gap-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} AI-Powered Fitness Tracker. Built with Next.js & Gemini AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

