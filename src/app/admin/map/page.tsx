"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ICampusMapObject, MapObjectType, PathType } from "@/types/map";
import { Coordinate } from "@/types/department";
import { ObjectInspector } from "@/components/admin/map/ObjectInspector";
import { ObjectModal } from "@/components/admin/map/ObjectModal";
import { ArrowLeft, Home, RefreshCw, Sparkles, MapPin, Database } from "lucide-react";

// Dynamically import MapEditor with ssr: false
const MapEditor = dynamic(() => import("@/components/admin/map/MapEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center text-xs font-semibold text-slate-500 animate-pulse">
      Loading Interactive Campus Map Editor...
    </div>
  ),
});

export default function AdminMapPage() {
  const [objects, setObjects] = useState<ICampusMapObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObject, setSelectedObject] = useState<ICampusMapObject | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<MapObjectType>("building");
  const [initialPathType, setInitialPathType] = useState<PathType>("road");
  const [editingObject, setEditingObject] = useState<ICampusMapObject | null>(null);
  const [drawnBoundary, setDrawnBoundary] = useState<Coordinate[]>([]);
  const [drawnPathCoordinates, setDrawnPathCoordinates] = useState<Coordinate[]>([]);
  const [clickedLocation, setClickedLocation] = useState<Coordinate | null>(null);

  // Fetch campus map objects from API
  const fetchObjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/map?all=true");
      const json = await res.json();
      if (json.success && json.data) {
        setObjects(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch campus map objects:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchObjects();
  }, [fetchObjects]);

  // Handle finish drawing building polygon
  const handleFinishDrawingBuilding = (vertices: Coordinate[]) => {
    setEditingObject(null);
    setDrawnBoundary(vertices);
    setModalType("building");
    setIsModalOpen(true);
  };

  // Handle click to place point marker / entrance / classroom
  const handleFinishClickLocation = (type: MapObjectType, location: Coordinate) => {
    setEditingObject(null);
    setClickedLocation(location);
    setModalType(type);
    setIsModalOpen(true);
  };

  // Handle finish drawing path
  const handleFinishDrawingPath = (pathNodes: Coordinate[], pathType: PathType) => {
    setEditingObject(null);
    setDrawnPathCoordinates(pathNodes);
    setInitialPathType(pathType);
    setModalType("path");
    setIsModalOpen(true);
  };

  // Save Modal handler
  const handleSaveModal = async (data: Partial<ICampusMapObject>) => {
    try {
      const isEdit = !!editingObject;
      const url = isEdit ? `/api/map/${editingObject._id}` : "/api/map";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsModalOpen(false);
        setEditingObject(null);
        setDrawnBoundary([]);
        setDrawnPathCoordinates([]);
        setClickedLocation(null);
        await fetchObjects();
      } else {
        alert(json.error || "Failed to save campus map object.");
      }
    } catch (e) {
      alert("Error saving campus map object.");
    }
  };

  // Delete handler
  const handleDeleteObject = async (obj: ICampusMapObject) => {
    if (!confirm(`Are you sure you want to delete ${obj.name}?`)) return;
    try {
      const res = await fetch(`/api/map/${obj._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        if (selectedObject?._id === obj._id) {
          setSelectedObject(null);
        }
        await fetchObjects();
      } else {
        alert(json.error || "Failed to delete object.");
      }
    } catch (e) {
      alert("Error deleting object.");
    }
  };

  // Edit object handler
  const handleEditObject = (obj: ICampusMapObject) => {
    setEditingObject(obj);
    setModalType(obj.type);
    if (obj.pathType) setInitialPathType(obj.pathType as PathType);
    if (obj.boundary) setDrawnBoundary(obj.boundary);
    if (obj.coordinates) setDrawnPathCoordinates(obj.coordinates);
    if (obj.location) setClickedLocation(obj.location);
    setIsModalOpen(true);
  };

  // Move Label position handler
  const handleUpdateLabelPosition = async (obj: ICampusMapObject, newPos: Coordinate) => {
    try {
      const res = await fetch(`/api/map/${obj._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelPosition: newPos }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchObjects();
      }
    } catch (e) {
      console.error("Failed to update label position:", e);
    }
  };

  const existingBuildings = objects.filter((o) => o.type === "building");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-4 md:p-6 lg:p-8 space-y-6">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Campus Map Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            Interactive Campus Map Editor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Draw building boundaries (polygons), campus roads, walking paths, footpaths, entrances, and classrooms directly on the map.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/departments"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Departments</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
          >
            <Home className="w-3.5 h-3.5 text-emerald-600" />
            <span>Student Map</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Left Inspector / Right Map Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Object Inspector Sidebar (Lg: 4 cols) */}
        <div className="lg:col-span-4 h-[550px] lg:h-[700px] order-2 lg:order-1">
          <ObjectInspector
            objects={objects}
            selectedObject={selectedObject}
            onSelectObject={setSelectedObject}
            onEditObject={handleEditObject}
            onDeleteObject={handleDeleteObject}
            onStartMoveLabel={() => alert("Click anywhere on the map to place the building label.")}
            onEditGeometry={(obj) => handleEditObject(obj)}
          />
        </div>

        {/* Right Column: Map Editor Canvas (Lg: 8 cols) */}
        <div className="lg:col-span-8 h-[550px] lg:h-[700px] order-1 lg:order-2">
          <MapEditor
            objects={objects}
            selectedObject={selectedObject}
            onSelectObject={setSelectedObject}
            onFinishDrawingBuilding={handleFinishDrawingBuilding}
            onFinishClickLocation={handleFinishClickLocation}
            onFinishDrawingPath={handleFinishDrawingPath}
            onUpdateLabelPosition={handleUpdateLabelPosition}
          />
        </div>
      </div>

      {/* Object Configuration Modal */}
      <ObjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        type={modalType}
        initialData={editingObject}
        drawnBoundary={drawnBoundary}
        drawnPathCoordinates={drawnPathCoordinates}
        clickedLocation={clickedLocation}
        existingBuildings={existingBuildings}
        initialPathType={initialPathType}
      />
    </div>
  );
}
