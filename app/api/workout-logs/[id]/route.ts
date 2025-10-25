/**
 * Workout Log [ID] API Routes
 * GET /api/workout-logs/[id] - Get workout log details
 * PATCH /api/workout-logs/[id] - Update workout log
 */

import { NextResponse } from "next/server";
import { workoutService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";
import { parseRequestBody } from "@/lib/utils/validation";
import { UpdateWorkoutLogRequest } from "@/types/api";

export const GET = asyncHandler(
  async (req: Request, context: { params: { id: string } }) => {
    const user = await getCurrentUserProfile();
    const workoutLog = await workoutService.getWorkoutLog(context.params.id, user.id);

    return createSuccessResponse({ workoutLog });
  }
);

export const PATCH = asyncHandler(
  async (req: Request, context: { params: { id: string } }) => {
    const user = await getCurrentUserProfile();
    const body = await parseRequestBody<UpdateWorkoutLogRequest>(req);

    const result = await workoutService.updateWorkoutLog(
      context.params.id,
      user.id,
      body
    );

    return createSuccessResponse(result);
  }
);
