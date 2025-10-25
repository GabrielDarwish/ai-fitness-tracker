-- CreateIndex
CREATE INDEX "Exercise_name_idx" ON "Exercise"("name");

-- CreateIndex
CREATE INDEX "NutritionLog_userId_date_idx" ON "NutritionLog"("userId", "date");

-- CreateIndex
CREATE INDEX "ProgressLog_userId_date_idx" ON "ProgressLog"("userId", "date");

-- CreateIndex
CREATE INDEX "SavedExercise_userId_createdAt_idx" ON "SavedExercise"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkoutLog_userId_date_idx" ON "WorkoutLog"("userId", "date");

-- CreateIndex
CREATE INDEX "WorkoutTemplate_userId_createdAt_idx" ON "WorkoutTemplate"("userId", "createdAt");
