"use client";

import { useState, useEffect } from "react";
import { ICampusMapObject, MapObjectType, BuildingType, MarkerCategory, PathType } from "@/types/map";
import { Coordinate } from "@/types/department";
import { X, Save, Building, MapPin, DoorOpen, Navigation, Footprints } from "lucide-react";

interface ObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ICampusMapObject>) => void;
  type: MapObjectType;
  initialData?: ICampusMapObject | null;
  drawnBoundary?: Coordinate[];
  drawnPathCoordinates?: Coordinate[];
  clickedLocation?: Coordinate | null;
  existingBuildings?: ICampusMapObject[];
  initialPathType?: PathType;
}

export function ObjectModal({
  isOpen,
  onClose,
  onSave,
  type,
  initialData,
  drawnBoundary,
  drawnPathCoordinates,
  clickedLocation,
  existingBuildings = [],
  initialPathType = "road",
}: ObjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [buildingType, setBuildingType] = useState<BuildingType>("Academic");
  const [floorCount, setFloorCount] = useState<number>(3);
  const [category, setCategory] = useState<MarkerCategory>("Main Gate");
  const [pathType, setPathType] = useState<PathType>(initialPathType);
  const [floor, setFloor] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [buildingId, setBuildingId] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setBuildingType((initialData.buildingType as BuildingType) || "Academic");
      setFloorCount(initialData.floorCount || 1);
      setCategory((initialData.category as MarkerCategory) || "Main Gate");
      setPathType((initialData.pathType as PathType) || "road");
      setFloor(initialData.floor || "");
      setRoomNumber(initialData.roomNumber || "");
      setBuildingId(initialData.buildingId || "");
    } else {
      setName("");
      setDescription("");
      setBuildingType("Academic");
      setFloorCount(3);
      setCategory(
        type === "entrance"
          ? "Building Entrance"
          : type === "classroom"
          ? "Classroom"
          : "Main Gate"
      );
      setPathType(initialPathType);
      setFloor(type === "classroom" ? "2nd Floor" : "");
      setRoomNumber(type === "classroom" ? "Room 204" : "");
      setBuildingId("");
    }
  }, [initialData, type, isOpen, initialPathType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<ICampusMapObject> = {
      type,
      name,
      description,
      isActive: true,
    };

    if (type === "building") {
      payload.buildingType = buildingType;
      payload.floorCount = Number(floorCount);
      if (drawnBoundary && drawnBoundary.length > 0) {
        payload.boundary = drawnBoundary;
        if (!payload.labelPosition) {
          const avgLat =
            drawnBoundary.reduce((acc, curr) => acc + curr.latitude, 0) / drawnBoundary.length;
          const avgLng =
            drawnBoundary.reduce((acc, curr) => acc + curr.longitude, 0) / drawnBoundary.length;
          payload.labelPosition = {
            latitude: Number(avgLat.toFixed(6)),
            longitude: Number(avgLng.toFixed(6)),
          };
        }
      }
    } else if (type === "marker" || type === "entrance" || type === "classroom") {
      payload.category = category;
      payload.floor = floor;
      payload.roomNumber = roomNumber;
      payload.buildingId = buildingId || undefined;
      if (clickedLocation) {
        payload.location = clickedLocation;
      }
    } else if (type === "path") {
      payload.pathType = pathType;
      if (drawnPathCoordinates && drawnPathCoordinates.length > 0) {
        payload.coordinates = drawnPathCoordinates;
      }
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {type === "building" && <Building className="w-5 h-5" />}
              {type === "marker" && <MapPin className="w-5 h-5" />}
              {type === "entrance" && <DoorOpen className="w-5 h-5 text-emerald-300" />}
              {type === "classroom" && <Navigation className="w-5 h-5 text-purple-300" />}
              {type === "path" && <Footprints className="w-5 h-5 text-amber-300" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white capitalize">
                {initialData ? `Edit ${type}` : `Configure New ${type}`}
              </h3>
              <p className="text-xs text-slate-500">
                {type === "building" && "Polygon boundary captured from map clicks."}
                {type === "marker" && "Point marker location captured from map click."}
                {type === "entrance" && "Outdoor walking endpoint for building entrance."}
                {type === "classroom" && "Approximate indoor classroom reference pin."}
                {type === "path" && "Campus road/path coordinates captured from map clicks."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Path Type Radio Selector (If path) */}
          {type === "path" && (
            <div className="space-y-2 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/50">
              <label className="font-extrabold text-amber-900 dark:text-amber-200 block">
                Path / Road Type *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPathType("road")}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    pathType === "road"
                      ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-400/40 dark:bg-slate-100 dark:text-slate-900"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-sm">🛣️</div>
                  <div>Campus Road</div>
                  <div className="text-[10px] font-normal text-slate-400">Wide + Centerline</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPathType("walkway")}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    pathType === "walkway"
                      ? "bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400/40"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-sm">🚶</div>
                  <div>Walking Path</div>
                  <div className="text-[10px] font-normal opacity-80">Medium Walkway</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPathType("footpath")}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    pathType === "footpath"
                      ? "bg-slate-700 text-white border-slate-700 shadow-md ring-2 ring-slate-400/40"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-sm">👟</div>
                  <div>Footpath</div>
                  <div className="text-[10px] font-normal opacity-80">Dashed Sidewalk</div>
                </button>
              </div>
            </div>
          )}

          {/* Object Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              {type === "building"
                ? "Building Name *"
                : type === "path"
                ? "Road / Path Name *"
                : "Location / Marker Name *"}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                type === "building"
                  ? "e.g. CSE Block"
                  : type === "path"
                  ? "e.g. Main Campus Road"
                  : "e.g. CSE Main Entrance or Room 204"
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Building specific fields */}
          {type === "building" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Building Type
                </label>
                <select
                  value={buildingType}
                  onChange={(e) => setBuildingType(e.target.value as BuildingType)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white"
                >
                  <option value="Academic">Academic</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Amenities">Amenities</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Number of Floors
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={floorCount}
                  onChange={(e) => setFloorCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Marker Category / Options */}
          {(type === "marker" || type === "entrance" || type === "classroom") && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Category / Type
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MarkerCategory)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white"
                >
                  <option value="Main Gate">Main Gate</option>
                  <option value="Gate">Gate</option>
                  <option value="Building Entrance">Building Entrance</option>
                  <option value="Staircase">Staircase</option>
                  <option value="Lift">Lift</option>
                  <option value="Classroom">Classroom</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Library">Library</option>
                  <option value="Canteen">Canteen</option>
                  <option value="Parking">Parking</option>
                  <option value="Restroom">Restroom</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {existingBuildings.length > 0 && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Associated Building
                  </label>
                  <select
                    value={buildingId}
                    onChange={(e) => setBuildingId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white"
                  >
                    <option value="">None (Independent Campus Landmark)</option>
                    {existingBuildings.map((b) => (
                      <option key={b._id} value={b._id}>
                        🏢 {b.name} ({b.buildingType || "Building"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Floor</label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="e.g. 2nd Floor"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Room 204"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes or details..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save {type}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
