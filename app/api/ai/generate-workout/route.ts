import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

interface WorkoutRequest {
  goal: string;
  equipment: string[];
  duration: number; // in minutes
  focusArea: "full-body" | "upper-body" | "lower-body" | "core";
}

interface GeneratedExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string; // e.g., "10-12" or "30 seconds"
  restTime: number; // in seconds
  notes?: string;
}

export async function POST(req: Request) {
  console.log("🤖 AI Workout Generator API called");
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log("❌ Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { goal, equipment, duration, focusArea } = await req.json() as WorkoutRequest;
    console.log("📋 Workout request:", { goal, equipment, duration, focusArea });

    // Validate inputs
    if (!goal || !equipment || !duration || !focusArea) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          error: "AI feature not configured",
          message: "AI workout generation is not available. Please add GEMINI_API_KEY to your environment variables."
        },
        { status: 500 }
      );
    }

    // Fetch relevant exercises from database based on equipment
    console.log("🔍 Fetching exercises for equipment:", equipment);
    
    // Check if we have any exercises in the database first
    const totalExercises = await prisma.exercise.count();
    console.log(`📊 Total exercises in database: ${totalExercises}`);
    
    if (totalExercises === 0) {
      return NextResponse.json(
        { 
          error: "No exercises available",
          message: "Exercise database is empty. Please visit the Exercise Library first to sync exercises from ExerciseDB."
        },
        { status: 400 }
      );
    }
    
    const exercises = await prisma.exercise.findMany({
      where: {
        equipment: {
          in: equipment,
        },
      },
      select: {
        id: true,
        name: true,
        bodyPart: true,
        target: true,
        equipment: true,
      },
      take: 200, // Increased from 100 to get more options
    });

    console.log(`📦 Found ${exercises.length} exercises matching equipment: ${equipment.join(', ')}`);
    
    if (exercises.length === 0) {
      return NextResponse.json(
        { 
          error: "No matching exercises",
          message: `No exercises found for your equipment (${equipment.join(', ')}). This might be a data issue. Try selecting different equipment or contact support.`
        },
        { status: 400 }
      );
    }

    // Build AI prompt
    const exerciseList = exercises
      .map(ex => `- ${ex.name} (${ex.bodyPart}, targets: ${ex.target}, equipment: ${ex.equipment})`)
      .join('\n');

    const prompt = `You are an expert personal trainer. Create a personalized workout plan based on the following:

**User Profile:**
- Goal: ${goal}
- Available Equipment: ${equipment.join(', ')}
- Workout Duration: ${duration} minutes
- Focus Area: ${focusArea}

**Available Exercises:**
${exerciseList}

**Instructions:**
1. Select 5-8 exercises from the available exercises list that match the user's goal and focus area
2. Create a balanced workout routine
3. Specify sets, reps, and rest time for each exercise
4. Add brief notes for each exercise if needed

**Output Format (JSON):**
{
  "workoutName": "descriptive name",
  "description": "brief description",
  "estimatedDuration": ${duration},
  "exercises": [
    {
      "name": "exact name from the exercise list",
      "sets": 3,
      "reps": "10-12",
      "restTime": 60,
      "notes": "optional coaching tip"
    }
  ]
}

IMPORTANT: 
- Use ONLY exercises from the provided list
- Match exercise names EXACTLY as they appear in the list
- Ensure the workout fits within ${duration} minutes
- Return ONLY valid JSON, no markdown or extra text`;

    console.log("🚀 Calling Gemini API...");

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
      console.error("❌ Gemini API error:", response.status, response.statusText);
      console.error("Error details:", errorText);
      return NextResponse.json(
        {
          error: "Failed to generate workout",
          message: "Unable to generate workout at this time. Please try again later.",
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("✅ Gemini API response received");
    
    let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("📝 AI Response:", aiResponse);

    // Clean up response (remove markdown code blocks if present)
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let workoutPlan;
    try {
      workoutPlan = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("❌ Failed to parse AI response as JSON:", parseError);
      console.error("Raw response:", aiResponse);
      return NextResponse.json(
        {
          error: "Failed to parse workout plan",
          message: "The AI generated an invalid workout format. Please try again.",
        },
        { status: 500 }
      );
    }

    // Match exercise names to actual exercise IDs
    const exercisesWithIds: GeneratedExercise[] = [];
    const unmatchedExercises: string[] = [];
    
    for (const ex of workoutPlan.exercises) {
      // Try multiple matching strategies
      let matchedExercise = exercises.find(
        dbEx => dbEx.name.toLowerCase() === ex.name.toLowerCase()
      );
      
      // If exact match fails, try partial match
      if (!matchedExercise) {
        matchedExercise = exercises.find(
          dbEx => 
            dbEx.name.toLowerCase().includes(ex.name.toLowerCase()) ||
            ex.name.toLowerCase().includes(dbEx.name.toLowerCase())
        );
      }

      if (matchedExercise) {
        exercisesWithIds.push({
          exerciseId: matchedExercise.id,
          name: matchedExercise.name,
          sets: ex.sets || 3,
          reps: String(ex.reps) || "10-12",
          restTime: ex.restTime || 60,
          notes: ex.notes || null,
        });
        console.log(`✅ Matched: "${ex.name}" → "${matchedExercise.name}"`);
      } else {
        unmatchedExercises.push(ex.name);
        console.warn(`⚠️ Could not find exercise: "${ex.name}"`);
      }
    }

    if (exercisesWithIds.length === 0) {
      console.error("❌ No exercises matched!");
      console.error("AI suggested:", workoutPlan.exercises.map((e: any) => e.name));
      console.error("Available in DB (first 10):", exercises.slice(0, 10).map(e => e.name));
      
      return NextResponse.json(
        {
          error: "No valid exercises generated",
          message: "The AI couldn't match exercises to your database. This might be due to exercise names not matching. Try again or visit the Exercise Library to ensure exercises are synced.",
          debug: {
            aiSuggested: workoutPlan.exercises.map((e: any) => e.name),
            unmatchedExercises,
            totalAvailable: exercises.length,
          }
        },
        { status: 400 }
      );
    }
    
    console.log(`✅ Successfully matched ${exercisesWithIds.length} out of ${workoutPlan.exercises.length} exercises`);

    return NextResponse.json(
      {
        success: true,
        workout: {
          name: workoutPlan.workoutName || "AI Generated Workout",
          description: workoutPlan.description || "Personalized workout plan",
          estimatedDuration: workoutPlan.estimatedDuration || duration,
          exercises: exercisesWithIds,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌❌❌ Error generating workout:", error);
    return NextResponse.json(
      {
        error: "Failed to generate workout",
        message: "An unexpected error occurred. Please try again.",
        debug: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

