"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Coordinate } from "@/types/department";
import { MapPin, Navigation, DoorOpen, CheckCircle, Compass, Link as LinkIcon, Sparkles } from "lucide-react";

export type PickerMode = "building" | "entrance" | "classroom";

interface CoordinatePickerProps {
  buildingLocation: Coordinate;
  entranceLocation: Coordinate;
  roomLocation: Coordinate;
  onSelectCoordinate: (mode: PickerMode, coord: Coordinate) => void;
}

// Map Click Listener Component
function MapClickListener({
  activeMode,
  onSelectCoordinate,
}: {
  activeMode: PickerMode;
  onSelectCoordinate: (mode: PickerMode, coord: Coordinate) => void;
}) {
  useMapEvents({
    click(e) {
      onSelectCoordinate(activeMode, {
        latitude: Number(e.latlng.lat.toFixed(6)),
        longitude: Number(e.latlng.lng.toFixed(6)),
      });
    },
  });
  return null;
}

const buildingIcon = L.divIcon({
  className: "picker-building-icon",
  html: `<div class="w-6 h-6 rounded-full bg-slate-900 border-2 border-white text-white flex items-center justify-center font-bold text-xs shadow-md">B</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const entranceIcon = L.divIcon({
  className: "picker-entrance-icon",
  html: `<div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center font-bold text-xs shadow-md">E</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const classroomIcon = L.divIcon({
  className: "picker-classroom-icon",
  html: `<div class="w-6 h-6 rounded-full bg-purple-600 border-2 border-white text-white flex items-center justify-center font-bold text-xs shadow-md">R</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export default function CoordinatePicker({
  buildingLocation,
  entranceLocation,
  roomLocation,
  onSelectCoordinate,
}: CoordinatePickerProps) {
  const [activeMode, setActiveMode] = useState<PickerMode>("building");
  const [gmapsInput, setGmapsInput] = useState<string>("");
  const [parseStatus, setParseStatus] = useState<string | null>(null);

  // Helper to extract Lat/Long from Google Maps URL or "11.0805, 76.9959" text
  const parseGoogleMapsInput = (input: string) => {
    setGmapsInput(input);
    if (!input.trim()) {
      setParseStatus(null);
      return;
    }

    // Pattern 1: "11.080501, 76.995912" or "11.080501,76.995912"
    const simpleMatch = input.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    
    // Pattern 2: Google maps URL format like @11.080501,76.995912,17z or ?q=11.080501,76.995912
    const urlMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || input.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);

    const match = simpleMatch || urlMatch;

    if (match && match[1] && match[2]) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);

      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        onSelectCoordinate(activeMode, {
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
        });
        setParseStatus(`✓ Extracted: Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)} for ${activeMode.toUpperCase()}`);
        return;
      }
    }
    setParseStatus("⚠️ Could not parse valid Lat, Long from input. Example format: 11.101925, 77.025604");
  };

  // Determine center position
  const centerLat = buildingLocation.latitude || 11.101925;
  const centerLng = buildingLocation.longitude || 77.025604;

  return (
    <div className="space-y-4">
      {/* Picker Mode Selector Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveMode("building")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
            activeMode === "building"
              ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-400/40 dark:bg-slate-100 dark:text-slate-900"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
          <span>Building Location</span>
          {activeMode === "building" && <CheckCircle className="w-3 h-3 text-sky-400 ml-1" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveMode("entrance")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
            activeMode === "entrance"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>Entrance Location</span>
          {activeMode === "entrance" && <CheckCircle className="w-3 h-3 text-emerald-200 ml-1" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveMode("classroom")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
            activeMode === "classroom"
              ? "bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-400/40"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <Navigation className="w-3.5 h-3.5 text-purple-300" />
          <span>Classroom Location</span>
          {activeMode === "classroom" && <CheckCircle className="w-3 h-3 text-purple-200 ml-1" />}
        </button>
      </div>

      {/* Google Maps Quick Lat/Long Link Parser Box */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/50 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Paste Google Maps Lat/Long or Link for <span className="underline capitalize">{activeMode}</span>:</span>
          </label>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Auto-Extracts Coordinates</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={gmapsInput}
            onChange={(e) => parseGoogleMapsInput(e.target.value)}
            placeholder="e.g. 11.101925, 77.025604  OR  https://maps.google.com/?q=11.101925,77.025604"
            className="flex-1 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {parseStatus && (
          <p className={`text-[11px] font-medium ${parseStatus.startsWith("✓") ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
            {parseStatus}
          </p>
        )}
      </div>

      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
        <span>
          👉 <strong>Click anywhere on the map below</strong> or edit numerical inputs below to set coordinates for:{" "}
          <span className="font-bold underline capitalize">{activeMode} Location</span>.
        </span>
      </div>

      {/* Leaflet Picker Map */}
      <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={17}
          className="w-full h-full"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={TILE_URL}
          />
          <MapClickListener activeMode={activeMode} onSelectCoordinate={onSelectCoordinate} />

          {/* Building Pin */}
          {buildingLocation.latitude && buildingLocation.longitude && (
            <Marker
              position={[buildingLocation.latitude, buildingLocation.longitude]}
              icon={buildingIcon}
            >
              <Popup className="text-xs">Building Center</Popup>
            </Marker>
          )}

          {/* Entrance Pin */}
          {entranceLocation.latitude && entranceLocation.longitude && (
            <Marker
              position={[entranceLocation.latitude, entranceLocation.longitude]}
              icon={entranceIcon}
            >
              <Popup className="text-xs">Building Entrance (GPS Endpoint)</Popup>
            </Marker>
          )}

          {/* Classroom Pin */}
          {roomLocation.latitude && roomLocation.longitude && (
            <Marker
              position={[roomLocation.latitude, roomLocation.longitude]}
              icon={classroomIcon}
            >
              <Popup className="text-xs">Approximate Classroom Visual Pin</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Editable Numerical Coordinates Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Building Center Numerical Inputs */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-white inline-block"></span>
            <span>1. Building Location</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Latitude</label>
              <input
                type="number"
                step="any"
                value={buildingLocation.latitude || ""}
                onChange={(e) =>
                  onSelectCoordinate("building", {
                    latitude: parseFloat(e.target.value) || 0,
                    longitude: buildingLocation.longitude,
                  })
                }
                className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Longitude</label>
              <input
                type="number"
                step="any"
                value={buildingLocation.longitude || ""}
                onChange={(e) =>
                  onSelectCoordinate("building", {
                    latitude: buildingLocation.latitude,
                    longitude: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Entrance Location Numerical Inputs */}
        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 space-y-2">
          <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            <span>2. Building Entrance</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Latitude</label>
              <input
                type="number"
                step="any"
                value={entranceLocation.latitude || ""}
                onChange={(e) =>
                  onSelectCoordinate("entrance", {
                    latitude: parseFloat(e.target.value) || 0,
                    longitude: entranceLocation.longitude,
                  })
                }
                className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Longitude</label>
              <input
                type="number"
                step="any"
                value={entranceLocation.longitude || ""}
                onChange={(e) =>
                  onSelectCoordinate("entrance", {
                    latitude: entranceLocation.latitude,
                    longitude: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Classroom Reference Numerical Inputs */}
        <div className="p-4 bg-purple-50/50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-900/60 space-y-2">
          <div className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
            <span>3. Classroom Reference</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Latitude</label>
              <input
                type="number"
                step="any"
                value={roomLocation.latitude || ""}
                onChange={(e) =>
                  onSelectCoordinate("classroom", {
                    latitude: parseFloat(e.target.value) || 0,
                    longitude: roomLocation.longitude,
                  })
                }
                className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Longitude</label>
              <input
                type="number"
                step="any"
                value={roomLocation.longitude || ""}
                onChange={(e) =>
                  onSelectCoordinate("classroom", {
                    latitude: roomLocation.latitude,
                    longitude: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
