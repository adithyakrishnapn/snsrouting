import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Department from "@/models/Department";
import { SEED_DEPARTMENTS } from "@/lib/seedData";

export async function POST() {
  try {
    await dbConnect();

    // Check if database already has departments
    const count = await Department.countDocuments();
    if (count > 0) {
      // Re-seed: delete existing and re-insert
      await Department.deleteMany({});
    }

    const created = await Department.insertMany(SEED_DEPARTMENTS);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${created.length} placeholder departments.`,
      data: created,
    });
  } catch (error: any) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to seed database",
      },
      { status: 500 }
    );
  }
}
