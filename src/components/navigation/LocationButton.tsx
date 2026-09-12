"use client";

import { Navigation, Loader2, AlertCircle, MapPin, Building2 } from "lucide-react";

interface LocationButtonProps {
  onLocate: () => void;
  onSetDemoLocation: () => void;
  onSetAICampusLocation?: () => void;
  loading: boolean;
  error?: string | null;
  hasLocation: boolean;
  isDemoLocation?: boolean;
}

export function LocationButton({
  onLocate,
  onSetDemoLocation,
  onSetAICampusLocation,
  loading,
  error,
  hasLocation,
  isDemoLocation = false,
}: LocationButtonProps) {
  return (
    <div className="w-full space-y-2.5">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Start: SNS Main Gate (OpenStreetMap Main Gate) */}
        <button
          type="button"
          onClick={onSetDemoLocation}
          className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl font-extrabold text-xs shadow-sm transition-all border ${
            isDemoLocation
              ? "bg-blue-600 text-white border-blue-600 shadow-blue-600/20"
              : "bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800"
          }`}
          title="SNS Institutions Main Gate (OpenStreetMap Entrance)"
        >
          <MapPin className="w-4 h-4 text-sky-300" />
          <span>Start: SNS Main Gate</span>
        </button>

        {/* Start: AI Campus Entrance */}
        {onSetAICampusLocation && (
          <button
            type="button"
            onClick={onSetAICampusLocation}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl font-bold text-xs bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800 transition-all shrink-0"
            title="Start from AI Campus Block Entrance"
          >
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">AI Block Gate</span>
          </button>
        )}

        {/* Detect Device GPS Location */}
        <button
          type="button"
          onClick={onLocate}
          disabled={loading}
          className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs shadow-sm transition-all border ${
            hasLocation && !isDemoLocation
              ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/20"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
          } disabled:opacity-60 disabled:cursor-not-allowed shrink-0`}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
              <span>GPS...</span>
            </>
          ) : (
            <>
              <Navigation className={`w-3.5 h-3.5 ${hasLocation && !isDemoLocation ? "text-white" : "text-blue-500"}`} />
              <span>{hasLocation && !isDemoLocation ? "Live GPS" : "Live GPS"}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-amber-950/40 border border-amber-900/60 rounded-xl text-xs text-amber-200 space-y-1.5">
          <div className="flex items-start gap-1.5 font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
          <button
            onClick={onSetDemoLocation}
            className="text-[11px] font-bold text-sky-400 underline hover:text-sky-300 block"
          >
            👉 Click to start route directly from SNS Main Gate
          </button>
        </div>
      )}
    </div>
  );
}
