"use client";

import { Polyline, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

interface RouteLayerProps {
  coordinates: [number, number][];
  isFallback?: boolean;
}

export function RouteLayer({ coordinates, isFallback = false }: RouteLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
    }
  }, [coordinates, map]);

  if (!coordinates || coordinates.length < 2) return null;

  return (
    <>
      {/* Background stroke glow effect */}
      <Polyline
        positions={coordinates}
        pathOptions={{
          color: isFallback ? "#f59e0b" : "#0284c7",
          weight: 7,
          opacity: 0.35,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
      {/* Foreground crisp path line */}
      <Polyline
        positions={coordinates}
        pathOptions={{
          color: isFallback ? "#d97706" : "#2563eb",
          weight: 4,
          opacity: 0.9,
          dashArray: isFallback ? "8, 8" : undefined,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
    </>
  );
}
