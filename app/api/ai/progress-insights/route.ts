/**
 * AI Progress Insights API Route
 * GET /api/ai/progress-insights - Generate detailed progress analysis based on real data
 */

import { NextResponse } from "next/server";
import { aiService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";

export const GET = asyncHandler(async () => {
  const user = await getCurrentUserProfile();

  // Generate comprehensive progress insights with real data
  const result = await aiService.generateProgressInsights(
    user.id,
    user.goals || undefined
  );

  return createSuccessResponse(result, 200);
});
