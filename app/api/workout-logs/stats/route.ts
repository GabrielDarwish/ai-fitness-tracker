import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get days parameter from query string
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30", 10);

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch workout logs within date range with exercises and sets
    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
        },
      },
      include: {
        exercises: {
          include: {
            sets: true,
            exercise: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Calculate stats for each workout
    const logsWithStats = workoutLogs.map((log) => {
      const totalSets = log.exercises.reduce(
        (sum, ex) => sum + ex.sets.length,
        0
      );

      const totalVolume = log.exercises.reduce(
        (sum, ex) =>
          sum +
          ex.sets.reduce((setSum, set) => setSum + set.reps * set.weight, 0),
        0
      );

      return {
        id: log.id,
        date: log.date,
        duration: log.duration,
        notes: log.notes,
        totalSets,
        totalVolume,
        exercises: log.exercises.map((ex) => ({
          name: ex.exercise.name,
          sets: ex.sets.length,
        })),
      };
    });

    return NextResponse.json({
      logs: logsWithStats,
      summary: {
        totalWorkouts: workoutLogs.length,
        totalSets: logsWithStats.reduce((sum, log) => sum + log.totalSets, 0),
        totalVolume: logsWithStats.reduce(
          (sum, log) => sum + log.totalVolume,
          0
        ),
        avgDuration:
          workoutLogs.length > 0
            ? Math.round(
                workoutLogs.reduce(
                  (sum, log) => sum + (log.duration || 0),
                  0
                ) / workoutLogs.length
              )
            : 0,
      },
    });
  } catch (error) {
    console.error("Workout stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout stats" },
      { status: 500 }
    );
  }
}

