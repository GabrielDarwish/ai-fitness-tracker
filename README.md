# 🏋️ AI Fitness Tracker

An AI-powered full-stack fitness tracking application built with Next.js 14, Supabase, and Gemini AI.

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
│   │   ├── ai/route.ts
│   │   ├── exercises/route.ts
│   │   └── nutrition/route.ts
│   ├── dashboard/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── lib/
│   ├── db.ts
│   └── auth.ts
├── prisma/
│   └── schema.prisma
└── components/
    └── ui/
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
