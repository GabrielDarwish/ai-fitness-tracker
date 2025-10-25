import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET - Generate AI progress insights based on workout and nutrition data
 */
export async function GET() {
  console.log("🧠 AI Progress Insights API called");
  
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
          strengths: ["Keep logging your workouts!"],
          improvements: ["Add AI insights by setting GEMINI_API_KEY"],
          recommendations: ["Stay consistent with your training"],
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

    // Get last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch recent workouts
    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId: user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        exercises: {
          include: {
            sets: true,
            exercise: {
              select: {
                name: true,
                bodyPart: true,
                target: true,
              },
            },
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
          gte: thirtyDaysAgo,
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

    // Get body parts trained
    const bodyPartCounts: Record<string, number> = {};
    workoutLogs.forEach(log => {
      log.exercises.forEach(ex => {
        const bodyPart = ex.exercise.bodyPart || "unknown";
        bodyPartCounts[bodyPart] = (bodyPartCounts[bodyPart] || 0) + 1;
      });
    });

    const bodyPartsText = Object.entries(bodyPartCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([part, count]) => `${part} (${count} exercises)`)
      .join(", ");

    // Build AI prompt
    const prompt = `You are a professional fitness coach analyzing a user's progress. Based on the following data from the last 30 days, provide structured feedback.

**User Goal:** ${user.goals || "general fitness"}

**Workout Summary (Last 30 Days):**
- Workouts completed: ${workoutCount}
- Total sets: ${totalSets}
- Total volume: ${Math.round(totalVolume / 1000)} tons lifted
- Body parts trained: ${bodyPartsText || "none"}

**Nutrition Summary (Last 30 Days):**
- Days logged: ${nutritionLogs.length}
- Average calories: ${avgCalories} kcal/day
- Average protein: ${avgProtein}g/day

Provide your analysis in this exact JSON format (no markdown, just raw JSON):
{
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}

Each point should be 1-2 sentences, specific, actionable, and encouraging. Focus on data patterns you see.`;

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
          strengths: ["You're making progress!"],
          improvements: ["Keep tracking your workouts"],
          recommendations: ["Stay consistent with your training"],
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log("✅ Gemini API response received");
    
    let insightsText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean up markdown code blocks if present
    insightsText = insightsText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    console.log("📝 Raw insights:", insightsText);

    // Parse JSON response
    let insights;
    try {
      insights = JSON.parse(insightsText);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      return NextResponse.json(
        {
          strengths: ["You're making great progress! Keep up the consistency."],
          improvements: ["Consider tracking more metrics to get detailed insights"],
          recommendations: ["Stay focused on your goals and celebrate small wins"],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        ...insights,
        stats: {
          workouts: workoutCount,
          totalSets,
          totalVolume: Math.round(totalVolume / 1000),
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
        strengths: ["Keep up the great work!"],
        improvements: ["Consistency is key"],
        recommendations: ["Focus on progressive overload"],
      },
      { status: 200 }
    );
  }
}

