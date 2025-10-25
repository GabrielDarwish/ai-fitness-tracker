/**
 * Workout Service
 * Business logic for workout-related operations
 */

import { workoutRepository } from "../repositories";
import {
  CreateWorkoutTemplateRequest,
  CreateWorkoutLogRequest,
  UpdateWorkoutLogRequest,
  AddSetRequest,
} from "@/types/api";
import { NotFoundError } from "../utils/errors";

export class WorkoutService {
  /**
   * Get all workout templates for user
   */
  async getTemplates(userId: string) {
    const templates = await workoutRepository.findTemplatesByUserId(userId);
    return { templates };
  }

  /**
   * Get workout template by ID
   */
  async getTemplateById(id: string, userId: string) {
    const template = await workoutRepository.findTemplateById(id, userId);

    if (!template) {
      throw new NotFoundError("Workout template");
    }

    return template;
  }

  /**
   * Create workout template
   */
  async createTemplate(userId: string, data: CreateWorkoutTemplateRequest) {
    const template = await workoutRepository.createTemplate({
      userId,
      name: data.name,
      description: data.description,
      exercises: data.exercises,
    });

    return {
      success: true,
      template,
    };
  }

  /**
   * Delete workout template
   */
  async deleteTemplate(id: string, userId: string) {
    // Verify template exists
    await this.getTemplateById(id, userId);

    await workoutRepository.deleteTemplate(id, userId);

    return {
      success: true,
      message: "Workout template deleted successfully",
    };
  }

  /**
   * Start workout from template
   */
  async startWorkout(userId: string, data: CreateWorkoutLogRequest) {
    // Verify template exists
    await this.getTemplateById(data.templateId, userId);

    // Create workout log
    const workoutLog = await workoutRepository.createLogFromTemplate(
      userId,
      data.templateId
    );

    return {
      success: true,
      workoutLog,
    };
  }

  /**
   * Get workout log by ID
   */
  async getWorkoutLog(id: string, userId: string) {
    const workoutLog = await workoutRepository.findLogById(id, userId);

    if (!workoutLog) {
      throw new NotFoundError("Workout log");
    }

    return workoutLog;
  }

  /**
   * Get recent workout logs
   */
  async getRecentWorkouts(userId: string, limit: number = 10) {
    const workouts = await workoutRepository.findRecentLogsByUserId(
      userId,
      limit
    );

    return { workouts };
  }

  /**
   * Get workout logs by date range
   */
  async getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date) {
    const workouts = await workoutRepository.findLogsByDateRange(
      userId,
      startDate,
      endDate
    );

    return { workouts };
  }

  /**
   * Update workout log
   */
  async updateWorkoutLog(
    id: string,
    userId: string,
    data: UpdateWorkoutLogRequest
  ) {
    // Verify log exists
    await this.getWorkoutLog(id, userId);

    const workoutLog = await workoutRepository.updateLog(id, userId, data);

    return {
      success: true,
      workoutLog,
    };
  }

  /**
   * Add set to workout
   */
  async addSet(data: AddSetRequest) {
    const set = await workoutRepository.addSet(data);

    return {
      success: true,
      set,
    };
  }

  /**
   * Get workout statistics
   */
  async getStats(userId: string) {
    const stats = await workoutRepository.getStatsByUserId(userId);
    const recentWorkouts = await workoutRepository.findRecentLogsByUserId(
      userId,
      5
    );

    return {
      ...stats,
      recentWorkouts,
    };
  }
}

// Export singleton instance
export const workoutService = new WorkoutService();

