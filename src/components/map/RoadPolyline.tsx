"use client";

import { Polyline, Tooltip } from "react-leaflet";
import { PathType, ROAD_STYLE_CONFIG } from "@/types/map";
import { Coordinate } from "@/types/department";

interface RoadPolylineProps {
  coordinates: Coordinate[];
  pathType?: PathType | string;
  name: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function RoadPolyline({
  coordinates,
  pathType = "walkway",
  name,
  isSelected = false,
  onClick,
}: RoadPolylineProps) {
  if (!coordinates || coordinates.length < 2) return null;

  const validPathType: PathType =
    pathType === "road" || pathType === "footpath" ? (pathType as PathType) : "walkway";

  const style = ROAD_STYLE_CONFIG[validPathType] || ROAD_STYLE_CONFIG.walkway;
  const positions: [number, number][] = coordinates.map((pt) => [pt.latitude, pt.longitude]);

  return (
    <>
      {/* 1. Bottom Outer Base / Boundary Layer */}
      <Polyline
        positions={positions}
        eventHandlers={{
          click: () => onClick && onClick(),
        }}
        pathOptions={{
          color: isSelected ? "#3b82f6" : style.outerColor,
          weight: isSelected ? style.outerWidth + 4 : style.outerWidth,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
        }}
      />

      {/* 2. Middle Road / Walkway Surface Layer */}
      <Polyline
        positions={positions}
        eventHandlers={{
          click: () => onClick && onClick(),
        }}
        pathOptions={{
          color: isSelected ? "#60a5fa" : style.innerColor,
          weight: style.innerWidth,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
          dashArray: validPathType === "footpath" ? "6, 6" : undefined,
        }}
      >
        <Tooltip sticky className="text-xs font-semibold">
          {validPathType === "road" ? "🛣️" : validPathType === "walkway" ? "🚶" : "👟"}{" "}
          {name} ({style.label})
        </Tooltip>
      </Polyline>

      {/* 3. Top Optional Centerline Layer (For Campus Roads) */}
      {style.showCenterLine && (
        <Polyline
          positions={positions}
          eventHandlers={{
            click: () => onClick && onClick(),
          }}
          pathOptions={{
            color: style.centerLineColor || "#f59e0b",
            weight: style.centerLineWidth || 2,
            dashArray: style.centerLineDash || "8, 8",
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      )}
    </>
  );
}
