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
  async (req: Request, { params }: { params: { id: string } }) => {
    const user = await getCurrentUserProfile();
    const body = await parseRequestBody<AddSetRequest>(req);

    validateRequiredFields(body, ["loggedExerciseId", "reps"]);

    // Verify workout log belongs to user
    await workoutService.getWorkoutLog(params.id, user.id);

    // Add set
    const result = await workoutService.addSet(body);

    return createSuccessResponse(result, 201);
  }
);
