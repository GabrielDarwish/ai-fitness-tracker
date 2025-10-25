/**
 * Exercise Repository
 * Database access layer for Exercise model
 */

import { prisma } from "../db";
import { Exercise, SavedExerciseWithExercise } from "@/types/entities";
import { GetExercisesParams } from "@/types/api";

export class ExerciseRepository {
  /**
   * Find exercises with filters and pagination
   */
  async findMany(params: GetExercisesParams): Promise<{
    exercises: Exercise[];
    total: number;
  }> {
    const { bodyPart, equipment, target, search, limit = 24, offset = 0 } = params;

    // Build filter object
    const where: {
      bodyPart?: string;
      equipment?: string;
      target?: string;
      name?: { contains: string; mode: "insensitive" };
    } = {};

    if (bodyPart) where.bodyPart = bodyPart;
    if (equipment) where.equipment = equipment;
    if (target) where.target = target;
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    // Execute queries in parallel
    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        orderBy: { name: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.exercise.count({ where }),
    ]);

    return { exercises, total };
  }

  /**
   * Find exercise by ID
   */
  async findById(id: string): Promise<Exercise | null> {
    return prisma.exercise.findUnique({
      where: { id },
    });
  }

  /**
   * Find exercise by API ID
   */
  async findByApiId(apiId: string): Promise<Exercise | null> {
    return prisma.exercise.findUnique({
      where: { apiId },
    });
  }

  /**
   * Count total exercises
   */
  async count(): Promise<number> {
    return prisma.exercise.count();
  }

  /**
   * Find exercises by equipment - OPTIMIZED: for AI workout generation
   * Returns only essential fields needed for workout creation
   */
  async findByEquipment(
    equipment: string[],
    limit: number = 200
  ): Promise<Exercise[]> {
    return prisma.exercise.findMany({
      where: {
        equipment: { in: equipment },
      },
      select: {
        id: true,
        apiId: true,
        name: true,
        bodyPart: true,
        equipment: true,
        target: true,
        gifUrl: true,
        instructions: true,
        createdAt: true,
        updatedAt: true,
      },
      take: limit,
    });
  }

  /**
   * Create multiple exercises (bulk insert)
   */
  async createMany(exercises: Array<{
    apiId: string;
    name: string;
    gifUrl?: string;
    bodyPart: string;
    equipment: string;
    target: string;
    instructions?: string;
  }>): Promise<number> {
    const result = await prisma.exercise.createMany({
      data: exercises,
      skipDuplicates: true,
    });

    return result.count;
  }

  /**
   * Find saved exercises for user
   */
  async findSavedByUserId(userId: string): Promise<SavedExerciseWithExercise[]> {
    return prisma.savedExercise.findMany({
      where: { userId },
      include: {
        exercise: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Check if exercise is saved by user - OPTIMIZED: only check existence
   */
  async isSavedByUser(userId: string, exerciseId: string): Promise<boolean> {
    const saved = await prisma.savedExercise.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
      select: {
        id: true, // Only need to know if it exists
      },
    });

    return saved !== null;
  }

  /**
   * Save exercise for user
   */
  async saveForUser(userId: string, exerciseId: string): Promise<void> {
    await prisma.savedExercise.create({
      data: {
        userId,
        exerciseId,
      },
    });
  }

  /**
   * Unsave exercise for user
   */
  async unsaveForUser(userId: string, exerciseId: string): Promise<void> {
    await prisma.savedExercise.delete({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
    });
  }
}

// Export singleton instance
export const exerciseRepository = new ExerciseRepository();

