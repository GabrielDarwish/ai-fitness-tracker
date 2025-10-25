import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * Check if exercises are synced, and if not, trigger auto-sync
 */
export async function GET(req: Request) {
  try {
    // Check if we have any exercises in the database
    const count = await prisma.exercise.count();

    if (count === 0) {
      // No exercises - trigger auto-sync
      const EXERCISEDB_API_KEY = process.env.EXERCISEDB_API_KEY;
      
      if (!EXERCISEDB_API_KEY) {
        return NextResponse.json(
          { 
            synced: false, 
            error: "ExerciseDB API key not configured. Please add EXERCISEDB_API_KEY to your .env file." 
          },
          { status: 500 }
        );
      }

      console.log("🔄 Starting exercise sync from ExerciseDB...");

      // Fetch ALL exercises using parallel pagination for speed
      // The API limits to 10 per request, so we fetch multiple pages at once
      const limit = 10;
      const estimatedTotal = 1400; // ExerciseDB has ~1300-1400 exercises
      const totalPages = Math.ceil(estimatedTotal / limit);

      console.log(`📦 Fetching exercises with parallel pagination (${totalPages} pages)...`);

      // Create array of fetch promises for parallel execution
      const fetchPromises = [];
      for (let page = 0; page < totalPages; page++) {
        const offset = page * limit;
        fetchPromises.push(
          fetch(
            `https://exercisedb.p.rapidapi.com/exercises?limit=${limit}&offset=${offset}`,
            {
              headers: {
                "X-RapidAPI-Key": EXERCISEDB_API_KEY,
                "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
              },
            }
          )
            .then(res => res.ok ? res.json() : [])
            .catch(err => {
              console.error(`Failed to fetch page ${page}:`, err);
              return [];
            })
        );
      }

      // Fetch all pages in parallel (chunks of 10 to avoid rate limits)
      const fetchChunkSize = 10;
      let allExercises: any[] = [];
      
      for (let i = 0; i < fetchPromises.length; i += fetchChunkSize) {
        const chunk = fetchPromises.slice(i, i + fetchChunkSize);
        const results = await Promise.all(chunk);
        const exercises = results.flat().filter((ex: any) => ex && ex.id);
        allExercises = [...allExercises, ...exercises];
        console.log(`📦 Fetched ${allExercises.length} exercises so far...`);
      }

      const exercises = allExercises;
      console.log(`✅ Total exercises fetched: ${exercises.length}`);

      if (!Array.isArray(exercises) || exercises.length === 0) {
        throw new Error("No exercises received from API");
      }

      // Log a sample exercise to see the structure
      console.log("📋 Sample exercise structure:", JSON.stringify(exercises[0], null, 2));

      // Batch insert exercises for better performance
      let synced = 0;
      let errors = 0;

      // Process in chunks of 100 to avoid timeout
      const chunkSize = 100;
      for (let i = 0; i < exercises.length; i += chunkSize) {
        const chunk = exercises.slice(i, i + chunkSize);
        
        try {
          await prisma.exercise.createMany({
            data: chunk.map((ex: any) => {
              // Use gifUrl from API if available, otherwise use our proxy endpoint
              // The API should return a gifUrl field that's a public URL
              const gifUrl = ex.gifUrl || `/api/exercises/image/${ex.id}`;
              
              return {
                apiId: String(ex.id),
                name: ex.name,
                gifUrl: gifUrl,
                bodyPart: ex.bodyPart,
                equipment: ex.equipment,
                target: ex.target,
                instructions: Array.isArray(ex.instructions) 
                  ? ex.instructions.join("\n") 
                  : ex.instructions || null,
              };
            }),
            skipDuplicates: true,
          });
          
          synced += chunk.length;
          console.log(`✅ Synced ${synced}/${exercises.length} exercises`);
        } catch (error) {
          console.error(`❌ Error syncing chunk ${i}-${i + chunkSize}:`, error);
          errors += chunk.length;
        }
      }

      console.log(`🎉 Sync complete! ${synced} exercises synced, ${errors} errors`);

      return NextResponse.json(
        {
          synced: true,
          message: `Auto-synced ${synced} exercises`,
          count: synced,
          total: exercises.length,
          errors,
        },
        { status: 200 }
      );
    }

    // Exercises already synced
    return NextResponse.json(
      {
        synced: true,
        message: "Exercises already synced",
        count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error checking/syncing exercises:", error);
    return NextResponse.json(
      {
        synced: false,
        error: "Failed to sync exercises",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
