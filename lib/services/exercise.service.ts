/**
 * Exercise Service
 * Business logic for exercise-related operations
 */

import { exerciseRepository } from "../repositories";
import { GetExercisesParams, GetExercisesResponse } from "@/types/api";
import { calculatePagination } from "../utils/query";
import { NotFoundError } from "../utils/errors";

export class ExerciseService {
  /**
   * Get exercises with filters and pagination
   */
  async getExercises(params: GetExercisesParams): Promise<GetExercisesResponse> {
    const { exercises, total } = await exerciseRepository.findMany(params);
    const { limit = 24, offset = 0 } = params;

    const pagination = calculatePagination(total, limit, offset);

    return {
      exercises,
      total,
      limit,
      offset,
      hasMore: pagination.hasMore,
      items: exercises,
    };
  }

  /**
   * Get exercise by ID
   */
  async getExerciseById(id: string) {
    const exercise = await exerciseRepository.findById(id);

    if (!exercise) {
      throw new NotFoundError("Exercise");
    }

    return exercise;
  }

  /**
   * Get saved exercises for user
   */
  async getSavedExercises(userId: string) {
    const savedExercises = await exerciseRepository.findSavedByUserId(userId);
    return { savedExercises };
  }

  /**
   * Save exercise for user
   */
  async saveExercise(userId: string, exerciseId: string) {
    // Verify exercise exists
    const exercise = await exerciseRepository.findById(exerciseId);
    if (!exercise) {
      throw new NotFoundError("Exercise");
    }

    // Check if already saved
    const isSaved = await exerciseRepository.isSavedByUser(userId, exerciseId);
    if (isSaved) {
      return { success: true, message: "Exercise already saved" };
    }

    // Save exercise
    await exerciseRepository.saveForUser(userId, exerciseId);

    return { success: true, message: "Exercise saved successfully" };
  }

  /**
   * Unsave exercise for user
   */
  async unsaveExercise(userId: string, exerciseId: string) {
    await exerciseRepository.unsaveForUser(userId, exerciseId);
    return { success: true, message: "Exercise removed from saved" };
  }

  /**
   * Check if exercise is saved by user
   */
  async isSavedByUser(userId: string, exerciseId: string): Promise<boolean> {
    return exerciseRepository.isSavedByUser(userId, exerciseId);
  }

  /**
   * Check if exercises are synced
   */
  async checkSync() {
    const count = await exerciseRepository.count();
    return {
      synced: count > 0,
      count,
    };
  }

  /**
   * Sync exercises from ExerciseDB API
   */
  async syncExercises(): Promise<{ count: number; message: string }> {
    const apiKey = process.env.EXERCISEDB_API_KEY;

    if (!apiKey) {
      throw new Error("ExerciseDB API key not configured");
    }

    // Fetch exercises from ExerciseDB
    const response = await fetch(
      "https://exercisedb.p.rapidapi.com/exercises",
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch exercises from ExerciseDB");
    }

    const data = await response.json();

    // Transform and insert exercises
    const exercises = data.map((ex: {
      id: string;
      name: string;
      gifUrl: string;
      bodyPart: string;
      equipment: string;
      target: string;
      instructions?: string[];
    }) => ({
      apiId: ex.id,
      name: ex.name,
      gifUrl: ex.gifUrl,
      bodyPart: ex.bodyPart,
      equipment: ex.equipment,
      target: ex.target,
      instructions: ex.instructions?.join("\n"),
    }));

    const count = await exerciseRepository.createMany(exercises);

    return {
      count,
      message: `Successfully synced ${count} exercises`,
    };
  }
}

// Export singleton instance
export const exerciseService = new ExerciseService();

