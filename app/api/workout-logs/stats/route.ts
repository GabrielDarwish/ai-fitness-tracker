/**
 * Workout Stats API Route
 * GET /api/workout-logs/stats - Get workout statistics
 */

import { NextResponse } from "next/server";
import { workoutService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";

export const GET = asyncHandler(async () => {
  const user = await getCurrentUserProfile();
  const stats = await workoutService.getStats(user.id);

  return createSuccessResponse(stats);
});
