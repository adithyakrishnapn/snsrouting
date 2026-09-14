/**
 * Generates a clean, standard Google Maps walking directions URL for external handoff.
 * No Google API Key required.
 *
 * @param latitude Destination latitude
 * @param longitude Destination longitude
 * @returns Google Maps directions URL or null if coordinates are invalid
 */
export function createGoogleMapsDirectionsUrl(
  latitude: number | undefined | null,
  longitude: number | undefined | null
): string | null {
  if (
    latitude === undefined ||
    latitude === null ||
    longitude === undefined ||
    longitude === null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  const params = new URLSearchParams({
    api: "1",
    destination: `${latitude},${longitude}`,
    travelmode: "walking",
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
