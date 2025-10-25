import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET - Fetch user's saved exercises
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch saved exercises with exercise details
    const savedExercises = await prisma.savedExercise.findMany({
      where: { userId: user.id },
      include: {
        exercise: {
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
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ savedExercises }, { status: 200 });
  } catch (error) {
    console.error("Error fetching saved exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved exercises" },
      { status: 500 }
    );
  }
}

/**
 * POST - Save an exercise for the user
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { exerciseId } = await req.json();

    if (!exerciseId) {
      return NextResponse.json(
        { error: "exerciseId is required" },
        { status: 400 }
      );
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Save exercise (or do nothing if already saved due to unique constraint)
    const savedExercise = await prisma.savedExercise.upsert({
      where: {
        userId_exerciseId: {
          userId: user.id,
          exerciseId: exerciseId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        exerciseId: exerciseId,
      },
    });

    return NextResponse.json(
      { success: true, savedExercise },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving exercise:", error);
    return NextResponse.json(
      { error: "Failed to save exercise" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove a saved exercise
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const exerciseId = searchParams.get("exerciseId");

    if (!exerciseId) {
      return NextResponse.json(
        { error: "exerciseId is required" },
        { status: 400 }
      );
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete saved exercise
    await prisma.savedExercise.deleteMany({
      where: {
        userId: user.id,
        exerciseId: exerciseId,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error removing saved exercise:", error);
    return NextResponse.json(
      { error: "Failed to remove saved exercise" },
      { status: 500 }
    );
  }
}

