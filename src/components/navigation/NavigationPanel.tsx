"use client";

import { IDepartment } from "@/types/department";
import { RouteInfo } from "@/types/navigation";
import { MapPin, Footprints, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

interface NavigationPanelProps {
  department: IDepartment;
  routeData?: RouteInfo | null;
  loadingRoute?: boolean;
  hasUserLocation?: boolean;
  onRequestLocation?: () => void;
}

export function NavigationPanel({
  department,
  routeData,
  loadingRoute,
  hasUserLocation,
  onRequestLocation,
}: NavigationPanelProps) {
  // Format distance
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters} m`;
  };

  // Format duration in minutes
  const formatDuration = (seconds: number) => {
    const mins = Math.max(1, Math.round(seconds / 60));
    return `${mins} min walk`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-extrabold text-xs shadow-sm">
              {department.shortName}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {department.floor} • {department.roomNumber}
            </span>
          </div>
          <h2 className="mt-2 text-base font-extrabold text-slate-900 dark:text-white">
            {department.name}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>{department.buildingName}</span>
          </div>
        </div>

        {/* Classroom Door Photo Preview */}
        {department.images && department.images.length > 0 && (
          <div className="relative w-20 h-28 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-md shrink-0">
            <img
              src={department.images[0]}
              alt={`Classroom ${department.roomNumber}`}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-xs text-[9px] font-bold text-white text-center py-0.5 rounded">
              {department.roomNumber}
            </span>
          </div>
        )}
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* GPS Walking Route Stats */}
      {hasUserLocation ? (
        loadingRoute ? (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl text-center text-xs text-slate-500 animate-pulse">
            Calculating outdoor walking path...
          </div>
        ) : routeData ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Footprints className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 tracking-wider">
                    Distance
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatDistance(routeData.distanceMeters)}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-sky-50/80 dark:bg-sky-950/40 rounded-xl border border-sky-100 dark:border-sky-900/50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-300 tracking-wider">
                    Est. Walk Time
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatDuration(routeData.durationSeconds)}
                  </div>
                </div>
              </div>
            </div>

            {routeData.isFallback && (
              <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/50 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Direct straight-line distance displayed.</span>
              </div>
            )}
          </div>
        ) : null
      ) : (
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Click <strong>Locate Me</strong> to calculate your outdoor walking distance & path.
          </p>
          {onRequestLocation && (
            <button
              type="button"
              onClick={onRequestLocation}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline"
            >
              Enable GPS Location
            </button>
          )}
        </div>
      )}

      {/* GPS Limitation Notice Banner */}
      <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-2 border border-slate-200 dark:border-slate-700">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 dark:text-white">Outdoor GPS Navigation:</strong> GPS routes bring you to the <strong>Building Entrance</strong>. Scroll down for step-by-step indoor directions to the classroom.
        </div>
      </div>
    </div>
  );
}
