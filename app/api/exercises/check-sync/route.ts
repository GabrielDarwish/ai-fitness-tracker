/**
 * Exercise Check Sync API Route
 * GET /api/exercises/check-sync - Check if exercises are synced, auto-sync if not
 */

import { NextResponse } from "next/server";
import { exerciseService } from "@/lib/services";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";

export const GET = asyncHandler(async () => {
  const syncStatus = await exerciseService.checkSync();

  // If not synced, auto-sync
  if (!syncStatus.synced) {
    try {
      const syncResult = await exerciseService.syncExercises();
      return createSuccessResponse({
        synced: true,
        count: syncResult.count,
        message: syncResult.message,
      });
    } catch (error) {
      // Return error details for setup issues
      return NextResponse.json(
        {
          synced: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to sync exercises",
        },
        { status: 500 }
      );
    }
  }

  return createSuccessResponse(syncStatus);
});
