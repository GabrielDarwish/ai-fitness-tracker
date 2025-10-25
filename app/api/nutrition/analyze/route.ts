/**
 * Nutrition Analyze API Route
 * POST /api/nutrition/analyze - Analyze food using Gemini AI
 * Note: Originally designed for Nutritionix API, but migrated to Gemini AI
 * as Nutritionix no longer offers a free tier.
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse, AppError } from "@/lib/utils/errors";
import { parseRequestBody } from "@/lib/utils/validation";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit";

export const POST = asyncHandler(async (req: Request) => {
  const { id: userId } = await getCurrentUser();
  
  // Rate limit nutrition analysis (AI API call)
  checkRateLimit(userId, RATE_LIMITS.NUTRITION_ANALYZE);

  const body = await parseRequestBody<{ query: string }>(req);
  
  // Validate with Zod schema
  try {
    const { analyzeFoodSchema } = await import("@/lib/validations/nutrition");
    const validatedData = analyzeFoodSchema.parse(body);
    body.query = validatedData.query;
  } catch (error) {
    const { handleZodError } = await import("@/lib/utils/errors");
    handleZodError(error);
    throw error;
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    throw new AppError(
      "AI nutrition analysis not configured. Please add GEMINI_API_KEY to environment variables.",
      500
    );
  }

  // Use Gemini AI to analyze food
  const prompt = `You are a nutrition expert. Analyze the following food query and return ONLY a valid JSON object (no markdown, no code blocks) with nutrition information.

Food query: "${body.query}"

Return this exact JSON structure:
{
  "foods": [
    {
      "name": "food name",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "serving": "serving size description"
    }
  ]
}

Rules:
- Be accurate with standard serving sizes
- Round all numbers to integers
- If multiple items mentioned, create separate entries in the foods array
- Use common serving sizes (e.g., "1 medium apple (182g)", "1 cup (240ml)")
- Return ONLY the JSON, nothing else`;

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new AppError("AI nutrition analysis failed. Please try again.", 500);
    }

    const geminiData = await geminiResponse.json();
    const aiResponse = geminiData.candidates[0].content.parts[0].text;
    
    // Clean up response (remove markdown code blocks if present)
    let cleanedResponse = aiResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const data = JSON.parse(cleanedResponse);

    if (!data.foods || !Array.isArray(data.foods)) {
      throw new AppError(
        "Unable to analyze the food. Try being more specific with quantities and names.",
        400
      );
    }

    type FoodItem = {
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      serving: string;
    };

    const foods: FoodItem[] = data.foods.map((food: any) => ({
      name: food.name,
      calories: Math.round(food.calories || 0),
      protein: Math.round(food.protein || 0),
      carbs: Math.round(food.carbs || 0),
      fat: Math.round(food.fat || 0),
      serving: food.serving || "1 serving",
    }));

    const totals = {
      calories: foods.reduce((sum: number, f: FoodItem) => sum + f.calories, 0),
      protein: foods.reduce((sum: number, f: FoodItem) => sum + f.protein, 0),
      carbs: foods.reduce((sum: number, f: FoodItem) => sum + f.carbs, 0),
      fat: foods.reduce((sum: number, f: FoodItem) => sum + f.fat, 0),
    };

    return createSuccessResponse({
      query: body.query,
      foods,
      totals,
    });
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      throw new AppError(
        "Unable to analyze the food. Try being more specific with quantities and names.",
        400
      );
    }
    throw error;
  }
});
