/**
 * Exercise API Routes
 * GET /api/exercises - Get exercises with filters
 */

import { NextResponse } from "next/server";
import { exerciseService } from "@/lib/services";
import { validatePagination } from "@/lib/utils/validation";
import { asyncHandler, createSuccessResponse, createErrorResponse } from "@/lib/utils/errors";
import { GetExercisesParams } from "@/types/api";

export const GET = asyncHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);

  // Parse and validate parameters
  const { limit, offset } = validatePagination(searchParams);

  const params: GetExercisesParams = {
    bodyPart: searchParams.get("bodyPart") || undefined,
    equipment: searchParams.get("equipment") || undefined,
    target: searchParams.get("target") || undefined,
    search: searchParams.get("search") || undefined,
    limit,
    offset,
  };

  // Fetch exercises using service
  const result = await exerciseService.getExercises(params);

  return createSuccessResponse(result);
});
