import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Generate AI form tips for an exercise using Gemini
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { exerciseName, bodyPart, target, equipment } = await req.json();

    if (!exerciseName) {
      return NextResponse.json(
        { error: "Exercise name is required" },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          error: "AI feature not configured",
          tips: "AI form tips are not available. Please add GEMINI_API_KEY to your environment variables."
        },
        { status: 200 } // Return 200 with fallback message
      );
    }

    // Call Gemini API
    const prompt = `You are a professional fitness coach. Provide 3-4 brief, actionable form tips for the exercise "${exerciseName}".

Exercise details:
- Body part: ${bodyPart || "N/A"}
- Target muscle: ${target || "N/A"}
- Equipment: ${equipment || "N/A"}

Focus on:
1. Proper form and technique
2. Common mistakes to avoid
3. Safety considerations

Keep it concise and practical. Format as a bulleted list. Each tip should be 1-2 sentences max.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.statusText);
      return NextResponse.json(
        {
          error: "Failed to generate form tips",
          tips: "Unable to generate AI tips at this time. Please try again later.",
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    const tips = data.candidates?.[0]?.content?.parts?.[0]?.text || "No tips generated.";

    return NextResponse.json(
      {
        success: true,
        tips,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating form tips:", error);
    return NextResponse.json(
      {
        error: "Failed to generate form tips",
        tips: "Unable to generate AI tips at this time. Please try again later.",
      },
      { status: 200 }
    );
  }
}

