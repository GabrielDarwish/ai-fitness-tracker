/**
 * AI Insights API Route
 * GET /api/ai/insights - Generate AI insights based on real user data
 */

import { NextResponse } from "next/server";
import { aiService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";

export const GET = asyncHandler(async () => {
  const user = await getCurrentUserProfile();

  // Generate data-driven insights
  const insights = await aiService.generatePersonalizedInsights(
    user.id,
    user.goals || undefined
  );

  return createSuccessResponse(
    {
      success: true,
      insights,
    },
    200
  );
});
