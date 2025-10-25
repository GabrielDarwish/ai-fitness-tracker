/**
 * Workout Template API Routes
 * GET /api/workout-templates - Get all workout templates
 * POST /api/workout-templates - Create a new workout template
 */

import { NextResponse } from "next/server";
import { workoutService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse, ValidationError } from "@/lib/utils/errors";
import { parseRequestBody, validateRequiredFields } from "@/lib/utils/validation";
import { CreateWorkoutTemplateRequest } from "@/types/api";

/**
 * GET - Fetch all workout templates for the user
 */
export const GET = asyncHandler(async () => {
  const user = await getCurrentUserProfile();
  const result = await workoutService.getTemplates(user.id);

  return createSuccessResponse(result);
});

/**
 * POST - Create a new workout template
 */
export const POST = asyncHandler(async (req: Request) => {
  const user = await getCurrentUserProfile();
  const body = await parseRequestBody<CreateWorkoutTemplateRequest>(req);

  validateRequiredFields(body, ["name", "exercises"]);

  if (!Array.isArray(body.exercises) || body.exercises.length === 0) {
    throw new ValidationError("Exercises must be a non-empty array");
  }

  const result = await workoutService.createTemplate(user.id, body);

  return createSuccessResponse(result, 201);
});
