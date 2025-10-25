import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Admin route to sync exercises from ExerciseDB API to local database
 * This should be run once to populate the Exercise table
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const EXERCISEDB_API_KEY = process.env.EXERCISEDB_API_KEY;
    
    if (!EXERCISEDB_API_KEY) {
      return NextResponse.json(
        { error: "ExerciseDB API key not configured" },
        { status: 500 }
      );
    }

    // Fetch all exercises from ExerciseDB
    const response = await fetch(
      "https://exercisedb.p.rapidapi.com/exercises?limit=2000",
      {
        headers: {
          "X-RapidAPI-Key": EXERCISEDB_API_KEY,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`ExerciseDB API error: ${response.statusText}`);
    }

    const exercises = await response.json();

    // Sync exercises to database
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const ex of exercises) {
      try {
        // Use gifUrl from API if available, otherwise use our proxy endpoint
        const gifUrl = ex.gifUrl || `/api/exercises/image/${ex.id}`;
        
        await prisma.exercise.upsert({
          where: { apiId: ex.id },
          update: {
            name: ex.name,
            gifUrl: gifUrl,
            bodyPart: ex.bodyPart,
            equipment: ex.equipment,
            target: ex.target,
            instructions: ex.instructions?.join("\n") || null,
          },
          create: {
            apiId: ex.id,
            name: ex.name,
            gifUrl: gifUrl,
            bodyPart: ex.bodyPart,
            equipment: ex.equipment,
            target: ex.target,
            instructions: ex.instructions?.join("\n") || null,
          },
        });
        
        if (await prisma.exercise.count({ where: { apiId: ex.id } }) === 1) {
          created++;
        } else {
          updated++;
        }
      } catch (error) {
        console.error(`Error syncing exercise ${ex.id}:`, error);
        errors++;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Synced ${exercises.length} exercises`,
        stats: { created, updated, errors },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error syncing exercises:", error);
    return NextResponse.json(
      {
        error: "Failed to sync exercises",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

