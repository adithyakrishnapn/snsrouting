import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import CampusMapObject from "@/models/CampusMapObject";

export async function GET() {
  try {
    await dbConnect();
    const paths = await CampusMapObject.find({ type: "path", isActive: true })
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ success: true, count: paths.length, data: paths });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
