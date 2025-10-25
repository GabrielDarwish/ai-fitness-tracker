/**
 * Exercise Sync API Route
 * POST /api/exercises/sync - Manually trigger exercise sync
 */

import { NextResponse } from "next/server";
import { exerciseService } from "@/lib/services";
import { getCurrentUser } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit";

export const POST = asyncHandler(async () => {
  // Require authentication
  const { id: userId } = await getCurrentUser();
  
  // Rate limit exercise sync (expensive external API operation)
  checkRateLimit(userId, RATE_LIMITS.EXERCISE_SYNC);

  // Sync exercises from ExerciseDB
  const result = await exerciseService.syncExercises();

  return createSuccessResponse(
    {
      success: true,
      count: result.count,
      message: result.message,
    },
    200
  );
});
