/**
 * AI Form Tips API Route
 * POST /api/ai/form-tips - Generate exercise form tips
 */

import { NextResponse } from "next/server";
import { aiService } from "@/lib/services";
import { getCurrentUser } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";
import { parseRequestBody, validateRequiredFields } from "@/lib/utils/validation";

export const POST = asyncHandler(async (req: Request) => {
  await getCurrentUser();
  
  const body = await parseRequestBody<{
    exerciseName: string;
    bodyPart?: string;
    target?: string;
    equipment?: string;
  }>(req);

  validateRequiredFields(body, ["exerciseName"]);

  if (!aiService.isConfigured()) {
    return createSuccessResponse(
      {
        success: true,
        tips: "AI form tips are not available. Please add GEMINI_API_KEY to your environment variables.",
      },
      200
    );
  }

  // Simple form tips generation
  const prompt = `Provide 3-4 brief form tips for ${body.exerciseName}. Focus on proper technique and safety.`;
  const tips = await aiService.generateInsights(prompt);

  return createSuccessResponse(
    {
      success: true,
      tips,
    },
    200
  );
});
