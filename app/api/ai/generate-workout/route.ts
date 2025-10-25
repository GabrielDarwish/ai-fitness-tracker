/**
 * AI Generate Workout API Route
 * POST /api/ai/generate-workout - Generate a workout plan using AI
 */

import { NextResponse } from "next/server";
import { aiService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";
import { parseRequestBody, validateRequiredFields, validateArray } from "@/lib/utils/validation";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit";
import { GenerateWorkoutRequest } from "@/types/api";

export const POST = asyncHandler(async (req: Request) => {
  const user = await getCurrentUserProfile();
  
  // Rate limit AI generation (expensive operation)
  checkRateLimit(user.id, RATE_LIMITS.AI_GENERATION);
  
  const body = await parseRequestBody<GenerateWorkoutRequest>(req);

  validateRequiredFields(body, ["goal", "equipment", "duration", "focusArea"]);
  validateArray(body.equipment, "equipment");

  const workout = await aiService.generateWorkout(body);

  return createSuccessResponse(
      {
        success: true,
      workout,
    },
    200
  );
});
