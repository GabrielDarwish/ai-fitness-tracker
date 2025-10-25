/**
 * User API Routes
 * GET /api/user - Get current user profile
 * POST /api/user - Update user profile (onboarding)
 * PATCH /api/user - Partial update user profile
 */

import { NextResponse } from "next/server";
import { userService } from "@/lib/services";
import { getCurrentUserProfile } from "@/lib/utils/auth";
import { asyncHandler, createSuccessResponse, ValidationError } from "@/lib/utils/errors";
import { parseRequestBody } from "@/lib/utils/validation";
import { UpdateUserRequest } from "@/types/api";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { z } from "zod";

export const GET = asyncHandler(async () => {
  const user = await getCurrentUserProfile();
  return createSuccessResponse({ user });
});

export const POST = asyncHandler(async (req: Request) => {
  const { email } = await getCurrentUserProfile();
  const data = await parseRequestBody<Record<string, unknown>>(req);

  // Validate with Zod schema
  try {
    const validatedData = onboardingSchema.parse({
      name: data.name,
      age: Number(data.age),
      gender: data.gender,
      height: Number(data.height),
      weight: Number(data.weight),
      goals: data.goals,
      equipment: data.equipment || [],
    });

    const result = await userService.updateProfile(email!, validatedData);
    return createSuccessResponse(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        error.issues.map((e) => e.message).join(", ")
      );
    }
    throw error;
  }
});

export const PATCH = asyncHandler(async (req: Request) => {
  const { email } = await getCurrentUserProfile();
  const data = await parseRequestBody<UpdateUserRequest>(req);

  // Validate equipment is array if provided
  if (data.equipment !== undefined && !Array.isArray(data.equipment)) {
    throw new ValidationError("Equipment must be an array");
  }

  if (Object.keys(data).length === 0) {
    throw new ValidationError("No valid fields to update");
  }

  const result = await userService.updateProfile(email!, data);
  return createSuccessResponse(result);
});
