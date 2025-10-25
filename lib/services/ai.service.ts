/**
 * AI Service
 * Business logic for AI-powered features using Gemini
 */

import { exerciseRepository, workoutRepository, nutritionRepository, progressRepository } from "../repositories";
import { GenerateWorkoutRequest, GeneratedExercise } from "@/types/api";
import { AppError } from "../utils/errors";

// Helper function to clean markdown code blocks from AI responses
function cleanMarkdownCodeBlock(text: string): string {
  return text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

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
   * Generate personalized insights based on real user data
   */
  async generatePersonalizedInsights(
    userId: string,
    userGoals?: string
  ): Promise<string> {
    if (!this.isConfigured()) {
      return "AI insights are not available. Keep up the great work and stay consistent with your training!";
    }

    // Fetch real user data from last 7 days
    const [workoutAnalytics, nutritionAvgs] = await Promise.all([
      workoutRepository.getAnalyticsByUserId(userId, 7),
      nutritionRepository.calculateAverages(userId, 7),
    ]);

    // Build data-driven prompt
    const prompt = `You are a professional fitness coach analyzing a user's REAL fitness data. Provide a brief, motivational insight (2-3 sentences max).

**User Goal:** ${userGoals || "general fitness"}

**Last 7 Days - ACTUAL DATA:**
- Workouts completed: ${workoutAnalytics.totalWorkouts}
- Total sets: ${workoutAnalytics.totalSets}
- Total volume lifted: ${workoutAnalytics.totalVolume} kg
- Average workout duration: ${workoutAnalytics.avgDuration} minutes
- Consistency score: ${workoutAnalytics.consistencyScore}%
- Nutrition tracking: ${nutritionAvgs.totalDays} days logged
- Average daily calories: ${nutritionAvgs.avgCalories} kcal
- Average daily protein: ${nutritionAvgs.avgProtein}g

Provide specific, actionable feedback based on these numbers. If data is limited, encourage consistency. Be encouraging but honest. Keep it brief and motivational.`;

    try {
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
        throw new Error("Gemini API error");
      }

      const data = await response.json();
      const insights =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Keep pushing! Your consistency will pay off.";

      return insights;
    } catch (error) {
      console.error("Error generating insights:", error);
      return "Keep up the great work! Consistency is key to reaching your goals.";
    }
  }

  /**
   * Generate simple AI text response
   * Used for form tips, general queries, etc.
   */
  async generateText(prompt: string): Promise<string> {
    if (!this.isConfigured()) {
      return "AI features are not available. Please add GEMINI_API_KEY to your environment variables.";
    }

    try {
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
        throw new Error("Gemini API error");
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

      return text;
    } catch (error) {
      console.error("Error generating AI text:", error);
      return "Unable to generate response at this time. Please try again.";
    }
  }

  /**
   * Generate detailed progress insights
   */
  async generateProgressInsights(
    userId: string,
    userGoals?: string
  ): Promise<{
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    stats?: Record<string, unknown>;
  }> {
    if (!this.isConfigured()) {
      return {
        strengths: ["Keep logging your workouts consistently"],
        improvements: ["Track more metrics for detailed insights"],
        recommendations: ["Stay focused on your goals"],
      };
    }

    // Fetch comprehensive data from last 30 days
    const [workoutAnalytics, nutritionAvgs, weightTrend] = await Promise.all([
      workoutRepository.getAnalyticsByUserId(userId, 30),
      nutritionRepository.calculateAverages(userId, 30),
      progressRepository.calculateWeightTrend(userId, 30),
    ]);

    // Format body part distribution
    const bodyPartsText = Object.entries(workoutAnalytics.bodyPartDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([part, count]) => `${part} (${count} exercises)`)
      .join(", ");

    const prompt = `You are a professional fitness coach analyzing a user's progress over 30 days. Based on the following REAL DATA, provide structured feedback.

**User Goal:** ${userGoals || "general fitness"}

**30-Day Workout Summary - ACTUAL DATA:**
- Workouts completed: ${workoutAnalytics.totalWorkouts}
- Total sets performed: ${workoutAnalytics.totalSets}
- Total volume lifted: ${(workoutAnalytics.totalVolume / 1000).toFixed(1)} tons
- Average workout duration: ${workoutAnalytics.avgDuration} minutes
- Consistency score: ${workoutAnalytics.consistencyScore}% (target: 75%+)
- Body parts trained: ${bodyPartsText || "varied training"}

**30-Day Nutrition Summary - ACTUAL DATA:**
- Days with nutrition logged: ${nutritionAvgs.totalDays} / 30
- Average daily calories: ${nutritionAvgs.avgCalories} kcal
- Average daily protein: ${nutritionAvgs.avgProtein}g
- Average daily carbs: ${nutritionAvgs.avgCarbs}g
- Average daily fats: ${nutritionAvgs.avgFat}g

**Weight Trend - ACTUAL DATA:**
- Trend: ${weightTrend.trend}
- Weight change: ${weightTrend.change ? `${weightTrend.change > 0 ? "+" : ""}${weightTrend.change.toFixed(1)} kg` : "no data"}

Provide your analysis in this exact JSON format (no markdown, just raw JSON):
{
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "improvements": ["specific area to improve 1", "specific area to improve 2"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"]
}

Each point should be 1-2 sentences, specific to the data provided, and actionable. Reference actual numbers where possible.`;

    try {
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
        throw new Error("Gemini API error");
      }

      const data = await response.json();
      let insightsText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Clean up markdown
      insightsText = cleanMarkdownCodeBlock(insightsText);

      // Parse JSON
      const insights = JSON.parse(insightsText);

      return {
        strengths: insights.strengths || [],
        improvements: insights.improvements || [],
        recommendations: insights.recommendations || [],
        stats: {
          workouts: workoutAnalytics.totalWorkouts,
          totalSets: workoutAnalytics.totalSets,
          totalVolume: workoutAnalytics.totalVolume,
          consistencyScore: workoutAnalytics.consistencyScore,
          nutritionDays: nutritionAvgs.totalDays,
          weightTrend: weightTrend.trend,
        },
      };
    } catch (error) {
      console.error("Error generating progress insights:", error);
      return {
        strengths: [
          `You completed ${workoutAnalytics.totalWorkouts} workouts in the last 30 days!`,
          `Your consistency score is ${workoutAnalytics.consistencyScore}%.`,
        ],
        improvements: [
          nutritionAvgs.totalDays < 15
            ? "Consider tracking nutrition more consistently for better insights."
            : "Keep up the nutrition tracking!",
        ],
        recommendations: [
          "Stay consistent with your training schedule.",
          "Focus on progressive overload in your workouts.",
          "Ensure adequate protein intake for your goals.",
        ],
        stats: {
          workouts: workoutAnalytics.totalWorkouts,
          totalSets: workoutAnalytics.totalSets,
          consistencyScore: workoutAnalytics.consistencyScore,
        },
      };
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
