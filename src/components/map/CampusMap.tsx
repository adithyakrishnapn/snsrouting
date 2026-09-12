"use client";

import { MapContainer, TileLayer, Polygon, Marker, Tooltip, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import { IDepartment } from "@/types/department";
import { RouteInfo } from "@/types/navigation";
import { ICampusMapObject, PathType } from "@/types/map";
import { UserLocationMarker } from "./UserLocationMarker";
import { DestinationMarker } from "./DestinationMarker";
import { RouteLayer } from "./RouteLayer";
import { RoadPolyline } from "./RoadPolyline";
import { Layers, Map as MapIcon, Globe } from "lucide-react";

interface CampusMapProps {
  userLocation?: { latitude: number; longitude: number; accuracy?: number | null } | null;
  departments: IDepartment[];
  selectedDepartment?: IDepartment | null;
  routeData?: RouteInfo | null;
  mapObjects?: ICampusMapObject[];
  className?: string;
}

// Controller to auto-center map when department or user location changes
function MapRecenter({
  center,
  zoom,
}: {
  center: [number, number];
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
}

const createLabelIcon = (name: string) => {
  return L.divIcon({
    className: "building-label-divicon",
    html: `
      <div class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider bg-slate-900/95 text-white border border-slate-700 shadow-md backdrop-blur-md flex items-center gap-1">
        <span>🏢</span>
        <span>${name}</span>
      </div>
    `,
    iconSize: [110, 24],
    iconAnchor: [55, 12],
  });
};

const DEFAULT_CENTER: [number, number] = [11.1021, 77.0265]; // Centered to frame both MAIN GATE and AI Campus Block

export const TILE_SOURCES = {
  osm: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    icon: Globe,
  },
  google_streets: {
    name: "Google Maps",
    url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    attribution: "&copy; Google Maps",
    icon: MapIcon,
  },
  google_hybrid: {
    name: "Google Satellite",
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attribution: "&copy; Google Maps Satellite",
    icon: Layers,
  },
};

export default function CampusMap({
  userLocation,
  departments,
  selectedDepartment,
  routeData,
  mapObjects = [],
  className = "w-full h-full min-h-[400px]",
}: CampusMapProps) {
  const [activeTileSource, setActiveTileSource] = useState<keyof typeof TILE_SOURCES>("osm");

  // Determine center point based on selected department or default campus center
  const initialCenter: [number, number] = selectedDepartment
    ? [selectedDepartment.location.latitude, selectedDepartment.location.longitude]
    : DEFAULT_CENTER;

  const buildings = mapObjects.filter(
    (o) => o.type === "building" && o.boundary && o.boundary.length >= 3
  );
  const campusPaths = mapObjects.filter(
    (o) => o.type === "path" && o.coordinates && o.coordinates.length >= 2
  );

  const tileConfig = TILE_SOURCES[activeTileSource];

  return (
    <div
      className={`relative overflow-hidden rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 ${className}`}
    >
      <MapContainer
        center={initialCenter}
        zoom={17.5}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          key={activeTileSource}
          attribution={tileConfig.attribution}
          url={tileConfig.url}
          maxZoom={20}
        />

        {/* Auto Recenter component if selected department changes */}
        {selectedDepartment && !routeData && (
          <MapRecenter
            center={[selectedDepartment.location.latitude, selectedDepartment.location.longitude]}
            zoom={18.5}
          />
        )}

        {/* 1. Custom Campus Roads, Walking Paths & Footpaths */}
        {campusPaths.map((p) => {
          const pType = (p.pathType as PathType) || "walkway";
          return (
            <RoadPolyline
              key={p._id || p.name}
              coordinates={p.coordinates!}
              pathType={pType}
              name={p.name}
            />
          );
        })}

        {/* 2. Custom Campus Building Polygons & Labels */}
        {buildings.map((b) => {
          const positions: [number, number][] = b.boundary!.map((pt) => [
            pt.latitude,
            pt.longitude,
          ]);
          const labelPos: [number, number] = b.labelPosition
            ? [b.labelPosition.latitude, b.labelPosition.longitude]
            : [b.boundary![0].latitude, b.boundary![0].longitude];

          return (
            <div key={b._id || b.name}>
              <Polygon
                positions={positions}
                pathOptions={{
                  color: "#2563eb",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.35,
                  weight: 2.5,
                }}
              >
                <Tooltip permanent direction="top" opacity={0.95} className="font-bold text-xs">
                  {b.name}
                </Tooltip>
              </Polygon>

              <Marker position={labelPos} icon={createLabelIcon(b.name)} />
            </div>
          );
        })}

        {/* 3. User Location Marker */}
        {userLocation && userLocation.latitude && userLocation.longitude && (
          <UserLocationMarker
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            accuracy={userLocation.accuracy}
          />
        )}

        {/* 4. Department Entrance & Classroom Markers */}
        {selectedDepartment ? (
          <DestinationMarker department={selectedDepartment} showClassroomPin={true} />
        ) : (
          departments.map((dept) => (
            <DestinationMarker key={dept._id || dept.slug} department={dept} showClassroomPin={false} />
          ))
        )}

        {/* 5. Active Outdoor Student GPS Navigation Route Layer */}
        {routeData && routeData.coordinates && routeData.coordinates.length > 0 && (
          <RouteLayer coordinates={routeData.coordinates} isFallback={routeData.isFallback} />
        )}
      </MapContainer>

      {/* Floating Map Layer Switcher (Top-Right Pill Bar) */}
      <div className="absolute top-3 right-3 z-[400] bg-slate-900/90 text-white backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-1 max-w-[calc(100%-2rem)] overflow-x-auto">
        {(Object.keys(TILE_SOURCES) as Array<keyof typeof TILE_SOURCES>).map((key) => {
          const item = TILE_SOURCES[key];
          const Icon = item.icon;
          const isActive = activeTileSource === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTileSource(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Map Legend Badge (Bottom-Left Bar) */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 text-white backdrop-blur-md px-3 py-2 rounded-2xl text-[11px] font-semibold shadow-xl border border-slate-800 flex items-center gap-3.5 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm"></span> You
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span> Entrance
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shadow-sm"></span> Classroom
        </span>
      </div>
    </div>
  );
}
