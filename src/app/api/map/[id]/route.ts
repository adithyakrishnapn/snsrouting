import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import CampusMapObject from "@/models/CampusMapObject";
import { requireAdminAuth } from "@/lib/auth";
import { campusMapObjectSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/map/[id]
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const mapObject = await CampusMapObject.findById(id).lean();
    if (!mapObject) {
      return NextResponse.json(
        { success: false, error: "Map object not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: mapObject });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch map object" },
      { status: 500 }
    );
  }
}

// PATCH /api/map/[id] (Protected Admin Route)
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdminAuth(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const validation = campusMapObjectSchema.partial().safeParse(body);
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

    const updated = await CampusMapObject.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Map object not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Map object updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update map object" },
      { status: 500 }
    );
  }
}

// DELETE /api/map/[id] (Protected Admin Route)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdminAuth(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await dbConnect();

    const deleted = await CampusMapObject.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Map object not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Map object deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete map object" },
      { status: 500 }
    );
  }
}
