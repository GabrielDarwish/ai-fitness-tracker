/**
 * Workout Log API Routes
 * POST /api/workout-logs - Start a new workout from template
 */

import { NextResponse } from "next/server";
import { workoutService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";
import { parseRequestBody, validateRequiredFields } from "@/lib/utils/validation";
import { CreateWorkoutLogRequest } from "@/types/api";

export const POST = asyncHandler(async (req: Request) => {
  const user = await getCurrentUserProfile();
  const body = await parseRequestBody<CreateWorkoutLogRequest>(req);

  validateRequiredFields(body, ["templateId"]);

  const result = await workoutService.startWorkout(user.id, body);

  return createSuccessResponse(result, 201);
});
