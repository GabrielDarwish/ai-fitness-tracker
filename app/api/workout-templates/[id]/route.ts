/**
 * Workout Template [ID] API Route
 * DELETE /api/workout-templates/[id] - Delete a workout template
 */

import { NextResponse } from "next/server";
import { workoutService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";

export const DELETE = asyncHandler(
  async (req: Request, { params }: { params: { id: string } }) => {
    const user = await getCurrentUserProfile();
    const result = await workoutService.deleteTemplate(params.id, user.id);

    return createSuccessResponse(result);
  }
);
