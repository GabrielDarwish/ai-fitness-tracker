import { NextResponse } from "next/server";

/**
 * Image proxy endpoint to fetch exercise GIFs from ExerciseDB
 * This is needed because the image endpoint requires authentication
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const exerciseId = params.id;
    const EXERCISEDB_API_KEY = process.env.EXERCISEDB_API_KEY;

    if (!EXERCISEDB_API_KEY) {
      return new NextResponse("API key not configured", { status: 500 });
    }

    // Pad exercise ID to 4 digits
    const paddedId = exerciseId.padStart(4, '0');

    // Fetch the image from ExerciseDB
    const response = await fetch(
      `https://exercisedb.p.rapidapi.com/image?resolution=180&exerciseId=${paddedId}`,
      {
        headers: {
          "X-RapidAPI-Key": EXERCISEDB_API_KEY,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch image for exercise ${exerciseId}:`, response.statusText);
      return new NextResponse("Image not found", { status: 404 });
    }

    // Get the image data
    const imageData = await response.arrayBuffer();

    // Return the image with proper headers
    return new NextResponse(imageData, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Error fetching exercise image:", error);
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}

