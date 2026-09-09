"use client";

import { Navigation, Loader2, AlertCircle, MapPin, Building } from "lucide-react";

interface LocationButtonProps {
  onLocate: () => void;
  onSetDemoLocation: () => void;
  loading: boolean;
  error?: string | null;
  hasLocation: boolean;
  isDemoLocation?: boolean;
}

export function LocationButton({
  onLocate,
  onSetDemoLocation,
  loading,
  error,
  hasLocation,
  isDemoLocation = false,
}: LocationButtonProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* GPS Locate Me Button */}
        <button
          type="button"
          onClick={onLocate}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all ${
            hasLocation && !isDemoLocation
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Fetching GPS...</span>
            </>
          ) : (
            <>
              <Navigation className={`w-3.5 h-3.5 ${hasLocation && !isDemoLocation ? "text-white fill-white" : ""}`} />
              <span>{hasLocation && !isDemoLocation ? "My GPS Active" : "Detect My Location"}</span>
            </>
          )}
        </button>

        {/* Use SNS Main Campus Gate (Demo) Button */}
        <button
          type="button"
          onClick={onSetDemoLocation}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all border ${
            isDemoLocation
              ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-600 shadow-amber-600/20"
              : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
          title="Set starting point to SNS Main Entrance Gate for campus navigation demo"
        >
          <Building className={`w-3.5 h-3.5 ${isDemoLocation ? "text-white" : "text-amber-500"}`} />
          <span>{isDemoLocation ? "✓ At SNS Main Gate" : "Use SNS Campus Gate"}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
          <div className="flex items-start gap-1.5 font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
          {!isDemoLocation && (
            <button
              onClick={onSetDemoLocation}
              className="text-[11px] font-bold text-amber-800 dark:text-amber-300 underline hover:opacity-80 block"
            >
              👉 Click to set starting location to SNS Campus Main Gate
            </button>
          )}
        </div>
      )}
    </div>
  );
}
