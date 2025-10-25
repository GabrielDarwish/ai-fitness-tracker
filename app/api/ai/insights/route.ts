import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * POST - Generate AI insights based on recent workout and nutrition data
 */
export async function POST(req: Request) {
  console.log("🧠 AI Insights API called");
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log("❌ Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          error: "AI feature not configured",
          insights: "AI insights are not available. Please add GEMINI_API_KEY to your environment variables."
        },
        { status: 200 }
      );
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        goals: true,
        age: true,
        weight: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get last 7 days of data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch recent workouts
    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId: user.id,
        date: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Fetch recent nutrition logs
    const nutritionLogs = await prisma.nutritionLog.findMany({
      where: {
        userId: user.id,
        date: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Calculate stats
    const workoutCount = workoutLogs.length;
    const totalSets = workoutLogs.reduce(
      (sum, log) => sum + log.exercises.reduce((s, ex) => s + ex.sets.length, 0),
      0
    );
    const totalVolume = workoutLogs.reduce(
      (sum, log) =>
        sum +
        log.exercises.reduce(
          (s, ex) =>
            s + ex.sets.reduce((ss, set) => ss + (set.weight || 0) * set.reps, 0),
          0
        ),
      0
    );

    const avgCalories = nutritionLogs.length > 0
      ? Math.round(nutritionLogs.reduce((sum, log) => sum + log.calories, 0) / nutritionLogs.length)
      : 0;

    const avgProtein = nutritionLogs.length > 0
      ? Math.round(nutritionLogs.reduce((sum, log) => sum + log.protein, 0) / nutritionLogs.length)
      : 0;

    // Build AI prompt
    const prompt = `You are a professional fitness coach analyzing a user's progress. Based on the following data from the last 7 days, provide a short, motivational insight (2-3 sentences max).

**User Goal:** ${user.goals || "general fitness"}

**Workout Summary (Last 7 Days):**
- Workouts completed: ${workoutCount}
- Total sets: ${totalSets}
- Total volume: ${Math.round(totalVolume)} kg lifted

**Nutrition Summary (Last 7 Days):**
- Nutrition logs: ${nutritionLogs.length} days
- Average calories: ${avgCalories} kcal/day
- Average protein: ${avgProtein}g/day

Provide specific, actionable feedback. If data is limited, encourage consistency. Be encouraging but honest. Keep it brief and motivational.`;

    console.log("🚀 Calling Gemini API for insights...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return NextResponse.json(
        {
          error: "Failed to generate insights",
          insights: "Unable to generate insights at this time. Keep up the great work!",
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log("✅ Gemini API response received");
    
    const insights = data.candidates?.[0]?.content?.parts?.[0]?.text || "Keep pushing! Your consistency will pay off.";

    return NextResponse.json(
      {
        success: true,
        insights,
        stats: {
          workouts: workoutCount,
          totalSets,
          totalVolume: Math.round(totalVolume),
          avgCalories,
          avgProtein,
          nutritionDays: nutritionLogs.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      {
        error: "Failed to generate insights",
        insights: "Keep up the great work! Consistency is key to reaching your goals.",
      },
      { status: 200 }
    );
  }
}

