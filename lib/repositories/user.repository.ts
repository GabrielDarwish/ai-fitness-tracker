/**
 * User Repository
 * Database access layer for User model
 */

import { prisma } from "../db";
import { User } from "@/types/entities";

export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Update user profile
   */
  async update(
    email: string,
    data: {
      name?: string;
      age?: number;
      gender?: string;
      height?: number;
      weight?: number;
      goals?: string;
      equipment?: string[];
      dietaryInfo?: string;
    }
  ): Promise<User> {
    return prisma.user.update({
      where: { email },
      data,
    });
  }

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user?.goals !== null && user?.goals !== undefined;
  }
}

// Export singleton instance
export const userRepository = new UserRepository();

