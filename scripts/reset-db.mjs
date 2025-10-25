import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log("🗑️ Clearing all tables...");

  try {
    // Delete in correct order to avoid foreign key constraints
    await prisma.loggedSet.deleteMany();
    console.log("✅ Cleared LoggedSet");
    
    await prisma.loggedExercise.deleteMany();
    console.log("✅ Cleared LoggedExercise");
    
    await prisma.workoutLog.deleteMany();
    console.log("✅ Cleared WorkoutLog");
    
    await prisma.templateExercise.deleteMany();
    console.log("✅ Cleared TemplateExercise");
    
    await prisma.workoutTemplate.deleteMany();
    console.log("✅ Cleared WorkoutTemplate");
    
    await prisma.savedExercise.deleteMany();
    console.log("✅ Cleared SavedExercise");
    
    await prisma.exercise.deleteMany();
    console.log("✅ Cleared Exercise");
    
    await prisma.progressLog.deleteMany();
    console.log("✅ Cleared ProgressLog");
    
    await prisma.nutritionLog.deleteMany();
    console.log("✅ Cleared NutritionLog");
    
    await prisma.session.deleteMany();
    console.log("✅ Cleared Session");
    
    await prisma.account.deleteMany();
    console.log("✅ Cleared Account");
    
    await prisma.user.deleteMany();
    console.log("✅ Cleared User");
    
    await prisma.verificationToken.deleteMany();
    console.log("✅ Cleared VerificationToken");

    console.log("\n🎉 Database cleared successfully!");
    console.log("💡 Next steps:");
    console.log("   1. Sign in to create a new account");
    console.log("   2. Complete onboarding with new equipment names");
    console.log("   3. Visit /library to sync exercises");
    console.log("   4. Try /ai-builder\n");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();

