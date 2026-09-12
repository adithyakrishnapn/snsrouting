import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Department from "@/models/Department";
import CampusMapObject from "@/models/CampusMapObject";
import { SEED_DEPARTMENTS } from "@/lib/seedData";
import { SEED_CAMPUS_MAP_OBJECTS } from "@/lib/seedMapObjects";

export async function POST() {
  try {
    await dbConnect();

    // Re-seed departments
    await Department.deleteMany({});
    const createdDepts = await Department.insertMany(SEED_DEPARTMENTS);

    // Re-seed campus map objects (building polygons, paths, markers)
    await CampusMapObject.deleteMany({});
    const createdMapObjects = await CampusMapObject.insertMany(SEED_CAMPUS_MAP_OBJECTS);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${createdDepts.length} departments and ${createdMapObjects.length} campus map objects.`,
      data: {
        departments: createdDepts,
        mapObjects: createdMapObjects,
      },
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
