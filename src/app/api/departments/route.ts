import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Department from "@/models/Department";
import { departmentSchema } from "@/lib/validations";
import { requireAdminAuth } from "@/lib/auth";
import { SEED_DEPARTMENTS } from "@/lib/seedData";

// Helper map for classroom image fallbacks
function getFallbackImage(roomNumber: string, shortName: string): string[] {
  const room = (roomNumber || "").toUpperCase();
  const name = (shortName || "").toUpperCase();

  if (room.includes("IA042") || name.includes("EEE-A")) return ["/uploads/ia042.jpg"];
  if (room.includes("IA040") || name.includes("EEE-B")) return ["/uploads/ia040.jpg"];
  if (room.includes("IA028") || name.includes("MCT")) return ["/uploads/ia028.jpg"];
  if (room.includes("IA014") || name.includes("MMCT")) return ["/uploads/ia014.png"];
  return [];
}

// GET /api/departments
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "true";

    const query = includeInactive ? {} : { isActive: true };
    let departments = await Department.find(query).sort({ name: 1 }).lean();

    // Auto-seed if database is empty
    if (!departments || departments.length === 0) {
      const created = await Department.insertMany(SEED_DEPARTMENTS);
      departments = created.map((d) => d.toObject());
    }

    // Ensure image arrays are populated
    const enriched = departments.map((dept) => {
      if (!dept.images || dept.images.length === 0) {
        dept.images = getFallbackImage(dept.roomNumber, dept.shortName);
      }
      return dept;
    });

    return NextResponse.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error: any) {
    console.error("GET /api/departments error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

// POST /api/departments (Protected Admin Route)
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
    const validation = departmentSchema.safeParse(body);

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

    // Check slug uniqueness
    const existing = await Department.findOne({ slug: validation.data.slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Department with slug '${validation.data.slug}' already exists.` },
        { status: 409 }
      );
    }

    const created = await Department.create(validation.data);

    return NextResponse.json(
      {
        success: true,
        message: "Department created successfully",
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/departments error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create department" },
      { status: 500 }
    );
  }
}
