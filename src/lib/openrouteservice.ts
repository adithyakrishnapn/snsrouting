import { Coordinate } from "@/types/department";
import { RouteInfo } from "@/types/navigation";

// Haversine formula for straight line fallback calculation
export function calculateHaversineDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371e3; // Earth radius in meters
  const rad = Math.PI / 180;
  const dLat = (coord2.latitude - coord1.latitude) * rad;
  const dLon = (coord2.longitude - coord1.longitude) * rad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.latitude * rad) *
      Math.cos(coord2.latitude * rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // Distance in meters
}

export async function fetchWalkingDirections(
  start: Coordinate,
  end: Coordinate
): Promise<RouteInfo> {
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;

  const straightLineDistance = calculateHaversineDistance(start, end);
  const estimatedWalkingDuration = Math.round(straightLineDistance / 1.2);

  const straightLineFallback: RouteInfo = {
    coordinates: [
      [start.latitude, start.longitude],
      [end.latitude, end.longitude],
    ],
    distanceMeters: straightLineDistance,
    durationSeconds: estimatedWalkingDuration,
    isFallback: true,
  };

  // 1. Try OpenRouteService if API key is provided
  if (apiKey && apiKey.trim() !== "" && apiKey !== "your_openrouteservice_api_key") {
    try {
      const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}&start=${start.longitude},${start.latitude}&end=${end.longitude},${end.latitude}`;

      const res = await fetch(url, {
        headers: {
          Accept: "application/json, application/geo+json, application/gpx+xml, img/png; md5",
        },
        next: { revalidate: 300 },
      });

      if (res.ok) {
        const data = await res.json();
        if (
          data.features &&
          data.features.length > 0 &&
          data.features[0].geometry?.coordinates
        ) {
          const feature = data.features[0];
          const geoCoords: [number, number][] = feature.geometry.coordinates;
          const leafletCoords: [number, number][] = geoCoords.map(([lng, lat]) => [lat, lng]);
          const summary = feature.properties.summary;

          return {
            coordinates: leafletCoords,
            distanceMeters: Math.round(summary.distance),
            durationSeconds: Math.round(summary.duration),
            isFallback: false,
          };
        }
      }
    } catch (error) {
      console.warn("OpenRouteService request failed, falling back to OSRM road routing:", error);
    }
  }

  // 2. Fallback to OSRM Public Foot Routing Service (No API key needed, follows real OSM roads & paths!)
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;

    const res = await fetch(osrmUrl, {
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0 && data.routes[0].geometry?.coordinates) {
        const route = data.routes[0];
        const geoCoords: [number, number][] = route.geometry.coordinates;
        const leafletCoords: [number, number][] = geoCoords.map(([lng, lat]) => [lat, lng]);

        return {
          coordinates: leafletCoords,
          distanceMeters: Math.round(route.distance),
          durationSeconds: Math.round(route.duration),
          isFallback: false,
        };
      }
    }
  } catch (error) {
    console.warn("OSRM road routing request failed:", error);
  }

  // 3. Last resort straight-line fallback if network fails
  return straightLineFallback;
}
