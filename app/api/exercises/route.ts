import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Extract filters from query params
    const bodyPart = searchParams.get("bodyPart");
    const equipment = searchParams.get("equipment");
    const target = searchParams.get("target");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "30");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause for filters
    const where: any = {};
    
    if (bodyPart) {
      where.bodyPart = bodyPart;
    }
    
    if (equipment) {
      where.equipment = equipment;
    }
    
    if (target) {
      where.target = target;
    }
    
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Fetch exercises with filters
    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        select: {
          id: true,
          apiId: true,
          name: true,
          gifUrl: true,
          bodyPart: true,
          equipment: true,
          target: true,
          instructions: true,
        },
        orderBy: { name: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.exercise.count({ where }),
    ]);

    return NextResponse.json(
      {
        exercises,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}
