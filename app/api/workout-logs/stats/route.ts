/**
 * Workout Stats API Route
 * GET /api/workout-logs/stats - Get workout statistics with historical data
 */

import { NextResponse } from "next/server";
import { workoutService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse } from "@/lib/utils/errors";
import { prisma } from "@/lib/db";

export const GET = asyncHandler(async (req: Request) => {
  const user = await getCurrentUserProfile();
  
  // Get days parameter from URL
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30");
  
  // Calculate date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Fetch workout logs with all data needed for charts
  const workoutLogs = await prisma.workoutLog.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startDate,
      },
    },
    include: {
      exercises: {
        include: {
          sets: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Process logs to include calculated fields
  const logs = workoutLogs.map((log) => {
    const totalSets = log.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const totalVolume = log.exercises.reduce(
      (sum, ex) =>
        sum +
        ex.sets.reduce((setSum, set) => setSum + (set.weight || 0) * set.reps, 0),
      0
    );

    return {
      id: log.id,
      date: log.date,
      duration: log.duration || 0,
      totalSets,
      totalVolume: Math.round(totalVolume),
    };
  });

  // Calculate summary stats
  const stats = {
    totalWorkouts: logs.length,
    totalDuration: logs.reduce((sum, log) => sum + log.duration, 0),
    totalSets: logs.reduce((sum, log) => sum + log.totalSets, 0),
    totalVolume: logs.reduce((sum, log) => sum + log.totalVolume, 0),
    logs, // Include individual logs for charting
  };

  return createSuccessResponse(stats);
});
