/*
  Warnings:

  - You are about to drop the column `createdAt` on the `LoggedExercise` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `LoggedExercise` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `LoggedExercise` table. All the data in the column will be lost.
  - You are about to drop the column `workoutId` on the `LoggedExercise` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `LoggedSet` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `LoggedSet` table. All the data in the column will be lost.
  - You are about to drop the column `rpe` on the `LoggedSet` table. All the data in the column will be lost.
  - You are about to drop the column `setNumber` on the `LoggedSet` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `NutritionLog` table. All the data in the column will be lost.
  - You are about to drop the column `fiber` on the `NutritionLog` table. All the data in the column will be lost.
  - You are about to drop the column `foodItems` on the `NutritionLog` table. All the data in the column will be lost.
  - You are about to drop the column `mealType` on the `NutritionLog` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `NutritionLog` table. All the data in the column will be lost.
  - You are about to drop the column `biceps` on the `ProgressLog` table. All the data in the column will be lost.
  - You are about to drop the column `bodyFat` on the `ProgressLog` table. All the data in the column will be lost.
  - You are about to drop the column `calves` on the `ProgressLog` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ProgressLog` table. All the data in the column will be lost.
  - You are about to drop the column `hips` on the `ProgressLog` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `ProgressLog` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrls` on the `ProgressLog` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `SavedExercise` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `TemplateExercise` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `TemplateExercise` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `TemplateExercise` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - The `equipment` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `WorkoutLog` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `WorkoutLog` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `WorkoutLog` table. All the data in the column will be lost.
  - Added the required column `workoutLogId` to the `LoggedExercise` table without a default value. This is not possible if the table is not empty.
  - Made the column `reps` on table `LoggedSet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `calories` on table `NutritionLog` required. This step will fail if there are existing NULL values in that column.
  - Made the column `protein` on table `NutritionLog` required. This step will fail if there are existing NULL values in that column.
  - Made the column `carbs` on table `NutritionLog` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fat` on table `NutritionLog` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reps` on table `TemplateExercise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `restTime` on table `TemplateExercise` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."LoggedExercise" DROP CONSTRAINT "LoggedExercise_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LoggedExercise" DROP CONSTRAINT "LoggedExercise_workoutId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkoutLog" DROP CONSTRAINT "WorkoutLog_templateId_fkey";

-- DropIndex
DROP INDEX "public"."LoggedExercise_workoutId_idx";

-- DropIndex
DROP INDEX "public"."WorkoutLog_templateId_idx";

-- AlterTable
ALTER TABLE "Exercise" ALTER COLUMN "instructions" DROP NOT NULL,
ALTER COLUMN "instructions" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "LoggedExercise" DROP COLUMN "createdAt",
DROP COLUMN "notes",
DROP COLUMN "order",
DROP COLUMN "workoutId",
ADD COLUMN     "workoutLogId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LoggedSet" DROP COLUMN "createdAt",
DROP COLUMN "duration",
DROP COLUMN "rpe",
DROP COLUMN "setNumber",
ADD COLUMN     "restTime" INTEGER,
ALTER COLUMN "reps" SET NOT NULL;

-- AlterTable
ALTER TABLE "NutritionLog" DROP COLUMN "createdAt",
DROP COLUMN "fiber",
DROP COLUMN "foodItems",
DROP COLUMN "mealType",
DROP COLUMN "notes",
ADD COLUMN     "note" TEXT,
ALTER COLUMN "calories" SET NOT NULL,
ALTER COLUMN "protein" SET NOT NULL,
ALTER COLUMN "carbs" SET NOT NULL,
ALTER COLUMN "fat" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProgressLog" DROP COLUMN "biceps",
DROP COLUMN "bodyFat",
DROP COLUMN "calves",
DROP COLUMN "createdAt",
DROP COLUMN "hips",
DROP COLUMN "notes",
DROP COLUMN "photoUrls",
ADD COLUMN     "arms" DOUBLE PRECISION,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "SavedExercise" DROP COLUMN "notes";

-- AlterTable
ALTER TABLE "TemplateExercise" DROP COLUMN "duration",
DROP COLUMN "notes",
DROP COLUMN "order",
ALTER COLUMN "reps" SET NOT NULL,
ALTER COLUMN "restTime" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bio",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "weight" DOUBLE PRECISION,
DROP COLUMN "equipment",
ADD COLUMN     "equipment" TEXT[];

-- AlterTable
ALTER TABLE "WorkoutLog" DROP COLUMN "createdAt",
DROP COLUMN "name",
DROP COLUMN "templateId";

-- CreateIndex
CREATE INDEX "LoggedExercise_workoutLogId_idx" ON "LoggedExercise"("workoutLogId");

-- AddForeignKey
ALTER TABLE "LoggedExercise" ADD CONSTRAINT "LoggedExercise_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoggedExercise" ADD CONSTRAINT "LoggedExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
