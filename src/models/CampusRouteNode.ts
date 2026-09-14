import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICampusRouteNodeDocument extends Document {
  name: string;
  type: "gate" | "junction" | "entrance" | "landmark";
  location: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CampusRouteNodeSchema = new Schema<ICampusRouteNodeDocument>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["gate", "junction", "entrance", "landmark"],
      default: "junction",
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

const CampusRouteNode: Model<ICampusRouteNodeDocument> =
  mongoose.models.CampusRouteNode ||
  mongoose.model<ICampusRouteNodeDocument>("CampusRouteNode", CampusRouteNodeSchema);

export default CampusRouteNode;
