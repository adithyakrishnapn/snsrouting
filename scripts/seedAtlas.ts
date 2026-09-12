import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

// Load .env.local manually if running via CLI
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const parts = trimmed.split("=");
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sns_campus_navigator";

// Department Schema
const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    shortName: { type: String, required: true },
    description: String,
    buildingName: { type: String, required: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    entranceLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    floor: { type: String, required: true },
    roomNumber: { type: String, required: true },
    roomLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    instructions: [
      {
        stepNumber: Number,
        text: String,
        imageUrl: String,
      },
    ],
    landmarks: [
      {
        name: String,
        description: String,
        latitude: Number,
        longitude: Number,
      },
    ],
    images: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// User Schema
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
  },
  { timestamps: true }
);

// CampusMapObject Schema
const CampusMapObjectSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String },
    description: String,
    boundary: [{ latitude: Number, longitude: Number }],
    labelPosition: { latitude: Number, longitude: Number },
    buildingType: String,
    floorCount: Number,
    category: String,
    location: { latitude: Number, longitude: Number },
    floor: String,
    roomNumber: String,
    buildingId: mongoose.Schema.Types.ObjectId,
    pathType: String,
    coordinates: [{ latitude: Number, longitude: Number }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Department = mongoose.models.Department || mongoose.model("Department", DepartmentSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const CampusMapObject = mongoose.models.CampusMapObject || mongoose.model("CampusMapObject", CampusMapObjectSchema);

import { SEED_DEPARTMENTS } from "../src/lib/seedData";
import { SEED_CAMPUS_MAP_OBJECTS } from "../src/lib/seedMapObjects";

async function main() {
  console.log("Connecting to MongoDB:", MONGODB_URI.replace(/:([^@]+)@/, ":*****@"));

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to MongoDB successfully!");

    // 1. Seed/Upsert Admin User with password #123456asd#
    const rawPassword = "#123456asd#";
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const existingUser = await User.findOne({ username: "admin" });
    if (existingUser) {
      existingUser.passwordHash = passwordHash;
      existingUser.email = "admin@snsct.edu.in";
      await existingUser.save();
      console.log("✓ Updated existing admin user credentials (Username: admin, Password: #123456asd#)");
    } else {
      await User.create({
        username: "admin",
        email: "admin@snsct.edu.in",
        passwordHash,
        role: "admin",
      });
      console.log("✓ Created new admin user (Username: admin, Password: #123456asd#)");
    }

    // 2. Seed SNS Departments
    await Department.deleteMany({});
    const createdDepts = await Department.insertMany(SEED_DEPARTMENTS);
    console.log(`✓ Seeded ${createdDepts.length} departments into MongoDB Atlas:`);
    createdDepts.forEach((d) => {
      console.log(`   - [${d.shortName}] ${d.name} (${d.buildingName}, ${d.roomNumber})`);
    });

    // 3. Seed Campus Map Objects (Building Polygons, Paths, Rooms)
    await CampusMapObject.deleteMany({});
    const createdObjects = await CampusMapObject.insertMany(SEED_CAMPUS_MAP_OBJECTS);
    console.log(`✓ Seeded ${createdObjects.length} campus map objects (buildings, paths, rooms) into MongoDB Atlas.`);

    console.log("\n==========================================");
    console.log("🚀 MONGODB SEEDING COMPLETE!");
    console.log("Admin Credentials:");
    console.log("Username: admin");
    console.log("Password: #123456asd#");
    console.log("==========================================\n");
  } catch (err) {
    console.error("❌ MongoDB Seeding Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
