import { Coordinate } from "./department";

export type MapObjectType = "building" | "marker" | "entrance" | "classroom" | "path";

export type PathType = "road" | "walkway" | "footpath";

export interface RoadStyle {
  outerWidth: number;
  outerColor: string;
  innerWidth: number;
  innerColor: string;
  showCenterLine: boolean;
  centerLineWidth?: number;
  centerLineColor?: string;
  centerLineDash?: string;
  label: string;
}

export const ROAD_STYLE_CONFIG: Record<PathType, RoadStyle> = {
  road: {
    outerWidth: 18,
    outerColor: "#1e293b", // Dark Slate boundary
    innerWidth: 12,
    innerColor: "#cbd5e1", // Road surface
    showCenterLine: true,
    centerLineWidth: 2,
    centerLineColor: "#f59e0b", // Amber dashed center line
    centerLineDash: "8, 8",
    label: "Campus Road",
  },
  walkway: {
    outerWidth: 10,
    outerColor: "#78350f", // Warm amber outer
    innerWidth: 6,
    innerColor: "#fef3c7", // Pedestrian walkway surface
    showCenterLine: false,
    label: "Walking Path",
  },
  footpath: {
    outerWidth: 6,
    outerColor: "#475569",
    innerWidth: 4,
    innerColor: "#e2e8f0",
    showCenterLine: false,
    label: "Footpath",
  },
};

export type BuildingType =
  | "Academic"
  | "Administrative"
  | "Laboratory"
  | "Hostel"
  | "Amenities"
  | "Sports"
  | "Other";

export type MarkerCategory =
  | "Main Gate"
  | "Gate"
  | "Building Entrance"
  | "Staircase"
  | "Lift"
  | "Classroom"
  | "Laboratory"
  | "Library"
  | "Canteen"
  | "Parking"
  | "Restroom"
  | "Office"
  | "Other";

export interface ICampusMapObject {
  _id?: string;
  type: MapObjectType;
  name: string;
  slug?: string;
  description?: string;

  // Building specific
  boundary?: Coordinate[];
  labelPosition?: Coordinate;
  buildingType?: BuildingType | string;
  floorCount?: number;

  // Marker / Entrance / Classroom specific
  category?: MarkerCategory | string;
  location?: Coordinate;
  floor?: string;
  roomNumber?: string;
  buildingId?: string;

  // Path / Road specific
  pathType?: PathType | string;
  coordinates?: Coordinate[];

  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
