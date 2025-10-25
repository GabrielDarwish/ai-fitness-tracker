import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Get a single exercise by ID
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exerciseId = params.id;

    // Fetch exercise details
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: {
        id: true,
        apiId: true,
        name: true,
        gifUrl: true,
        bodyPart: true,
        equipment: true,
        target: true,
        instructions: true,
      },
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Check if user has saved this exercise
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    let isSaved = false;
    if (user) {
      const savedExercise = await prisma.savedExercise.findUnique({
        where: {
          userId_exerciseId: {
            userId: user.id,
            exerciseId: exerciseId,
          },
        },
      });
      isSaved = !!savedExercise;
    }

    return NextResponse.json(
      {
        exercise,
        isSaved,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching exercise details:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercise details" },
      { status: 500 }
    );
  }
}

