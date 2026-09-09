import { NextRequest, NextResponse } from "next/server";
import { directionsRequestSchema } from "@/lib/validations";
import { fetchWalkingDirections } from "@/lib/openrouteservice";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body using Zod
    const validationResult = directionsRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { start, end } = validationResult.data;

    const routeData = await fetchWalkingDirections(start, end);

    return NextResponse.json({
      success: true,
      data: routeData,
    });
  } catch (error: any) {
    console.error("Error in directions API route:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to calculate walking route",
      },
      { status: 500 }
    );
  }
}
