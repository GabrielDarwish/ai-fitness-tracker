import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Invalid input", message: "Please provide a food description" },
        { status: 400 }
      );
    }

    // Call Nutritionix API
    const nutritionixResponse = await fetch(
      "https://trackapi.nutritionix.com/v2/natural/nutrients",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": process.env.NUTRITIONIX_APP_ID!,
          "x-app-key": process.env.NUTRITIONIX_API_KEY!,
        },
        body: JSON.stringify({ query }),
      }
    );

    if (!nutritionixResponse.ok) {
      const errorData = await nutritionixResponse.json();
      console.error("Nutritionix API error:", errorData);
      return NextResponse.json(
        { 
          error: "Failed to analyze food",
          message: "Unable to recognize the food. Try being more specific with quantities and names."
        },
        { status: 400 }
      );
    }

    const data = await nutritionixResponse.json();

    // Parse the response
    const foods = data.foods.map((food: any) => ({
      name: food.food_name,
      calories: Math.round(food.nf_calories),
      protein: Math.round(food.nf_protein),
      carbs: Math.round(food.nf_total_carbohydrate),
      fat: Math.round(food.nf_total_fat),
      serving: food.serving_unit + " (" + food.serving_weight_grams + "g)",
    }));

    // Calculate totals
    const totals = {
      calories: foods.reduce((sum: number, f: any) => sum + f.calories, 0),
      protein: foods.reduce((sum: number, f: any) => sum + f.protein, 0),
      carbs: foods.reduce((sum: number, f: any) => sum + f.carbs, 0),
      fat: foods.reduce((sum: number, f: any) => sum + f.fat, 0),
    };

    return NextResponse.json({
      query,
      foods,
      totals,
    });
  } catch (error: any) {
    console.error("Error analyzing food:", error);
    return NextResponse.json(
      { error: "Failed to analyze food", message: error.message },
      { status: 500 }
    );
  }
}
