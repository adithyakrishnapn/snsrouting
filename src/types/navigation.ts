import { Coordinate } from "./department";

export interface UserLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

export interface RouteInfo {
  coordinates: [number, number][]; // [lat, lng] array for Leaflet polyline
  distanceMeters: number;
  durationSeconds: number;
  isFallback?: boolean;
}

export interface DirectionsRequest {
  start: Coordinate;
  end: Coordinate;
}

export interface DirectionsResponse {
  success: boolean;
  data?: RouteInfo;
  error?: string;
}
