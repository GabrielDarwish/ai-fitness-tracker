/**
 * Workout Template [ID] API Route
 * DELETE /api/workout-templates/[id] - Delete a workout template
 */

import { NextResponse } from "next/server";
import { workoutService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";

export const DELETE = asyncHandler(
  async (req: Request, context?: { params: { id: string } }) => {
    const user = await getCurrentUserProfile();
    const templateId = context?.params.id;
    
    if (!templateId) {
      throw new Error("Template ID is required");
    }
    
    await workoutService.deleteTemplate(templateId, user.id);

    // Return 204 No Content for successful deletion
    return new NextResponse(null, { status: 204 });
  }
);
