/**
 * Database Entity Types
 * Core data models matching Prisma schema
 */

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  goals: string | null;
  equipment: string[];
  dietaryInfo: string | null;
}

export interface Exercise {
  id: string;
  apiId: string | null;
  name: string;
  gifUrl: string | null;
  bodyPart: string;
  equipment: string;
  target: string;
  instructions: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedExercise {
  id: string;
  userId: string;
  exerciseId: string;
  createdAt: Date;
}

export interface WorkoutTemplate {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateExercise {
  id: string;
  templateId: string;
  exerciseId: string;
  sets: number;
  reps: string;
  restTime: number;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  date: Date;
  duration: number | null;
  notes: string | null;
}

export interface LoggedExercise {
  id: string;
  workoutLogId: string;
  exerciseId: string;
}

export interface LoggedSet {
  id: string;
  loggedExerciseId: string;
  weight: number | null;
  reps: number;
  restTime: number | null;
}

export interface ProgressLog {
  id: string;
  userId: string;
  date: Date;
  weight: number | null;
  chest: number | null;
  waist: number | null;
  arms: number | null;
  thighs: number | null;
  imageUrl: string | null;
}

export interface NutritionLog {
  id: string;
  userId: string;
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note: string | null;
}

/**
 * Extended types with relations
 */
export interface ExerciseWithSaved extends Exercise {
  savedBy?: SavedExercise[];
}

export interface WorkoutTemplateWithExercises extends WorkoutTemplate {
  exercises: Array<
    TemplateExercise & {
      exercise: Exercise;
    }
  >;
}

export interface WorkoutLogWithExercises extends WorkoutLog {
  exercises: Array<
    LoggedExercise & {
      exercise: Exercise;
      sets: LoggedSet[];
    }
  >;
}

export interface SavedExerciseWithExercise extends SavedExercise {
  exercise: Exercise;
}

