import { z } from "zod";

export const coordinateSchema = z.object({
  latitude: z
    .number()
    .min(-90, "Latitude must be >= -90")
    .max(90, "Latitude must be <= 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be >= -180")
    .max(180, "Longitude must be <= 180"),
});

export const directionsRequestSchema = z.object({
  start: coordinateSchema,
  end: coordinateSchema,
});

export const instructionStepSchema = z.object({
  stepNumber: z.number().int().min(1),
  text: z.string().min(1, "Instruction text is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const landmarkSchema = z.object({
  name: z.string().min(1, "Landmark name is required"),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const departmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain lowercase letters, numbers, and hyphens only"),
  shortName: z.string().min(1, "Short name (code) is required"),
  description: z.string().optional(),
  buildingName: z.string().min(1, "Building name is required"),
  location: coordinateSchema,
  entranceLocation: coordinateSchema,
  floor: z.string().min(1, "Floor is required"),
  roomNumber: z.string().min(1, "Room number is required"),
  roomLocation: coordinateSchema,
  instructions: z.array(instructionStepSchema).min(1, "At least one instruction step is required"),
  landmarks: z.array(landmarkSchema).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  buildingId: z.string().optional(),
  entranceId: z.string().optional(),
  classroomId: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const campusMapObjectSchema = z.object({
  type: z.enum(["building", "marker", "entrance", "classroom", "path"]),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),

  // Building specific
  boundary: z.array(coordinateSchema).optional(),
  labelPosition: coordinateSchema.optional(),
  buildingType: z.string().optional(),
  floorCount: z.number().optional().default(1),

  // Marker / Entrance / Classroom specific
  category: z.string().optional(),
  location: coordinateSchema.optional(),
  floor: z.string().optional(),
  roomNumber: z.string().optional(),
  buildingId: z.string().optional(),

  // Path / Road specific
  pathType: z.enum(["road", "walkway", "footpath"]).optional().default("walkway"),
  coordinates: z.array(coordinateSchema).optional(),

  isActive: z.boolean().optional().default(true),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;
export type DirectionsInput = z.infer<typeof directionsRequestSchema>;
export type CampusMapObjectInput = z.infer<typeof campusMapObjectSchema>;
