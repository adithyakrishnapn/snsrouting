import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import CampusMapObject from "@/models/CampusMapObject";

export async function GET() {
  try {
    await dbConnect();
    const markers = await CampusMapObject.find({
      type: { $in: ["marker", "entrance", "classroom"] },
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ success: true, count: markers.length, data: markers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
