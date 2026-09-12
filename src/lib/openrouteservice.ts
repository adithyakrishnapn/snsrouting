import { Coordinate } from "@/types/department";
import { RouteInfo } from "@/types/navigation";
import { fetchGoogleWalkingDirections } from "./googlemaps";

// Haversine formula for straight line calculation
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

// Active Campus Main Walkway Nodes (Main Gate -> Uzhiyum Nanum -> Food Court -> AI Campus Block)
// Follows actual grey road polylines smoothly without cutting across buildings.
export const ACTIVE_MAIN_GATE_TO_AI_BLOCK_PATH: [number, number][] = [
  [11.100780, 77.025960], // 1. Main Gate (near SNS Clinic)
  [11.100650, 77.026550], // 2. South Road past Uzhiyum Nanum
  [11.100750, 77.027150], // 3. Road past Vivekananda Block / E Block
  [11.100750, 77.027520], // 4. Food Court Corner Junction
  [11.102200, 77.027520], // 5. Main Central Avenue (west of Basketball Court)
  [11.103250, 77.027300], // 6. AI Campus Block Entrance
];

function calculatePathDistance(coords: [number, number][]): number {
  let totalMeters = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    totalMeters += calculateHaversineDistance(
      { latitude: coords[i][0], longitude: coords[i][1] },
      { latitude: coords[i + 1][0], longitude: coords[i + 1][1] }
    );
  }
  return Math.round(totalMeters);
}

export async function fetchWalkingDirections(
  start: Coordinate,
  end: Coordinate
): Promise<RouteInfo> {
  // 1. Try Google Maps Directions API if API key is provided
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (googleApiKey && googleApiKey.trim() !== "" && googleApiKey !== "your_google_maps_api_key") {
    const googleRoute = await fetchGoogleWalkingDirections(start, end, googleApiKey);
    if (googleRoute) {
      return googleRoute;
    }
  }

  const apiKey = process.env.OPENROUTESERVICE_API_KEY;

  // Check if routing between Main Gate / South Campus and AI Campus Block (North)
  const isStartNearMainGate = start.latitude < 11.1020;
  const isEndNearAIBlock = end.latitude > 11.1025;

  // If navigating from Main Gate / South Campus to AI Campus Block:
  // MUST follow active open road through Uzhiyum Nanum & Food Court (west road is closed)
  if (isStartNearMainGate && isEndNearAIBlock) {
    const leafletCoords: [number, number][] = [...ACTIVE_MAIN_GATE_TO_AI_BLOCK_PATH];

    // Prepend user start if slightly off Main Gate
    const distToFirst = calculateHaversineDistance(start, {
      latitude: leafletCoords[0][0],
      longitude: leafletCoords[0][1],
    });
    if (distToFirst > 10) {
      leafletCoords.unshift([start.latitude, start.longitude]);
    }

    // Append classroom end if slightly inside building
    const lastIdx = leafletCoords.length - 1;
    const distToLast = calculateHaversineDistance(end, {
      latitude: leafletCoords[lastIdx][0],
      longitude: leafletCoords[lastIdx][1],
    });
    if (distToLast > 5) {
      leafletCoords.push([end.latitude, end.longitude]);
    }

    const distanceMeters = calculatePathDistance(leafletCoords);
    const durationSeconds = Math.round(distanceMeters / 1.2);

    return {
      coordinates: leafletCoords,
      distanceMeters,
      durationSeconds,
      isFallback: false,
    };
  }

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

  // 2. Fallback to OSRM Public Foot Routing Service
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

  // 3. Last resort straight-line fallback
  return straightLineFallback;
}

