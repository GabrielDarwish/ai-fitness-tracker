/**
 * AI Insights API Route
 * POST /api/ai/insights - Generate AI insights based on recent activity
 */

import { NextResponse } from "next/server";
import { aiService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";

export const POST = asyncHandler(async () => {
  const user = await getCurrentUserProfile();

  // Generate insights
  const insights = await aiService.generateInsights(user.goals || undefined);

  return createSuccessResponse(
    {
      success: true,
      insights,
    },
    200
  );
});
