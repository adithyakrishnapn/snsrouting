import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICampusRouteSegmentDocument extends Document {
  name: string;
  fromNodeId: mongoose.Types.ObjectId | string;
  toNodeId: mongoose.Types.ObjectId | string;
  pathType: "road" | "walking";
  coordinates: Array<{ latitude: number; longitude: number }>;
  allowed: boolean;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CampusRouteSegmentSchema = new Schema<ICampusRouteSegmentDocument>(
  {
    name: { type: String, required: true, trim: true },
    fromNodeId: { type: Schema.Types.ObjectId, ref: "CampusRouteNode", required: true, index: true },
    toNodeId: { type: Schema.Types.ObjectId, ref: "CampusRouteNode", required: true, index: true },
    pathType: {
      type: String,
      enum: ["road", "walking"],
      default: "road",
    },
    coordinates: [
      {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        _id: false,
      },
    ],
    allowed: { type: Boolean, default: true, index: true },
    priority: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

const CampusRouteSegment: Model<ICampusRouteSegmentDocument> =
  mongoose.models.CampusRouteSegment ||
  mongoose.model<ICampusRouteSegmentDocument>("CampusRouteSegment", CampusRouteSegmentSchema);

export default CampusRouteSegment;
