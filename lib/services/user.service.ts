/**
 * User Service
 * Business logic for user-related operations
 */

import { userRepository } from "../repositories";
import { UpdateUserRequest } from "@/types/api";
import { NotFoundError } from "../utils/errors";

export class UserService {
  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError("User");
    }

    return { user };
  }

  /**
   * Update user profile
   */
  async updateProfile(email: string, data: UpdateUserRequest) {
    const user = await userRepository.update(email, data);

    return {
      success: true,
      user,
    };
  }

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(email: string) {
    const completed = await userRepository.hasCompletedOnboarding(email);
    return { completed };
  }
}

// Export singleton instance
export const userService = new UserService();

