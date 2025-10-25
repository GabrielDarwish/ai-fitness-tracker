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
  
  const limit = parseInt(searchParams.get("limit") || "10");
  const result = await workoutService.getRecentWorkouts(user.id, limit);

  return createSuccessResponse(result);
});
