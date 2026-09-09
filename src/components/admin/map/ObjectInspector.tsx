"use client";

import { useState } from "react";
import { ICampusMapObject, MapObjectType } from "@/types/map";
import {
  Building2,
  MapPin,
  DoorOpen,
  Navigation,
  Footprints,
  Edit,
  Trash2,
  Move,
  Search,
  ChevronRight,
  Layers,
} from "lucide-react";

interface ObjectInspectorProps {
  objects: ICampusMapObject[];
  selectedObject: ICampusMapObject | null;
  onSelectObject: (obj: ICampusMapObject | null) => void;
  onEditObject: (obj: ICampusMapObject) => void;
  onDeleteObject: (obj: ICampusMapObject) => void;
  onStartMoveLabel?: (obj: ICampusMapObject) => void;
  onEditGeometry?: (obj: ICampusMapObject) => void;
}

export function ObjectInspector({
  objects,
  selectedObject,
  onSelectObject,
  onEditObject,
  onDeleteObject,
  onStartMoveLabel,
  onEditGeometry,
}: ObjectInspectorProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredObjects = objects.filter((obj) => {
    const matchesType =
      filterType === "all" ||
      obj.type === filterType ||
      (filterType === "path" && obj.type === "path");
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      obj.name.toLowerCase().includes(q) ||
      (obj.buildingType && obj.buildingType.toLowerCase().includes(q)) ||
      (obj.category && obj.category.toLowerCase().includes(q)) ||
      (obj.pathType && obj.pathType.toLowerCase().includes(q)) ||
      (obj.roomNumber && obj.roomNumber.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  const getIcon = (type: MapObjectType, pathType?: string) => {
    switch (type) {
      case "building":
        return <Building2 className="w-4 h-4 text-blue-500" />;
      case "entrance":
        return <DoorOpen className="w-4 h-4 text-emerald-500" />;
      case "classroom":
        return <Navigation className="w-4 h-4 text-purple-500" />;
      case "path":
        if (pathType === "road") return <span className="text-sm">🛣️</span>;
        if (pathType === "footpath") return <span className="text-sm">👟</span>;
        return <Footprints className="w-4 h-4 text-amber-500" />;
      default:
        return <MapPin className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Campus Objects ({objects.length})
          </h2>
        </div>
      </div>

      {/* Selected Object Detail Banner */}
      {selectedObject && (
        <div className="p-4 bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getIcon(selectedObject.type, selectedObject.pathType)}
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 tracking-wider">
                  Selected {selectedObject.type}
                </span>
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {selectedObject.name}
                </h3>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            {selectedObject.type === "building" && (
              <div>
                {selectedObject.buildingType} • {selectedObject.floorCount || 1} Floors
              </div>
            )}
            {selectedObject.type === "path" && (
              <div className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                Path Type: {selectedObject.pathType || "walkway"}
              </div>
            )}
            {selectedObject.category && <div>Category: {selectedObject.category}</div>}
            {selectedObject.roomNumber && (
              <div>
                {selectedObject.floor} • {selectedObject.roomNumber}
              </div>
            )}
            {selectedObject.description && (
              <p className="text-slate-500 line-clamp-2">{selectedObject.description}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5 pt-1 flex-wrap">
            <button
              onClick={() => onEditObject(selectedObject)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>

            {selectedObject.type === "building" && onStartMoveLabel && (
              <button
                onClick={() => onStartMoveLabel(selectedObject)}
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs shadow-sm hover:opacity-90"
                title="Reposition Building Label"
              >
                <Move className="w-3.5 h-3.5" />
                <span>Move Label</span>
              </button>
            )}

            {(selectedObject.type === "building" || selectedObject.type === "path") &&
              onEditGeometry && (
                <button
                  onClick={() => onEditGeometry(selectedObject)}
                  className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm"
                  title="Redraw / Edit Geometry Points"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Geometry</span>
                </button>
              )}

            <button
              onClick={() => onDeleteObject(selectedObject)}
              className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300 transition-colors"
              title="Delete Object"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter campus objects..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          {["all", "building", "path", "entrance", "classroom", "marker"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all whitespace-nowrap ${
                filterType === t
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {t === "path" ? "Roads/Paths" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Object List */}
      <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2 pr-1">
        {filteredObjects.map((obj) => (
          <div
            key={obj._id || obj.name}
            onClick={() => onSelectObject(obj)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
              selectedObject?._id === obj._id
                ? "bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 shadow-xs"
                : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {getIcon(obj.type, obj.pathType)}
              <div className="truncate">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {obj.name}
                </h4>
                <div className="text-[10px] text-slate-500 capitalize truncate">
                  {obj.type} {obj.pathType ? `(${obj.pathType})` : ""} {obj.buildingType ? `• ${obj.buildingType}` : ""}{" "}
                  {obj.roomNumber ? `• ${obj.roomNumber}` : ""}
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        ))}

        {filteredObjects.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            No campus objects found. Click a drawing tool above to add buildings, roads, or markers.
          </div>
        )}
      </div>
    </div>
  );
}
