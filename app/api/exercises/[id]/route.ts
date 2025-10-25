/**
 * Single Exercise API Route
 * GET /api/exercises/[id] - Get exercise details with saved status
 */

import { NextResponse } from "next/server";
import { exerciseService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";

export const GET = asyncHandler(
  async (req: Request, context?: { params: { id: string } }) => {
    const user = await getCurrentUserProfile();
    const exerciseId = context?.params.id;
    
    if (!exerciseId) {
      throw new Error("Exercise ID is required");
    }

    // Get exercise details
    const exercise = await exerciseService.getExerciseById(exerciseId);

    // Check if saved
    const isSaved = await exerciseService.isSavedByUser(user.id, exerciseId);

    return createSuccessResponse({
      exercise,
      isSaved,
    });
  }
);
