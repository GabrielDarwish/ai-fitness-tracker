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

  // Validate with Zod schema
  try {
    const { createWorkoutTemplateSchema } = await import("@/lib/validations/workout");
    const validatedData = createWorkoutTemplateSchema.parse(body);
    
    const result = await workoutService.createTemplate(user.id, validatedData);
    return createSuccessResponse(result, 201);
  } catch (error) {
    const { handleZodError } = await import("@/lib/utils/errors");
    handleZodError(error);
    throw error;
  }
});
