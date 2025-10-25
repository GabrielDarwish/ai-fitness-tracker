/**
 * Progress Repository
 * Database access layer for Progress tracking
 */

import { prisma } from "../db";
import { ProgressLog } from "@/types/entities";

export class ProgressRepository {
  /**
   * Find progress logs for user within date range
   */
  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate?: Date
  ): Promise<ProgressLog[]> {
    return prisma.progressLog.findMany({
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
   * Find recent progress logs
   */
  async findRecentByUserId(
    userId: string,
    days: number = 90
  ): Promise<ProgressLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return this.findByUserIdAndDateRange(userId, startDate);
  }

  /**
   * Calculate weight trend
   */
  async calculateWeightTrend(
    userId: string,
    days: number = 30
  ): Promise<{
    startWeight: number | null;
    currentWeight: number | null;
    change: number | null;
    trend: "increasing" | "decreasing" | "stable" | "no-data";
  }> {
    const logs = await this.findRecentByUserId(userId, days);
    const logsWithWeight = logs.filter((log) => log.weight !== null);

    if (logsWithWeight.length < 2) {
      return {
        startWeight: null,
        currentWeight: null,
        change: null,
        trend: "no-data",
      };
    }

    const startWeight = logsWithWeight[logsWithWeight.length - 1].weight!;
    const currentWeight = logsWithWeight[0].weight!;
    const change = currentWeight - startWeight;

    let trend: "increasing" | "decreasing" | "stable";
    if (Math.abs(change) < 0.5) {
      trend = "stable";
    } else if (change > 0) {
      trend = "increasing";
    } else {
      trend = "decreasing";
    }

    return {
      startWeight,
      currentWeight,
      change,
      trend,
    };
  }
}

// Export singleton instance
export const progressRepository = new ProgressRepository();

