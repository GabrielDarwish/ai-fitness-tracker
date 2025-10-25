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
    await workoutService.deleteTemplate(params.id, user.id);

    // Return 204 No Content for successful deletion
    return new Response(null, { status: 204 });
  }
);
