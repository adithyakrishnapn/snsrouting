"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  Polyline,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { ICampusMapObject, MapObjectType, PathType } from "@/types/map";
import { Coordinate } from "@/types/department";
import { LayerVisibility, LayerControlPanel } from "./LayerControlPanel";
import { RoadPolyline } from "@/components/map/RoadPolyline";
import {
  Building2,
  MapPin,
  DoorOpen,
  Navigation,
  Footprints,
  CheckCircle,
  X,
  Hand,
} from "lucide-react";

export type EditorMode =
  | "pan"
  | "building"
  | "marker"
  | "entrance"
  | "classroom"
  | "road"
  | "walkway"
  | "footpath"
  | "moveLabel";

interface MapEditorProps {
  objects: ICampusMapObject[];
  selectedObject: ICampusMapObject | null;
  onSelectObject: (obj: ICampusMapObject | null) => void;
  onFinishDrawingBuilding: (vertices: Coordinate[]) => void;
  onFinishClickLocation: (type: MapObjectType, location: Coordinate) => void;
  onFinishDrawingPath: (pathNodes: Coordinate[], pathType: PathType) => void;
  onUpdateLabelPosition: (obj: ICampusMapObject, newPos: Coordinate) => void;
}

// Leaflet Map Click Listener Hook
function MapEventsHandler({
  mode,
  onAddVertex,
  onSingleClick,
}: {
  mode: EditorMode;
  onAddVertex: (coord: Coordinate) => void;
  onSingleClick: (coord: Coordinate) => void;
}) {
  useMapEvents({
    click(e) {
      const coord: Coordinate = {
        latitude: Number(e.latlng.lat.toFixed(6)),
        longitude: Number(e.latlng.lng.toFixed(6)),
      };

      if (
        mode === "building" ||
        mode === "road" ||
        mode === "walkway" ||
        mode === "footpath"
      ) {
        onAddVertex(coord);
      } else if (
        mode === "marker" ||
        mode === "entrance" ||
        mode === "classroom" ||
        mode === "moveLabel"
      ) {
        onSingleClick(coord);
      }
    },
  });
  return null;
}

// Custom Leaflet Icons
const createLabelIcon = (name: string, isSelected: boolean) => {
  return L.divIcon({
    className: "building-label-divicon",
    html: `
      <div class="px-2 py-1 rounded-md text-[11px] font-black uppercase tracking-wider shadow-md transition-all border ${
        isSelected
          ? "bg-blue-600 text-white border-blue-400 ring-2 ring-blue-400/50 scale-105"
          : "bg-slate-900/90 text-white border-slate-700 backdrop-blur-sm"
      }">
        🏢 ${name}
      </div>
    `,
    iconSize: [100, 24],
    iconAnchor: [50, 12],
  });
};

const createPointIcon = (type: MapObjectType, name: string) => {
  let bg = "bg-sky-600";
  let iconText = "📍";
  if (type === "entrance") {
    bg = "bg-emerald-600";
    iconText = "🚪";
  } else if (type === "classroom") {
    bg = "bg-purple-600";
    iconText = "📌";
  }

  return L.divIcon({
    className: "campus-point-divicon",
    html: `
      <div class="flex items-center gap-1 px-2 py-0.5 rounded-full ${bg} text-white font-bold text-[11px] shadow-md border border-white">
        <span>${iconText}</span>
        <span>${name}</span>
      </div>
    `,
    iconSize: [80, 22],
    iconAnchor: [40, 11],
  });
};

const draftVertexIcon = L.divIcon({
  className: "draft-vertex-icon",
  html: `<div class="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const DEFAULT_CENTER: [number, number] = [11.1033, 77.0273];
const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export default function MapEditor({
  objects,
  selectedObject,
  onSelectObject,
  onFinishDrawingBuilding,
  onFinishClickLocation,
  onFinishDrawingPath,
  onUpdateLabelPosition,
}: MapEditorProps) {
  const [mode, setMode] = useState<EditorMode>("pan");
  const [draftPoints, setDraftPoints] = useState<Coordinate[]>([]);
  const [layers, setLayers] = useState<LayerVisibility>({
    buildings: true,
    roads: true,
    walkways: true,
    footpaths: true,
    entrances: true,
    classrooms: true,
    landmarks: true,
  });

  const handleToggleLayer = (key: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddVertex = (coord: Coordinate) => {
    setDraftPoints((prev) => [...prev, coord]);
  };

  const handleSingleClick = (coord: Coordinate) => {
    if (mode === "moveLabel" && selectedObject) {
      onUpdateLabelPosition(selectedObject, coord);
      setMode("pan");
    } else if (mode === "marker" || mode === "entrance" || mode === "classroom") {
      onFinishClickLocation(mode, coord);
      setMode("pan");
    }
  };

  const handleCompleteDraft = () => {
    if (mode === "building" && draftPoints.length >= 3) {
      onFinishDrawingBuilding(draftPoints);
      setDraftPoints([]);
      setMode("pan");
    } else if (
      (mode === "road" || mode === "walkway" || mode === "footpath") &&
      draftPoints.length >= 2
    ) {
      onFinishDrawingPath(draftPoints, mode as PathType);
      setDraftPoints([]);
      setMode("pan");
    }
  };

  const handleCancelDraft = () => {
    setDraftPoints([]);
    setMode("pan");
  };

  const isPathMode = mode === "road" || mode === "walkway" || mode === "footpath";

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col space-y-3">
      {/* Top Drawing Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 z-10">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMode("pan");
              setDraftPoints([]);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              mode === "pan"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Select / Pan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("building");
              setDraftPoints([]);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              mode === "building"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-400/40"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>🏢 Draw Building</span>
          </button>

          {/* Road / Walkway / Footpath Drawing Buttons */}
          <button
            type="button"
            onClick={() => {
              setMode("road");
              setDraftPoints([]);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              mode === "road"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-400/40 dark:bg-slate-100 dark:text-slate-900"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
            }`}
          >
            <span className="text-sm">🛣️</span>
            <span>Draw Road</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("walkway");
              setDraftPoints([]);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              mode === "walkway"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-400/40"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
            }`}
          >
            <Footprints className="w-3.5 h-3.5 text-amber-300" />
            <span>Draw Walkway</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("footpath");
              setDraftPoints([]);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              mode === "footpath"
                ? "bg-slate-700 text-white border-slate-700 shadow-sm ring-2 ring-slate-400/40"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
            }`}
          >
            <span className="text-sm">👟</span>
            <span>Draw Footpath</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("entrance");
              setDraftPoints([]);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              mode === "entrance"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-400/40"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>🚪 Entrance</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("classroom");
              setDraftPoints([]);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              mode === "classroom"
                ? "bg-purple-600 text-white border-purple-600 shadow-sm ring-2 ring-purple-400/40"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-purple-300" />
            <span>📌 Classroom</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("marker");
              setDraftPoints([]);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              mode === "marker"
                ? "bg-sky-600 text-white border-sky-600 shadow-sm ring-2 ring-sky-400/40"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>📍 Marker</span>
          </button>
        </div>
      </div>

      {/* Draft Action Banner */}
      {(mode === "building" || isPathMode || mode === "moveLabel") && (
        <div className="flex items-center justify-between p-3 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md z-10 animate-in slide-in-from-top-2">
          <span>
            {mode === "building" &&
              `🏢 Building Mode: Click map corners (${draftPoints.length} points). Need at least 3 points.`}
            {isPathMode &&
              `🛣️ ${mode.toUpperCase()} Mode: Click points along road centerline (${draftPoints.length} nodes). Need at least 2 points.`}
            {mode === "moveLabel" &&
              `🖐️ Move Label Mode: Click anywhere on the map to set new label position for ${selectedObject?.name}.`}
          </span>

          <div className="flex items-center gap-2">
            {(mode === "building" || isPathMode) && (
              <button
                type="button"
                onClick={handleCompleteDraft}
                disabled={
                  (mode === "building" && draftPoints.length < 3) ||
                  (isPathMode && draftPoints.length < 2)
                }
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 text-white font-bold disabled:opacity-40"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Finish Drawing</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCancelDraft}
              className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-slate-950"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Leaflet Map Container */}
      <div className="relative flex-1 w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={17}
          className="w-full h-full z-0"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={TILE_URL}
            maxZoom={19}
          />
          <MapEventsHandler
            mode={mode}
            onAddVertex={handleAddVertex}
            onSingleClick={handleSingleClick}
          />

          {/* 1. Render Layered Roads, Walking Paths & Footpaths */}
          {objects
            .filter((o) => o.type === "path" && o.coordinates && o.coordinates.length >= 2)
            .map((p) => {
              const pType = (p.pathType as PathType) || "walkway";
              if (pType === "road" && !layers.roads) return null;
              if (pType === "walkway" && !layers.walkways) return null;
              if (pType === "footpath" && !layers.footpaths) return null;

              const isSelected = selectedObject?._id === p._id;

              return (
                <RoadPolyline
                  key={p._id || p.name}
                  coordinates={p.coordinates!}
                  pathType={pType}
                  name={p.name}
                  isSelected={isSelected}
                  onClick={() => onSelectObject(p)}
                />
              );
            })}

          {/* 2. Render Buildings */}
          {layers.buildings &&
            objects
              .filter((o) => o.type === "building" && o.boundary && o.boundary.length >= 3)
              .map((b) => {
                const isSelected = selectedObject?._id === b._id;
                const polygonPositions: [number, number][] = b.boundary!.map((pt) => [
                  pt.latitude,
                  pt.longitude,
                ]);

                const labelPos: [number, number] = b.labelPosition
                  ? [b.labelPosition.latitude, b.labelPosition.longitude]
                  : [b.boundary![0].latitude, b.boundary![0].longitude];

                return (
                  <div key={b._id || b.name}>
                    <Polygon
                      positions={polygonPositions}
                      eventHandlers={{
                        click: () => onSelectObject(b),
                      }}
                      pathOptions={{
                        color: isSelected ? "#2563eb" : "#3b82f6",
                        fillColor: isSelected ? "#3b82f6" : "#60a5fa",
                        fillOpacity: isSelected ? 0.5 : 0.3,
                        weight: isSelected ? 3 : 2,
                      }}
                    >
                      <Tooltip permanent direction="top" opacity={0.9} className="font-bold">
                        {b.name} ({b.buildingType || "Building"})
                      </Tooltip>
                    </Polygon>

                    <Marker
                      position={labelPos}
                      icon={createLabelIcon(b.name, isSelected)}
                      eventHandlers={{
                        click: () => onSelectObject(b),
                      }}
                    />
                  </div>
                );
              })}

          {/* 3. Render Point Markers (Entrance, Classroom, Landmark) */}
          {objects
            .filter((o) => {
              if (o.type === "entrance") return layers.entrances;
              if (o.type === "classroom") return layers.classrooms;
              if (o.type === "marker") return layers.landmarks;
              return false;
            })
            .map((pt) => {
              if (!pt.location) return null;
              return (
                <Marker
                  key={pt._id || pt.name}
                  position={[pt.location.latitude, pt.location.longitude]}
                  icon={createPointIcon(pt.type, pt.name)}
                  eventHandlers={{
                    click: () => onSelectObject(pt),
                  }}
                />
              );
            })}

          {/* 4. Active Draft Vertex Markers & Preview Lines */}
          {draftPoints.length > 0 && (
            <>
              {draftPoints.map((pt, i) => (
                <Marker key={i} position={[pt.latitude, pt.longitude]} icon={draftVertexIcon} />
              ))}

              {mode === "building" && draftPoints.length >= 2 && (
                <Polygon
                  positions={draftPoints.map((pt) => [pt.latitude, pt.longitude])}
                  pathOptions={{
                    color: "#f59e0b",
                    fillColor: "#fbbf24",
                    fillOpacity: 0.2,
                    dashArray: "4, 4",
                  }}
                />
              )}

              {isPathMode && draftPoints.length >= 2 && (
                <Polyline
                  positions={draftPoints.map((pt) => [pt.latitude, pt.longitude])}
                  pathOptions={{
                    color: "#f59e0b",
                    dashArray: "4, 4",
                    weight: 6,
                  }}
                />
              )}
            </>
          )}
        </MapContainer>

        {/* Floating Layer Control Overlay */}
        <div className="absolute bottom-4 left-4 z-[400]">
          <LayerControlPanel layers={layers} onToggleLayer={handleToggleLayer} />
        </div>
      </div>
    </div>
  );
}
