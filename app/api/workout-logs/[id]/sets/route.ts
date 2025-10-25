/**
 * Workout Log Sets API Route
 * POST /api/workout-logs/[id]/sets - Add a set to a logged exercise
 */

import { NextResponse } from "next/server";
import { workoutService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";
import { parseRequestBody, validateRequiredFields } from "@/lib/utils/validation";
import { AddSetRequest } from "@/types/api";

export const POST = asyncHandler(
  async (req: Request, context?: { params: { id: string } }) => {
    const user = await getCurrentUserProfile();
    const body = await parseRequestBody<AddSetRequest>(req);
    const workoutLogId = context?.params.id;
    
    if (!workoutLogId) {
      throw new Error("Workout log ID is required");
    }

    validateRequiredFields(body, ["loggedExerciseId", "reps"]);

    // Verify workout log belongs to user
    await workoutService.getWorkoutLog(workoutLogId, user.id);

    // Add set
    const result = await workoutService.addSet(body);

    return createSuccessResponse(result, 201);
  }
);
