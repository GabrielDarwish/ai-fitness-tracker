# 🏋️ AI Fitness Tracker

An AI-powered full-stack fitness tracking application built with Next.js 14, Supabase, and Gemini AI.

## ✨ Features

### ✅ Completed

1. **🔐 Authentication**
   - Google & GitHub OAuth
   - Secure session management with NextAuth.js
   - Account linking support

2. **👤 User Onboarding**
   - 3-step onboarding flow (Profile, Goals, Equipment)
   - Form validation with Zod
   - Elegant, modern design

3. **📚 Exercise Library**
   - 1300+ exercises from ExerciseDB API
   - Auto-sync on first visit (cached locally)
   - Filter by body part, equipment, target muscle
   - Keyword search
   - Save/unsave favorites
   - Detailed exercise pages with GIF demos

4. **🤖 AI Workout Builder**
   - Generate personalized workouts using Google Gemini AI
   - Based on user goals, equipment, duration, and focus area
   - Smart exercise selection from your available equipment
   - Structured workout plans (sets, reps, rest time)
   - Save workouts as templates

5. **💪 My Workouts**
   - View all saved workout templates
   - Start live workout sessions
   - Edit and delete templates
   - Expandable exercise details

6. **📝 Active Workout Logging**
   - Live workout sessions with timer
   - Progress bar for workout completion
   - Log sets, reps, and weight for each exercise
   - Automatic workout summary and statistics
   - Save completed workouts to history

7. **📅 Calendar View**
   - Weekly schedule with workout cards
   - Navigation by week
   - Visual consistency tracking
   - Weekly stats (workouts, sets, volume, time)
   - Click cards for detailed summaries

8. **🍽️ Nutrition Tracking**
   - AI-powered food recognition (Nutritionix API)
   - Natural language meal logging
   - Automatic macro calculation
   - Daily and weekly nutrition stats
   - Recent log history
   - Today's nutrition summary

9. **📊 Progress Dashboard**
   - Interactive charts (Recharts)
   - Training volume over time
   - Workout frequency analysis
   - Calorie and protein intake trends
   - Macro distribution pie chart
   - 30-day stats and consistency tracking

### 🚧 Coming Soon

- **🏆 Achievements** - Unlock badges and milestones
- **📈 Body Measurements** - Track weight, measurements, and photos
- **🔔 Notifications** - Workout reminders and streak alerts

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Auth:** NextAuth.js with Google OAuth
- **State Management:** React Query (@tanstack/react-query)
- **AI:** Google Gemini 1.5-flash
- **Charts:** Recharts
- **External APIs:** ExerciseDB, Nutritionix

## 🎨 Design System

- **Primary Color:** `#3B82F6` (Blue)
- **Secondary Color:** `#10B981` (Green)
- **Accent Color:** `#F59E0B` (Amber)
- **Font:** Inter

## 📁 Project Structure

```
ai-fitness-tracker/
├── app/
│   ├── (auth)/
│   │   └── signin/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── ai/
│   │   │   ├── generate-workout/route.ts
│   │   │   ├── form-tips/route.ts
│   │   │   ├── insights/route.ts
│   │   │   └── progress-insights/route.ts
│   │   ├── exercises/
│   │   │   ├── route.ts
│   │   │   ├── sync/route.ts
│   │   │   └── favorites/route.ts
│   │   ├── nutrition/
│   │   │   ├── analyze/route.ts
│   │   │   └── logs/route.ts
│   │   ├── workout-templates/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── workout-logs/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   ├── [id]/sets/route.ts
│   │   │   └── history/route.ts
│   │   └── user/route.ts
│   ├── dashboard/page.tsx
│   ├── library/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── ai-builder/page.tsx
│   ├── workouts/
│   │   ├── page.tsx
│   │   ├── [id]/active/page.tsx
│   │   └── summary/[id]/page.tsx
│   ├── calendar/page.tsx
│   ├── nutrition/page.tsx
│   ├── progress/page.tsx
│   ├── onboarding/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── lib/
│   ├── db.ts
│   ├── prisma.ts
│   ├── auth.ts
│   └── validations/
├── prisma/
│   └── schema.prisma
├── components/
│   └── ui/
└── scripts/
    └── reset-db.mjs
```

## ⚙️ Setup Instructions

### 1. Clone and Install

```bash
cd ai-fitness-tracker
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Update the following variables:

- `DATABASE_URL`: Your Supabase PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- `GEMINI_API_KEY`: From Google AI Studio
- `NUTRITIONIX_APP_ID` & `NUTRITIONIX_API_KEY`: From Nutritionix
- `EXERCISEDB_API_KEY`: From RapidAPI

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your connection string from Project Settings → Database
3. Update `DATABASE_URL` in `.env`

### 4. Database Migration

Run Prisma migrations to create tables in Supabase:

```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🗄️ Database Management

- **View Database:** `npx prisma studio`
- **Create Migration:** `npx prisma migrate dev --name <migration_name>`
- **Reset Database:** `npx prisma migrate reset`

## 🔑 Key Features (Coming Soon)

- 🏋️ **Workout Tracking:** Log exercises with sets, reps, and weight
- 🥗 **Nutrition Logging:** Track macros with natural language input
- 📊 **Progress Visualization:** Charts and graphs of your fitness journey
- 🤖 **AI Insights:** Gemini-powered workout suggestions and progress analysis
- 🔍 **Exercise Database:** Search 1000+ exercises by muscle group and equipment
- 🎯 **Goal Setting:** Set and track fitness goals

## 📝 API Endpoints

- `POST /api/auth/[...nextauth]` - NextAuth.js authentication
- `POST /api/ai` - AI-powered insights and workout generation
- `GET /api/exercises` - Exercise database search
- `POST /api/nutrition` - Nutrition logging

## 🚢 Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Make sure to add all environment variables in the Vercel dashboard.

## 📄 License

MIT

---

Built with ❤️ using Next.js and AI
