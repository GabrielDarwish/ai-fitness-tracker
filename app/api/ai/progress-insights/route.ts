/**
 * AI Progress Insights API Route
 * GET /api/ai/progress-insights - Generate detailed progress analysis
 */

import { NextResponse } from "next/server";
import { aiService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";

export const GET = asyncHandler(async () => {
  const user = await getCurrentUserProfile();

  // Generate progress insights
  const insights = await aiService.generateInsights(user.goals || undefined);

  return createSuccessResponse(
    {
      strengths: [insights],
      improvements: ["Keep tracking your progress consistently"],
      recommendations: ["Stay focused on your goals"],
    },
    200
  );
});
