/**
 * Workout History API Route
 * GET /api/workout-logs/history - Get workout history with stats
 */

import { NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";
import { workoutService } from "@/lib/services";

export const GET = asyncHandler(async (req: Request) => {
  const user = await getCurrentUserProfile();
  const { searchParams } = new URL(req.url);
  
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const limit = parseInt(searchParams.get("limit") || "100");

  // If date range is provided, filter by it
  if (startDate && endDate) {
    const result = await workoutService.getWorkoutsByDateRange(
      user.id,
      new Date(startDate),
      new Date(endDate)
    );
    return createSuccessResponse(result);
  }

  // Otherwise, get recent workouts
  const result = await workoutService.getRecentWorkouts(user.id, limit);
  return createSuccessResponse(result);
});
