/**
 * Nutrition Logs API Routes
 * POST /api/nutrition/logs - Log nutrition for today
 * GET /api/nutrition/logs - Get nutrition logs
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse, ValidationError } from "@/lib/utils/errors";
import { parseRequestBody } from "@/lib/utils/validation";
import { CreateNutritionLogRequest } from "@/types/api";

export const POST = asyncHandler(async (req: Request) => {
  const user = await getCurrentUserProfile();
  const body = await parseRequestBody<CreateNutritionLogRequest>(req);

  // Validate macros are numbers
  if (
    typeof body.calories !== "number" ||
    typeof body.protein !== "number" ||
    typeof body.carbs !== "number" ||
    typeof body.fat !== "number"
  ) {
    throw new ValidationError("All macro values must be numbers");
  }

  // Check if there's already a log for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingLog = await prisma.nutritionLog.findFirst({
    where: {
      userId: user.id,
      date: { gte: today, lt: tomorrow },
    },
  });

  let nutritionLog;

  if (existingLog) {
    // Update existing log (add to current totals)
    nutritionLog = await prisma.nutritionLog.update({
      where: { id: existingLog.id },
      data: {
        calories: existingLog.calories + body.calories,
        protein: existingLog.protein + body.protein,
        carbs: existingLog.carbs + body.carbs,
        fat: existingLog.fat + body.fat,
        note: body.note
          ? existingLog.note
            ? `${existingLog.note}; ${body.note}`
            : body.note
          : existingLog.note,
      },
    });
  } else {
    // Create new log for today
    nutritionLog = await prisma.nutritionLog.create({
      data: {
        userId: user.id,
        date: today,
        calories: body.calories,
        protein: body.protein,
        carbs: body.carbs,
        fat: body.fat,
        note: body.note || null,
      },
    });
  }

  return createSuccessResponse({ nutritionLog });
});

export const GET = asyncHandler(async (req: Request) => {
  const user = await getCurrentUserProfile();
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const logs = await prisma.nutritionLog.findMany({
    where: {
      userId: user.id,
      date: { gte: startDate },
    },
    orderBy: { date: "desc" },
  });

  return createSuccessResponse({ logs });
});
