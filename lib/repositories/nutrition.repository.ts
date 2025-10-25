/**
 * Nutrition Repository
 * Database access layer for Nutrition model
 */

import { prisma } from "../db";
import { NutritionLog } from "@/types/entities";

export class NutritionRepository {
  /**
   * Find nutrition logs for user within date range
   */
  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate?: Date
  ): Promise<NutritionLog[]> {
    return prisma.nutritionLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          ...(endDate && { lte: endDate }),
        },
      },
      orderBy: { date: "desc" },
    });
  }

  /**
   * Find recent nutrition logs
   */
  async findRecentByUserId(
    userId: string,
    days: number = 7
  ): Promise<NutritionLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return this.findByUserIdAndDateRange(userId, startDate);
  }

  /**
   * Create nutrition log
   */
  async create(data: {
    userId: string;
    date: Date;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    note?: string;
  }): Promise<NutritionLog> {
    return prisma.nutritionLog.create({
      data: {
        userId: data.userId,
        date: data.date,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        note: data.note || null,
      },
    });
  }

  /**
   * Update nutrition log
   */
  async update(
    id: string,
    data: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      note?: string;
    }
  ): Promise<NutritionLog> {
    return prisma.nutritionLog.update({
      where: { id },
      data,
    });
  }

  /**
   * Calculate average macros over period
   */
  async calculateAverages(
    userId: string,
    days: number = 7
  ): Promise<{
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
    totalDays: number;
  }> {
    const logs = await this.findRecentByUserId(userId, days);

    if (logs.length === 0) {
      return {
        avgCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFat: 0,
        totalDays: 0,
      };
    }

    const totals = logs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fat: acc.fat + log.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
      avgCalories: Math.round(totals.calories / logs.length),
      avgProtein: Math.round(totals.protein / logs.length),
      avgCarbs: Math.round(totals.carbs / logs.length),
      avgFat: Math.round(totals.fat / logs.length),
      totalDays: logs.length,
    };
  }
}

// Export singleton instance
export const nutritionRepository = new NutritionRepository();

