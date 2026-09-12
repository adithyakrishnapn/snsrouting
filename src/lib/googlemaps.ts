import { Coordinate } from "@/types/department";
import { RouteInfo } from "@/types/navigation";

// Decode Google Maps Encoded Polyline algorithm
export function decodeGooglePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

export async function fetchGoogleWalkingDirections(
  start: Coordinate,
  end: Coordinate,
  apiKey: string
): Promise<RouteInfo | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&mode=walking&key=${apiKey}`;

    const res = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.warn("Google Maps Directions API HTTP error:", res.statusText);
      return null;
    }

    const data = await res.json();

    if (data.status === "OK" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const leg = route.legs[0];
      const points = decodeGooglePolyline(route.overview_polyline.points);

      return {
        coordinates: points,
        distanceMeters: leg.distance.value,
        durationSeconds: leg.duration.value,
        isFallback: false,
      };
    } else {
      console.warn("Google Maps Directions API status:", data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error("Error calling Google Maps Directions API:", error);
    return null;
  }
}
