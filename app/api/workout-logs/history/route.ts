import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET - Fetch workout logs for a date range (for calendar view)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch workout logs within date range
    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                bodyPart: true,
              },
            },
            sets: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Calculate stats for each workout
    const logsWithStats = workoutLogs.map((log) => {
      const totalSets = log.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
      const totalVolume = log.exercises.reduce(
        (sum, ex) =>
          sum +
          ex.sets.reduce((setSum, set) => setSum + (set.weight || 0) * set.reps, 0),
        0
      );

      return {
        id: log.id,
        date: log.date,
        duration: log.duration,
        notes: log.notes,
        exerciseCount: log.exercises.length,
        totalSets,
        totalVolume: Math.round(totalVolume),
        exercises: log.exercises.map((ex) => ({
          name: ex.exercise.name,
          bodyPart: ex.exercise.bodyPart,
          setsCount: ex.sets.length,
        })),
      };
    });

    return NextResponse.json({ workouts: logsWithStats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching workout history:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout history" },
      { status: 500 }
    );
  }
}

