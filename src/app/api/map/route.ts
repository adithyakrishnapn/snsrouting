import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import CampusMapObject from "@/models/CampusMapObject";
import { campusMapObjectSchema } from "@/lib/validations";
import { requireAdminAuth } from "@/lib/auth";

// GET /api/map
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "true";
    const typeFilter = searchParams.get("type");

    const query: Record<string, any> = {};
    if (!includeInactive) {
      query.isActive = true;
    }
    if (typeFilter) {
      query.type = typeFilter;
    }

    const objects = await CampusMapObject.find(query).sort({ name: 1 }).lean();

    return NextResponse.json({
      success: true,
      count: objects.length,
      data: objects,
    });
  } catch (error: any) {
    console.error("GET /api/map error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch map objects" },
      { status: 500 }
    );
  }
}

// POST /api/map (Protected Admin Route)
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminAuth(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = campusMapObjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Auto-generate slug if building
    if (!validation.data.slug) {
      validation.data.slug = validation.data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    const created = await CampusMapObject.create(validation.data);

    return NextResponse.json(
      {
        success: true,
        message: "Campus map object created successfully",
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/map error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create map object" },
      { status: 500 }
    );
  }
}
