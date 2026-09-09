"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { IDepartment } from "@/types/department";

interface DestinationMarkerProps {
  department: IDepartment;
  showClassroomPin?: boolean;
}

// Icon for Building location
const createBuildingIcon = (shortName: string) => {
  return L.divIcon({
    className: "building-marker",
    html: `
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-white font-bold text-xs shadow-lg border border-slate-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-sky-400"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
        <span>${shortName}</span>
      </div>
    `,
    iconSize: [80, 28],
    iconAnchor: [40, 14],
  });
};

// Icon for Outdoor Entrance
const createEntranceIcon = () => {
  return L.divIcon({
    className: "entrance-marker",
    html: `
      <div class="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white shadow-lg border-2 border-white ring-2 ring-emerald-400/40">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Icon for Classroom approximate visual pin
const createClassroomIcon = (roomNumber: string) => {
  return L.divIcon({
    className: "classroom-marker",
    html: `
      <div class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-700 text-white font-semibold text-[11px] shadow-md border border-purple-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        <span>${roomNumber}</span>
      </div>
    `,
    iconSize: [70, 24],
    iconAnchor: [35, 12],
  });
};

export function DestinationMarker({ department, showClassroomPin = true }: DestinationMarkerProps) {
  const buildingIcon = createBuildingIcon(department.shortName);
  const entranceIcon = createEntranceIcon();
  const classroomIcon = createClassroomIcon(department.roomNumber);

  return (
    <>
      {/* Building Marker */}
      <Marker
        position={[department.location.latitude, department.location.longitude]}
        icon={buildingIcon}
      >
        <Popup className="text-xs">
          <div className="font-bold text-slate-900">{department.name}</div>
          <div className="text-slate-600">{department.buildingName}</div>
          <div className="mt-1 font-medium text-sky-700">
            {department.floor} • {department.roomNumber}
          </div>
        </Popup>
      </Marker>

      {/* Building Entrance Marker (GPS Endpoint) */}
      <Marker
        position={[department.entranceLocation.latitude, department.entranceLocation.longitude]}
        icon={entranceIcon}
      >
        <Popup className="text-xs">
          <div className="font-bold text-emerald-800">Building Entrance</div>
          <div className="text-slate-600">Outdoor GPS navigation endpoint for {department.shortName}</div>
        </Popup>
      </Marker>

      {/* Classroom Marker (Approximate visual reference only) */}
      {showClassroomPin && department.roomLocation && (
        <Marker
          position={[department.roomLocation.latitude, department.roomLocation.longitude]}
          icon={classroomIcon}
        >
          <Popup className="text-xs">
            <div className="font-bold text-purple-900">{department.roomNumber}</div>
            <div className="text-purple-700 font-medium">(Approximate Visual Reference)</div>
            <div className="text-slate-500 text-[11px] mt-0.5">
              GPS ends at building entrance. Follow indoor directions to reach room.
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}
