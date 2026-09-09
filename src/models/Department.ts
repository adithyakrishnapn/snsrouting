import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInstructionStepSubdoc {
  stepNumber: number;
  text: string;
  imageUrl?: string;
}

export interface ILandmarkSubdoc {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
}

export interface IDepartmentDocument extends Document {
  name: string;
  slug: string;
  shortName: string;
  description?: string;
  buildingName: string;
  location: {
    latitude: number;
    longitude: number;
  };
  entranceLocation: {
    latitude: number;
    longitude: number;
  };
  floor: string;
  roomNumber: string;
  roomLocation: {
    latitude: number;
    longitude: number;
  };
  instructions: IInstructionStepSubdoc[];
  landmarks?: ILandmarkSubdoc[];
  images?: string[];
  buildingId?: mongoose.Types.ObjectId | string;
  entranceId?: mongoose.Types.ObjectId | string;
  classroomId?: mongoose.Types.ObjectId | string;
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

const InstructionStepSchema = new Schema(
  {
    stepNumber: { type: Number, required: true },
    text: { type: String, required: true },
    imageUrl: { type: String },
  },
  { _id: false }
);

const LandmarkSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false }
);

const DepartmentSchema = new Schema<IDepartmentDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    shortName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    buildingName: { type: String, required: true, trim: true },
    location: { type: CoordinateSchema, required: true },
    entranceLocation: { type: CoordinateSchema, required: true },
    floor: { type: String, required: true, trim: true },
    roomNumber: { type: String, required: true, trim: true },
    roomLocation: { type: CoordinateSchema, required: true },
    instructions: { type: [InstructionStepSchema], default: [] },
    landmarks: { type: [LandmarkSchema], default: [] },
    images: { type: [String], default: [] },
    buildingId: { type: Schema.Types.ObjectId, ref: "CampusMapObject" },
    entranceId: { type: Schema.Types.ObjectId, ref: "CampusMapObject" },
    classroomId: { type: Schema.Types.ObjectId, ref: "CampusMapObject" },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Prevent overwrite during dev reloads
const Department: Model<IDepartmentDocument> =
  mongoose.models.Department || mongoose.model<IDepartmentDocument>("Department", DepartmentSchema);

export default Department;
