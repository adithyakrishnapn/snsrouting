"use client";

import { Layers } from "lucide-react";

export interface LayerVisibility {
  buildings: boolean;
  roads: boolean;
  walkways: boolean;
  footpaths: boolean;
  entrances: boolean;
  classrooms: boolean;
  landmarks: boolean;
}

interface LayerControlPanelProps {
  layers: LayerVisibility;
  onToggleLayer: (layerKey: keyof LayerVisibility) => void;
}

export function LayerControlPanel({ layers, onToggleLayer }: LayerControlPanelProps) {
  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 max-w-xl">
      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
        <Layers className="w-3.5 h-3.5 text-blue-600" />
        <span>Map Layer Controls</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600">
          <input
            type="checkbox"
            checked={layers.buildings}
            onChange={() => onToggleLayer("buildings")}
            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>🏢 Buildings</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600">
          <input
            type="checkbox"
            checked={layers.roads}
            onChange={() => onToggleLayer("roads")}
            className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
          />
          <span>🛣️ Campus Roads</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600">
          <input
            type="checkbox"
            checked={layers.walkways}
            onChange={() => onToggleLayer("walkways")}
            className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          <span>🚶 Walking Paths</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600">
          <input
            type="checkbox"
            checked={layers.footpaths}
            onChange={() => onToggleLayer("footpaths")}
            className="w-3.5 h-3.5 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
          />
          <span>👟 Footpaths</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600">
          <input
            type="checkbox"
            checked={layers.entrances}
            onChange={() => onToggleLayer("entrances")}
            className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>🚪 Entrances</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600">
          <input
            type="checkbox"
            checked={layers.classrooms}
            onChange={() => onToggleLayer("classrooms")}
            className="w-3.5 h-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
          />
          <span>📌 Classrooms</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600">
          <input
            type="checkbox"
            checked={layers.landmarks}
            onChange={() => onToggleLayer("landmarks")}
            className="w-3.5 h-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span>📍 Markers</span>
        </label>
      </div>
    </div>
  );
}
