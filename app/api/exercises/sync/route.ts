/**
 * Exercise Sync API Route
 * POST /api/exercises/sync - Manually trigger exercise sync
 */

import { NextResponse } from "next/server";
import { exerciseService } from "@/lib/services";
import { getCurrentUser } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";

export const POST = asyncHandler(async () => {
  // Require authentication
  await getCurrentUser();

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
