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

const Department = mongoose.models.Department || mongoose.model("Department", DepartmentSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const SEED_DEPARTMENTS = [
  {
    name: "Computer Science and Engineering",
    slug: "computer-science-and-engineering",
    shortName: "CSE",
    description: "Department of Computer Science and Engineering focusing on software engineering, AI, and cloud computing.",
    buildingName: "CSE Block - Main Academic Complex",
    location: { latitude: 11.101925, longitude: 77.025604 },
    entranceLocation: { latitude: 11.1021, longitude: 77.02545 },
    floor: "2nd Floor",
    roomNumber: "Room 204",
    roomLocation: { latitude: 11.10195, longitude: 77.0257 },
    instructions: [
      { stepNumber: 1, text: "Enter through the CSE Block main entrance on the west wing." },
      { stepNumber: 2, text: "Take the central staircase on your right past the main reception foyer." },
      { stepNumber: 3, text: "Proceed up to the 2nd floor." },
      { stepNumber: 4, text: "Turn left at the top of the stairwell into the main academic corridor." },
      { stepNumber: 5, text: "Room 204 is located approximately 15 metres straight ahead on your left." },
    ],
    landmarks: [
      { name: "Main Reception Foyer", description: "Ground floor main entrance lobby", latitude: 11.102, longitude: 77.0255 },
    ],
    images: [],
    isActive: true,
  },
  {
    name: "Electronics and Communication Engineering",
    slug: "electronics-and-communication-engineering",
    shortName: "ECE",
    description: "Department of ECE specialising in VLSI design, embedded systems, and telecommunications.",
    buildingName: "ECE Block - Science & Tech Wing",
    location: { latitude: 11.1023, longitude: 77.0259 },
    entranceLocation: { latitude: 11.10245, longitude: 77.02575 },
    floor: "1st Floor",
    roomNumber: "Room 108",
    roomLocation: { latitude: 11.10235, longitude: 77.026 },
    instructions: [
      { stepNumber: 1, text: "Walk to the ECE Block entrance near the central courtyard." },
      { stepNumber: 2, text: "Walk past the IoT & Embedded Systems Lab on the ground floor." },
      { stepNumber: 3, text: "Take the eastern staircase on the left to the 1st Floor." },
      { stepNumber: 4, text: "Walk down the east wing corridor towards Room 108." },
    ],
    landmarks: [
      { name: "Central Courtyard Palm Tree", description: "Open landmark right outside ECE entrance", latitude: 11.1024, longitude: 77.0258 },
    ],
    images: [],
    isActive: true,
  },
  {
    name: "Electrical and Electronics Engineering",
    slug: "electrical-and-electronics-engineering",
    shortName: "EEE",
    description: "Department of EEE focusing on power electronics, renewable energy, and control systems.",
    buildingName: "EEE Block - Innovation Complex",
    location: { latitude: 11.1015, longitude: 77.0252 },
    entranceLocation: { latitude: 11.10165, longitude: 77.02505 },
    floor: "Ground Floor",
    roomNumber: "Room 005",
    roomLocation: { latitude: 11.10155, longitude: 77.0253 },
    instructions: [
      { stepNumber: 1, text: "Enter through the west entrance of the Innovation Complex." },
      { stepNumber: 2, text: "Head straight past the Power Systems Simulation Laboratory." },
      { stepNumber: 3, text: "Room 005 (EEE Lecture Hall 1) is the third door on your right." },
    ],
    landmarks: [
      { name: "High Voltage Lab Signboard", description: "Visible landmark right at the corridor start", latitude: 11.1016, longitude: 77.0251 },
    ],
    images: [],
    isActive: true,
  },
  {
    name: "Mechanical Engineering",
    slug: "mechanical-engineering",
    shortName: "MECH",
    description: "Department of Mechanical Engineering specializing in robotics, CAD/CAM, and thermal engineering.",
    buildingName: "Mechanical Block & Workshops",
    location: { latitude: 11.1012, longitude: 77.0261 },
    entranceLocation: { latitude: 11.10135, longitude: 77.02595 },
    floor: "1st Floor",
    roomNumber: "Room 112",
    roomLocation: { latitude: 11.10125, longitude: 77.0262 },
    instructions: [
      { stepNumber: 1, text: "Walk past the Central Workshop facility towards the Mechanical Block." },
      { stepNumber: 2, text: "Enter through the main sliding glass doors." },
      { stepNumber: 3, text: "Take the heavy-duty stairs to the 1st Floor." },
      { stepNumber: 4, text: "Turn right and follow the corridor. Room 112 is past the Design Lab." },
    ],
    landmarks: [
      { name: "CNC Machine Display Foyer", description: "Exhibit model near workshop entrance", latitude: 11.1013, longitude: 77.026 },
    ],
    images: [],
    isActive: true,
  },
];

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

    // 2. Seed/Upsert 4 SNS Departments
    await Department.deleteMany({});
    const createdDepts = await Department.insertMany(SEED_DEPARTMENTS);
    console.log(`✓ Seeded ${createdDepts.length} departments into MongoDB Atlas:`);
    createdDepts.forEach((d) => {
      console.log(`   - [${d.shortName}] ${d.name} (${d.buildingName}, ${d.roomNumber})`);
    });

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
