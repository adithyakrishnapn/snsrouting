import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Department from "@/models/Department";
import { departmentSchema } from "@/lib/validations";
import { requireAdminAuth } from "@/lib/auth";

// GET /api/departments
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "true";

    const query = includeInactive ? {} : { isActive: true };
    const departments = await Department.find(query).sort({ name: 1 }).lean();

    return NextResponse.json({
      success: true,
      count: departments.length,
      data: departments,
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
