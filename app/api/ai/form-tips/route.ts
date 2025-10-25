import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Generate AI form tips for an exercise using Gemini
 */
export async function POST(req: Request) {
  console.log("🤖 AI Form Tips API called");
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log("❌ Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { exerciseName, bodyPart, target, equipment } = await req.json();
    console.log("📋 Exercise data:", { exerciseName, bodyPart, target, equipment });

    if (!exerciseName) {
      console.log("❌ No exercise name provided");
      return NextResponse.json(
        { error: "Exercise name is required" },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    console.log("🔑 API Key present:", !!GEMINI_API_KEY);
    console.log("🔑 API Key (first 10 chars):", GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + "..." : "MISSING");

    if (!GEMINI_API_KEY) {
      console.log("❌ No Gemini API key configured");
      return NextResponse.json(
        { 
          error: "AI feature not configured",
          tips: "AI form tips are not available. Please add GEMINI_API_KEY to your environment variables."
        },
        { status: 200 } // Return 200 with fallback message
      );
    }

    console.log("🚀 Calling Gemini API...");

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
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
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, response.statusText);
      console.error("Error details:", errorText);
      return NextResponse.json(
        {
          error: "Failed to generate form tips",
          tips: `Unable to generate AI tips. ${response.status === 400 ? "Check your Gemini API key." : "Please try again later."}`,
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log("✅ Gemini API response received");
    console.log("Response structure:", JSON.stringify(data, null, 2));
    
    const tips = data.candidates?.[0]?.content?.parts?.[0]?.text || "No tips generated.";
    console.log("📝 Generated tips:", tips);

    return NextResponse.json(
      {
        success: true,
        tips,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌❌❌ CAUGHT ERROR in form-tips API:");
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Full error:", error);
    
    return NextResponse.json(
      {
        error: "Failed to generate form tips",
        tips: "Unable to generate AI tips at this time. Please try again later.",
        debug: error instanceof Error ? error.message : String(error),
      },
      { status: 200 }
    );
  }
}

