import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST - Log nutrition for today
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { calories, protein, carbs, fat, note } = await req.json();

    // Validate input
    if (
      typeof calories !== "number" ||
      typeof protein !== "number" ||
      typeof carbs !== "number" ||
      typeof fat !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid input", message: "All macro values must be numbers" },
        { status: 400 }
      );
    }

    // Check if there's already a log for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingLog = await prisma.nutritionLog.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    let nutritionLog;

    if (existingLog) {
      // Update existing log (add to current totals)
      nutritionLog = await prisma.nutritionLog.update({
        where: { id: existingLog.id },
        data: {
          calories: existingLog.calories + calories,
          protein: existingLog.protein + protein,
          carbs: existingLog.carbs + carbs,
          fat: existingLog.fat + fat,
          note: note
            ? existingLog.note
              ? `${existingLog.note}; ${note}`
              : note
            : existingLog.note,
        },
      });
    } else {
      // Create new log for today
      nutritionLog = await prisma.nutritionLog.create({
        data: {
          userId: user.id,
          date: today,
          calories,
          protein,
          carbs,
          fat,
          note: note || null,
        },
      });
    }

    return NextResponse.json({ nutritionLog });
  } catch (error: any) {
    console.error("Error logging nutrition:", error);
    return NextResponse.json(
      { error: "Failed to log nutrition", message: error.message },
      { status: 500 }
    );
  }
}

// GET - Fetch nutrition logs for last N days
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get days parameter from query (default 7)
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const logs = await prisma.nutritionLog.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("Error fetching nutrition logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition logs", message: error.message },
      { status: 500 }
    );
  }
}
