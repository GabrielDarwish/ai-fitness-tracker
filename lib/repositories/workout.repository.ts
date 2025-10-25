/**
 * Workout Repository
 * Database access layer for Workout-related models
 */

import { prisma } from "../db";
import {
  WorkoutTemplate,
  WorkoutTemplateWithExercises,
  WorkoutLog,
  WorkoutLogWithExercises,
} from "@/types/entities";

export class WorkoutRepository {
  /**
   * Find all workout templates for user
   */
  async findTemplatesByUserId(userId: string): Promise<WorkoutTemplateWithExercises[]> {
    return prisma.workoutTemplate.findMany({
      where: { userId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find workout template by ID
   */
  async findTemplateById(
    id: string,
    userId: string
  ): Promise<WorkoutTemplateWithExercises | null> {
    return prisma.workoutTemplate.findFirst({
      where: { id, userId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });
  }

  /**
   * Create workout template
   */
  async createTemplate(data: {
    userId: string;
    name: string;
    description?: string;
    exercises: Array<{
      exerciseId: string;
      sets: number;
      reps: string;
      restTime: number;
    }>;
  }): Promise<WorkoutTemplateWithExercises> {
    return prisma.workoutTemplate.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        exercises: {
          create: data.exercises,
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });
  }

  /**
   * Delete workout template
   */
  async deleteTemplate(id: string, userId: string): Promise<void> {
    await prisma.workoutTemplate.deleteMany({
      where: { id, userId },
    });
  }

  /**
   * Create workout log from template
   */
  async createLogFromTemplate(
    userId: string,
    templateId: string
  ): Promise<WorkoutLogWithExercises> {
    // Get template
    const template = await this.findTemplateById(templateId, userId);
    
    if (!template) {
      throw new Error("Template not found");
    }

    // Create log with exercises in transaction
    return prisma.$transaction(async (tx) => {
      const log = await tx.workoutLog.create({
        data: {
          userId,
          date: new Date(),
        },
      });

      const loggedExercises = await Promise.all(
        template.exercises.map((templateEx) =>
          tx.loggedExercise.create({
            data: {
              workoutLogId: log.id,
              exerciseId: templateEx.exerciseId,
            },
            include: {
              exercise: true,
              sets: true,
            },
          })
        )
      );

      return {
        ...log,
        exercises: loggedExercises,
      };
    }, {
      timeout: 15000, // 15 seconds timeout
    });
  }

  /**
   * Find workout log by ID
   */
  async findLogById(
    id: string,
    userId: string
  ): Promise<WorkoutLogWithExercises | null> {
    return prisma.workoutLog.findFirst({
      where: { id, userId },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });
  }

  /**
   * Find recent workout logs for user
   */
  async findRecentLogsByUserId(
    userId: string,
    limit: number = 10
  ): Promise<WorkoutLogWithExercises[]> {
    return prisma.workoutLog.findMany({
      where: { userId },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
      orderBy: { date: "desc" },
      take: limit,
    });
  }

  /**
   * Find workout logs by date range
   */
  async findLogsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WorkoutLogWithExercises[]> {
    return prisma.workoutLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });
  }

  /**
   * Update workout log
   */
  async updateLog(
    id: string,
    userId: string,
    data: {
      duration?: number;
      notes?: string;
    }
  ): Promise<WorkoutLog> {
    return prisma.workoutLog.updateMany({
      where: { id, userId },
      data,
    }).then(() => prisma.workoutLog.findUniqueOrThrow({ where: { id } }));
  }

  /**
   * Add set to logged exercise
   */
  async addSet(data: {
    loggedExerciseId: string;
    weight?: number;
    reps: number;
    restTime?: number;
  }) {
    return prisma.loggedSet.create({
      data,
    });
  }

  /**
   * Get workout stats for user - OPTIMIZED: only fetch required fields
   */
  async getStatsByUserId(userId: string): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    totalSets: number;
  }> {
    const [workoutCount, workouts] = await Promise.all([
      prisma.workoutLog.count({ where: { userId } }),
      prisma.workoutLog.findMany({
        where: { userId },
        select: {
          duration: true,
          exercises: {
            select: {
              sets: {
                select: {
                  id: true, // Only need count
                },
              },
            },
          },
        },
      }),
    ]);

    const totalDuration = workouts.reduce(
      (sum: number, log) => sum + (log.duration || 0),
      0
    );
    const totalSets = workouts.reduce(
      (sum: number, log) =>
        sum + log.exercises.reduce((exSum: number, ex) => exSum + ex.sets.length, 0),
      0
    );

    return {
      totalWorkouts: workoutCount,
      totalDuration,
      totalSets,
    };
  }

  /**
   * Get detailed analytics for time period
   */
  async getAnalyticsByUserId(
    userId: string,
    days: number = 30
  ): Promise<{
    totalWorkouts: number;
    totalSets: number;
    totalVolume: number;
    avgDuration: number;
    bodyPartDistribution: Record<string, number>;
    consistencyScore: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const workouts = await prisma.workoutLog.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                bodyPart: true,
              },
            },
            sets: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const totalWorkouts = workouts.length;
    const totalSets = workouts.reduce(
      (sum: number, log) =>
        sum + log.exercises.reduce((exSum: number, ex) => exSum + ex.sets.length, 0),
      0
    );

    const totalVolume = workouts.reduce(
      (sum: number, log) =>
        sum +
        log.exercises.reduce(
          (exSum: number, ex) =>
            exSum +
            ex.sets.reduce((setSum: number, set) => setSum + (set.weight || 0) * set.reps, 0),
          0
        ),
      0
    );

    const totalDuration = workouts.reduce((sum: number, log) => sum + (log.duration || 0), 0);
    const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

    // Calculate body part distribution
    const bodyPartCounts: Record<string, number> = {};
    workouts.forEach((log) => {
      log.exercises.forEach((ex) => {
        const bodyPart = ex.exercise.bodyPart || "unknown";
        bodyPartCounts[bodyPart] = (bodyPartCounts[bodyPart] || 0) + 1;
      });
    });

    // Calculate consistency score (workouts per week)
    const weeksInPeriod = days / 7;
    const workoutsPerWeek = totalWorkouts / weeksInPeriod;
    const consistencyScore = Math.min(100, Math.round((workoutsPerWeek / 4) * 100));

    return {
      totalWorkouts,
      totalSets,
      totalVolume: Math.round(totalVolume),
      avgDuration,
      bodyPartDistribution: bodyPartCounts,
      consistencyScore,
    };
  }
}

// Export singleton instance
export const workoutRepository = new WorkoutRepository();

