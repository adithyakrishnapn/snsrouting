import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, setAdminCookie } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find admin user in MongoDB
    let user = await User.findOne({ username: username.toLowerCase() });

    // Auto-create initial admin user with password #123456asd# if User collection is empty
    if (!user && username.toLowerCase() === "admin" && password === "#123456asd#") {
      const passwordHash = await bcrypt.hash("#123456asd#", 10);
      user = await User.create({
        username: "admin",
        email: "admin@snsct.edu.in",
        passwordHash,
        role: "admin",
      });
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    const token = await createAdminToken({ username: user.username, role: user.role });
    await setAdminCookie(token);

    return NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      user: { username: user.username, role: user.role },
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
