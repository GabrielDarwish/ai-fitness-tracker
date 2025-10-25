import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

interface SaveWorkoutRequest {
  name: string;
  description?: string;
  exercises: Array<{
    exerciseId: string;
    sets: number;
    reps: string;
    restTime: number;
    notes?: string;
  }>;
}

/**
 * POST - Save a new workout template
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, exercises } = await req.json() as SaveWorkoutRequest;

    if (!name || !exercises || exercises.length === 0) {
      return NextResponse.json(
        { error: "Name and exercises are required" },
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

    // Create workout template with exercises in a transaction
    const workoutTemplate = await prisma.$transaction(async (tx) => {
      // Create the template
      const template = await tx.workoutTemplate.create({
        data: {
          userId: user.id,
          name,
          description: description || null,
          isPublic: false,
        },
      });

      // Create template exercises
      const templateExercises = await Promise.all(
        exercises.map((ex, index) =>
          tx.templateExercise.create({
            data: {
              templateId: template.id,
              exerciseId: ex.exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              restTime: ex.restTime,
            },
          })
        )
      );

      return {
        ...template,
        exercises: templateExercises,
      };
    });

    console.log(`✅ Saved workout template: ${name} with ${exercises.length} exercises`);

    return NextResponse.json(
      {
        success: true,
        template: workoutTemplate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving workout template:", error);
    return NextResponse.json(
      {
        error: "Failed to save workout template",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Fetch user's workout templates
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch templates with exercises
    const templates = await prisma.workoutTemplate.findMany({
      where: { userId: user.id },
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                gifUrl: true,
                bodyPart: true,
                equipment: true,
                target: true,
              },
            },
          },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates }, { status: 200 });
  } catch (error) {
    console.error("Error fetching workout templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout templates" },
      { status: 500 }
    );
  }
}

