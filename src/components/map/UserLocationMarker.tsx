"use client";

import { Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";

interface UserLocationMarkerProps {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

const createUserIcon = () => {
  return L.divIcon({
    className: "user-location-marker-container",
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <div class="absolute w-6 h-6 rounded-full bg-blue-500 opacity-30 user-location-pulse"></div>
        <div class="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export function UserLocationMarker({ latitude, longitude, accuracy }: UserLocationMarkerProps) {
  const icon = createUserIcon();

  return (
    <>
      <Marker position={[latitude, longitude]} icon={icon}>
        <Popup className="text-xs">
          <div className="font-semibold text-blue-900 dark:text-blue-200">You are here</div>
          {accuracy && <div className="text-zinc-500">Accuracy: ±{Math.round(accuracy)}m</div>}
        </Popup>
      </Marker>
      {accuracy && accuracy > 5 && (
        <Circle
          center={[latitude, longitude]}
          radius={accuracy}
          pathOptions={{
            color: "#2563eb",
            fillColor: "#3b82f6",
            fillOpacity: 0.15,
            weight: 1,
            dashArray: "4, 4",
          }}
        />
      )}
    </>
  );
}
