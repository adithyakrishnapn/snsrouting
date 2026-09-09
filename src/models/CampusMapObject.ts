import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICampusMapObjectDocument extends Document {
  type: "building" | "marker" | "entrance" | "classroom" | "path";
  name: string;
  slug?: string;
  description?: string;

  // Building specific
  boundary?: Array<{ latitude: number; longitude: number }>;
  labelPosition?: { latitude: number; longitude: number };
  buildingType?: string;
  floorCount?: number;

  // Marker / Entrance / Classroom specific
  category?: string;
  location?: { latitude: number; longitude: number };
  floor?: string;
  roomNumber?: string;
  buildingId?: mongoose.Types.ObjectId | string;

  // Path / Road specific
  pathType?: "road" | "walkway" | "footpath";
  coordinates?: Array<{ latitude: number; longitude: number }>;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CoordinateSchema = new Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false }
);

const CampusMapObjectSchema = new Schema<ICampusMapObjectDocument>(
  {
    type: {
      type: String,
      required: true,
      enum: ["building", "marker", "entrance", "classroom", "path"],
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true },

    // Building fields
    boundary: { type: [CoordinateSchema], default: undefined },
    labelPosition: { type: CoordinateSchema, default: undefined },
    buildingType: { type: String, default: "Academic" },
    floorCount: { type: Number, default: 1 },

    // Point location fields (Marker / Entrance / Classroom)
    category: { type: String, default: "Other" },
    location: { type: CoordinateSchema, default: undefined },
    floor: { type: String },
    roomNumber: { type: String },
    buildingId: { type: Schema.Types.ObjectId, ref: "CampusMapObject", index: true },

    // Path / Road fields
    pathType: {
      type: String,
      enum: ["road", "walkway", "footpath"],
      default: "walkway",
    },
    coordinates: { type: [CoordinateSchema], default: undefined },

    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

const CampusMapObject: Model<ICampusMapObjectDocument> =
  mongoose.models.CampusMapObject ||
  mongoose.model<ICampusMapObjectDocument>("CampusMapObject", CampusMapObjectSchema);

export default CampusMapObject;
