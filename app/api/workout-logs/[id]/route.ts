import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET - Get a specific workout log
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

    const { id } = params;

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch workout log with exercises and sets
    const workoutLog = await prisma.workoutLog.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: { id: "asc" },
            },
          },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!workoutLog) {
      return NextResponse.json(
        { error: "Workout log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ workoutLog }, { status: 200 });
  } catch (error) {
    console.error("Error fetching workout log:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout log" },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update a workout log (mark as completed / add notes)
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { duration, notes } = await req.json();

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update workout log
    const workoutLog = await prisma.workoutLog.updateMany({
      where: {
        id,
        userId: user.id,
      },
      data: {
        ...(duration !== undefined && { duration }),
        ...(notes !== undefined && { notes }),
      },
    });

    if (workoutLog.count === 0) {
      return NextResponse.json(
        { error: "Workout log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating workout log:", error);
    return NextResponse.json(
      { error: "Failed to update workout log" },
      { status: 500 }
    );
  }
}

