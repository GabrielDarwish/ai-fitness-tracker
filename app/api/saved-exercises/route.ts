/**
 * Saved Exercise API Routes
 * GET /api/saved-exercises - Get user's saved exercises
 * POST /api/saved-exercises - Save an exercise
 * DELETE /api/saved-exercises - Remove a saved exercise
 */

import { NextResponse } from "next/server";
import { exerciseService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import {
  asyncHandler,
  createSuccessResponse,
  ValidationError,
} from "@/lib/utils/errors";
import { parseRequestBody, validateRequiredFields } from "@/lib/utils/validation";
import { SaveExerciseRequest } from "@/types/api";

/**
 * GET - Fetch user's saved exercises
 */
export const GET = asyncHandler(async () => {
  const user = await getCurrentUserProfile();
  const result = await exerciseService.getSavedExercises(user.id);

  return createSuccessResponse(result);
});

/**
 * POST - Save an exercise
 */
export const POST = asyncHandler(async (req: Request) => {
  const user = await getCurrentUserProfile();
  const body = await parseRequestBody<SaveExerciseRequest>(req);

  validateRequiredFields(body, ["exerciseId"]);

  const result = await exerciseService.saveExercise(user.id, body.exerciseId);

  return createSuccessResponse(result, 201);
});

/**
 * DELETE - Remove a saved exercise
 */
export const DELETE = asyncHandler(async (req: Request) => {
  const user = await getCurrentUserProfile();
  const { searchParams } = new URL(req.url);
  const exerciseId = searchParams.get("exerciseId");

  if (!exerciseId) {
    throw new ValidationError("Exercise ID is required");
  }

  const result = await exerciseService.unsaveExercise(user.id, exerciseId);

  return createSuccessResponse(result);
});
