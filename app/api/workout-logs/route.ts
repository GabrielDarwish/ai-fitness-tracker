import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * POST - Create a new workout log (start a workout)
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await req.json();

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
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

    // Verify template exists and belongs to user
    const template = await prisma.workoutTemplate.findFirst({
      where: {
        id: templateId,
        userId: user.id,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Workout template not found" },
        { status: 404 }
      );
    }

    // Create workout log with logged exercises
    const workoutLog = await prisma.$transaction(async (tx) => {
      // Create the workout log
      const log = await tx.workoutLog.create({
        data: {
          userId: user.id,
          date: new Date(),
        },
      });

      // Create logged exercises for each exercise in the template
      const loggedExercises = await Promise.all(
        template.exercises.map((templateEx) =>
          tx.loggedExercise.create({
            data: {
              workoutLogId: log.id,
              exerciseId: templateEx.exerciseId,
            },
          })
        )
      );

      return {
        ...log,
        exercises: loggedExercises,
        template,
      };
    });

    return NextResponse.json(
      {
        success: true,
        workoutLog,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating workout log:", error);
    return NextResponse.json(
      { error: "Failed to create workout log" },
      { status: 500 }
    );
  }
}

