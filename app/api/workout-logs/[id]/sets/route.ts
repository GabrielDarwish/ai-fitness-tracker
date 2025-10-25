import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * POST - Add a set to a logged exercise
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: workoutLogId } = params;
    const { loggedExerciseId, reps, weight, restTime } = await req.json();

    if (!loggedExerciseId || !reps) {
      return NextResponse.json(
        { error: "LoggedExerciseId and reps are required" },
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

    // Verify workout log belongs to user
    const workoutLog = await prisma.workoutLog.findFirst({
      where: {
        id: workoutLogId,
        userId: user.id,
      },
    });

    if (!workoutLog) {
      return NextResponse.json(
        { error: "Workout log not found" },
        { status: 404 }
      );
    }

    // Create logged set
    const loggedSet = await prisma.loggedSet.create({
      data: {
        loggedExerciseId,
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : null,
        restTime: restTime ? parseInt(restTime) : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        set: loggedSet,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding set:", error);
    return NextResponse.json(
      { error: "Failed to add set" },
      { status: 500 }
    );
  }
}

