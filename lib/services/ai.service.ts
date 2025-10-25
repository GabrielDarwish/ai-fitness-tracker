/**
 * AI Service
 * Business logic for AI-powered features using Gemini
 */

import { exerciseRepository } from "../repositories";
import { GenerateWorkoutRequest, GeneratedExercise } from "@/types/api";
import { cleanMarkdownCodeBlock } from "../utils";
import { AppError } from "../utils/errors";

export class AIService {
  private apiKey: string;
  private modelEndpoint: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.modelEndpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";
  }

  /**
   * Check if AI is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Generate workout plan using AI
   */
  async generateWorkout(params: GenerateWorkoutRequest): Promise<{
    name: string;
    description: string;
    estimatedDuration: number;
    exercises: GeneratedExercise[];
  }> {
    if (!this.isConfigured()) {
      throw new AppError(
        "AI features are not configured. Please add GEMINI_API_KEY to environment variables.",
        500
      );
    }

    const { goal, equipment, duration, focusArea } = params;

    // Check if we have exercises in database
    const totalExercises = await exerciseRepository.count();
    if (totalExercises === 0) {
      throw new AppError(
        "Exercise database is empty. Please visit the Exercise Library first to sync exercises.",
        400
      );
    }

    // Fetch relevant exercises
    const exercises = await exerciseRepository.findByEquipment(equipment, 200);

    if (exercises.length === 0) {
      throw new AppError(
        `No exercises found for your equipment (${equipment.join(", ")}).`,
        400
      );
    }

    // Build AI prompt
    const exerciseList = exercises
      .map(
        (ex) =>
          `- ${ex.name} (${ex.bodyPart}, targets: ${ex.target}, equipment: ${ex.equipment})`
      )
      .join("\n");

    const prompt = `You are an expert personal trainer. Create a personalized workout plan based on the following:

**User Profile:**
- Goal: ${goal}
- Available Equipment: ${equipment.join(", ")}
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

    // Call Gemini API
    const response = await fetch(`${this.modelEndpoint}?key=${this.apiKey}`, {
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
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new AppError("Failed to generate workout with AI", 500);
    }

    const data = await response.json();
    let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean up response
    aiResponse = cleanMarkdownCodeBlock(aiResponse);

    // Parse JSON
    let workoutPlan: {
      workoutName: string;
      description: string;
      estimatedDuration: number;
      exercises: Array<{
        name: string;
        sets: number;
        reps: string;
        restTime: number;
        notes?: string;
      }>;
    };

    try {
      workoutPlan = JSON.parse(aiResponse);
    } catch (error) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new AppError(
        "The AI generated an invalid workout format. Please try again.",
        500
      );
    }

    // Match exercises to database
    const exercisesWithIds: GeneratedExercise[] = [];

    for (const ex of workoutPlan.exercises) {
      // Try exact match first
      let matchedExercise = exercises.find(
        (dbEx) => dbEx.name.toLowerCase() === ex.name.toLowerCase()
      );

      // Try partial match if exact fails
      if (!matchedExercise) {
        matchedExercise = exercises.find(
          (dbEx) =>
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
          notes: ex.notes,
        });
      }
    }

    if (exercisesWithIds.length === 0) {
      throw new AppError(
        "The AI couldn't match exercises to your database. Please try again.",
        400
      );
    }

    return {
      name: workoutPlan.workoutName || "AI Generated Workout",
      description: workoutPlan.description || "Personalized workout plan",
      estimatedDuration: workoutPlan.estimatedDuration || duration,
      exercises: exercisesWithIds,
    };
  }

  /**
   * Generate AI insights based on user data
   */
  async generateInsights(focusArea?: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new AppError("AI features are not configured", 500);
    }

    const prompt = `As a fitness coach, provide 3-5 motivational and actionable insights for someone ${
      focusArea ? `focusing on ${focusArea}` : "working on their fitness goals"
    }. Keep it brief and encouraging.`;

    const response = await fetch(`${this.modelEndpoint}?key=${this.apiKey}`, {
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
    });

    if (!response.ok) {
      throw new AppError("Failed to generate insights", 500);
    }

    const data = await response.json();
    const insights = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return insights;
  }
}

// Export singleton instance
export const aiService = new AIService();

