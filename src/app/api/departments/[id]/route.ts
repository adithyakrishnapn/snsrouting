import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Department from "@/models/Department";
import { requireAdminAuth } from "@/lib/auth";
import { departmentSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/departments/[id]
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const department = await Department.findById(id).lean();
    if (!department) {
      return NextResponse.json(
        { success: false, error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: department });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch department" },
      { status: 500 }
    );
  }
}

// PATCH /api/departments/[id] (Protected)
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdminAuth(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    // Partial validation or full schema check
    const validation = departmentSchema.partial().safeParse(body);
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

    const updated = await Department.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Department updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update department" },
      { status: 500 }
    );
  }
}

// DELETE /api/departments/[id] (Protected)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdminAuth(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await dbConnect();

    const deleted = await Department.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete department" },
      { status: 500 }
    );
  }
}
