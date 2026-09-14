export type RouteNodeType = "gate" | "junction" | "entrance" | "landmark";
export type SegmentPathType = "road" | "walking";

export interface ICampusRouteNode {
  _id?: string;
  name: string;
  type: RouteNodeType;
  location: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ICampusRouteSegment {
  _id?: string;
  name: string;
  fromNodeId: string;
  toNodeId: string;
  pathType: SegmentPathType;
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  allowed: boolean;
  priority: number;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
