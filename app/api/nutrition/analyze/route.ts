/**
 * Nutrition Analyze API Route
 * POST /api/nutrition/analyze - Analyze food using Nutritionix API
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse, AppError } from "@/lib/utils/errors";
import { parseRequestBody } from "@/lib/utils/validation";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit";

export const POST = asyncHandler(async (req: Request) => {
  const { id: userId } = await getCurrentUser();
  
  // Rate limit nutrition analysis (external API call)
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

  const nutritionixAppId = process.env.NUTRITIONIX_APP_ID;
  const nutritionixApiKey = process.env.NUTRITIONIX_API_KEY;

  if (!nutritionixAppId || !nutritionixApiKey) {
    throw new AppError(
      "Nutritionix API not configured. Please add NUTRITIONIX_APP_ID and NUTRITIONIX_API_KEY to environment variables.",
      500
    );
  }

  const nutritionixResponse = await fetch(
    "https://trackapi.nutritionix.com/v2/natural/nutrients",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": nutritionixAppId,
        "x-app-key": nutritionixApiKey,
      },
      body: JSON.stringify({ query: body.query }),
    }
  );

  if (!nutritionixResponse.ok) {
    throw new AppError(
      "Unable to recognize the food. Try being more specific with quantities and names.",
      400
    );
  }

  const data = await nutritionixResponse.json();

  const foods = data.foods.map((food: {
    food_name: string;
    nf_calories: number;
    nf_protein: number;
    nf_total_carbohydrate: number;
    nf_total_fat: number;
    serving_unit: string;
    serving_weight_grams: number;
  }) => ({
    name: food.food_name,
    calories: Math.round(food.nf_calories),
    protein: Math.round(food.nf_protein),
    carbs: Math.round(food.nf_total_carbohydrate),
    fat: Math.round(food.nf_total_fat),
    serving: `${food.serving_unit} (${food.serving_weight_grams}g)`,
  }));

  const totals = {
    calories: foods.reduce((sum, f) => sum + f.calories, 0),
    protein: foods.reduce((sum, f) => sum + f.protein, 0),
    carbs: foods.reduce((sum, f) => sum + f.carbs, 0),
    fat: foods.reduce((sum, f) => sum + f.fat, 0),
  };

  return createSuccessResponse({
    query: body.query,
    foods,
    totals,
  });
});
