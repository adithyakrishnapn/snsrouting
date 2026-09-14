import { ICampusMapObject } from "@/types/map";

export const SEED_CAMPUS_MAP_OBJECTS: Partial<ICampusMapObject>[] = [
  // 1. AI Campus Block Polygon (Single precise building block wrapping nearby classrooms IA042, IA040, IA028, IA014)
  {
    type: "building",
    name: "AI Campus Block",
    slug: "ai-campus-block",
    description: "AI Campus Complex housing 1st Year EEE-A (IA042), EEE-B (IA040), MCT (IA028), and MMCT (IA014) classrooms.",
    buildingType: "Academic",
    floorCount: 3,
    boundary: [
      { latitude: 11.103500, longitude: 77.027200 },
      { latitude: 11.103500, longitude: 77.027420 },
      { latitude: 11.103200, longitude: 77.027420 },
      { latitude: 11.103200, longitude: 77.027200 },
    ],
    labelPosition: { latitude: 11.103350, longitude: 77.027310 },
    isActive: true,
  },

  // 2. AI Campus Building Main Entrance Point
  {
    type: "entrance",
    name: "AI Campus Entrance",
    category: "Building Entrance",
    location: { latitude: 11.103250, longitude: 77.027300 },
    isActive: true,
  },

  // 3. Nearby Classrooms inside AI Campus Block
  {
    type: "classroom",
    name: "1st EEE-A (IA042)",
    roomNumber: "IA042",
    floor: "2nd Floor",
    category: "Classroom",
    location: { latitude: 11.103333, longitude: 77.027350 },
    isActive: true,
  },
  {
    type: "classroom",
    name: "1st EEE-B (IA040)",
    roomNumber: "IA040",
    floor: "2nd Floor",
    category: "Classroom",
    location: { latitude: 11.103418, longitude: 77.027346 },
    isActive: true,
  },
  {
    type: "classroom",
    name: "1st MCT (IA028)",
    roomNumber: "IA028",
    floor: "1st Floor",
    category: "Classroom",
    location: { latitude: 11.103285, longitude: 77.027264 },
    isActive: true,
  },
  {
    type: "classroom",
    name: "1st MMCT (IA014)",
    roomNumber: "IA014",
    floor: "2nd Floor",
    category: "Classroom",
    location: { latitude: 11.103263, longitude: 77.027319 },
    isActive: true,
  },

  // 4. Main Active Campus Walkway (Main Gate -> Uzhiyum Nanum -> Food Court Junction -> Girls Hostel Front Road -> AI Campus Block)
  {
    type: "path",
    name: "Central Avenue - Girls Hostel Front Road",
    pathType: "road",
    coordinates: [
      { latitude: 11.100776, longitude: 77.025960 },
      { latitude: 11.100650, longitude: 77.026550 },
      { latitude: 11.100750, longitude: 77.027520 },
      { latitude: 11.100860, longitude: 77.028012 },
      { latitude: 11.102459, longitude: 77.028012 },
      { latitude: 11.103250, longitude: 77.027300 },
      { latitude: 11.103462, longitude: 77.027298 },
    ],
    isActive: true,
  },
];

