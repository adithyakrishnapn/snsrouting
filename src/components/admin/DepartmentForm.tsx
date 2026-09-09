"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { IDepartment, InstructionStep, Coordinate } from "@/types/department";
import { ICampusMapObject } from "@/types/map";
import { PickerMode } from "@/components/map/CoordinatePicker";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  ArrowLeft,
  Loader2,
  Upload,
  MapPin,
  Building2,
  DoorOpen,
  Navigation,
} from "lucide-react";
import Link from "next/link";

const CoordinatePicker = dynamic(() => import("@/components/map/CoordinatePicker"), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-xs text-slate-500 animate-pulse font-semibold">
      Loading Leaflet Coordinate Picker...
    </div>
  ),
});

interface DepartmentFormProps {
  initialData?: IDepartment;
  isEditing?: boolean;
}

export function DepartmentForm({ initialData, isEditing = false }: DepartmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapObjects, setMapObjects] = useState<ICampusMapObject[]>([]);

  // Form Fields
  const [name, setName] = useState(initialData?.name || "");
  const [shortName, setShortName] = useState(initialData?.shortName || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [buildingName, setBuildingName] = useState(initialData?.buildingName || "");
  const [floor, setFloor] = useState(initialData?.floor || "");
  const [roomNumber, setRoomNumber] = useState(initialData?.roomNumber || "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  // Linked Map Objects
  const [buildingId, setBuildingId] = useState<string>(initialData?.buildingId || "");
  const [entranceId, setEntranceId] = useState<string>(initialData?.entranceId || "");
  const [classroomId, setClassroomId] = useState<string>(initialData?.classroomId || "");

  // Coordinates
  const [buildingLocation, setBuildingLocation] = useState<Coordinate>(
    initialData?.location || { latitude: 11.101925, longitude: 77.025604 }
  );
  const [entranceLocation, setEntranceLocation] = useState<Coordinate>(
    initialData?.entranceLocation || { latitude: 11.1021, longitude: 77.02545 }
  );
  const [roomLocation, setRoomLocation] = useState<Coordinate>(
    initialData?.roomLocation || { latitude: 11.10195, longitude: 77.0257 }
  );

  // Instructions
  const [instructions, setInstructions] = useState<InstructionStep[]>(
    initialData?.instructions && initialData.instructions.length > 0
      ? initialData.instructions
      : [
          { stepNumber: 1, text: "Enter through main building entrance." },
          { stepNumber: 2, text: "Take stairwell/elevator to assigned floor." },
        ]
  );

  // Fetch map objects for linking dropdowns
  useEffect(() => {
    async function fetchMapObjects() {
      try {
        const res = await fetch("/api/map?all=true");
        const data = await res.json();
        if (data.success && data.data) {
          setMapObjects(data.data);
        }
      } catch (e) {
        console.error("Failed to fetch map objects for department linking:", e);
      }
    }
    fetchMapObjects();
  }, []);

  // Handle building link selection
  const handleSelectBuildingObject = (bId: string) => {
    setBuildingId(bId);
    if (!bId) return;
    const bObj = mapObjects.find((o) => o._id === bId);
    if (bObj) {
      if (bObj.name) setBuildingName(bObj.name);
      if (bObj.labelPosition) {
        setBuildingLocation(bObj.labelPosition);
      } else if (bObj.boundary && bObj.boundary.length > 0) {
        setBuildingLocation(bObj.boundary[0]);
      }
    }
  };

  // Handle entrance link selection
  const handleSelectEntranceObject = (eId: string) => {
    setEntranceId(eId);
    if (!eId) return;
    const eObj = mapObjects.find((o) => o._id === eId);
    if (eObj && eObj.location) {
      setEntranceLocation(eObj.location);
    }
  };

  // Handle classroom link selection
  const handleSelectClassroomObject = (cId: string) => {
    setClassroomId(cId);
    if (!cId) return;
    const cObj = mapObjects.find((o) => o._id === cId);
    if (cObj) {
      if (cObj.location) setRoomLocation(cObj.location);
      if (cObj.floor) setFloor(cObj.floor);
      if (cObj.roomNumber) setRoomNumber(cObj.roomNumber);
    }
  };

  // Auto-generate slug from name if empty
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  // Coordinate Picker handler
  const handleSelectCoordinate = (mode: PickerMode, coord: Coordinate) => {
    if (mode === "building") {
      setBuildingLocation(coord);
    } else if (mode === "entrance") {
      setEntranceLocation(coord);
    } else if (mode === "classroom") {
      setRoomLocation(coord);
    }
  };

  // Instruction operations
  const handleAddInstruction = () => {
    setInstructions((prev) => [
      ...prev,
      { stepNumber: prev.length + 1, text: "", imageUrl: "" },
    ]);
  };

  const handleUpdateInstructionText = (idx: number, text: string) => {
    setInstructions((prev) =>
      prev.map((step, i) => (i === idx ? { ...step, text } : step))
    );
  };

  const handleUpdateInstructionImage = (idx: number, imageUrl: string) => {
    setInstructions((prev) =>
      prev.map((step, i) => (i === idx ? { ...step, imageUrl } : step))
    );
  };

  const handleDeleteInstruction = (idx: number) => {
    setInstructions((prev) => {
      const filtered = prev.filter((_, i) => i !== idx);
      return filtered.map((step, newIdx) => ({ ...step, stepNumber: newIdx + 1 }));
    });
  };

  const handleMoveInstruction = (idx: number, direction: "up" | "down") => {
    if (
      (direction === "up" && idx === 0) ||
      (direction === "down" && idx === instructions.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const newSteps = [...instructions];
    const temp = newSteps[idx];
    newSteps[idx] = newSteps[targetIdx];
    newSteps[targetIdx] = temp;

    const reindexed = newSteps.map((step, i) => ({ ...step, stepNumber: i + 1 }));
    setInstructions(reindexed);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: Partial<IDepartment> = {
      name,
      shortName,
      slug,
      description,
      buildingName,
      floor,
      roomNumber,
      isActive,
      location: buildingLocation,
      entranceLocation,
      roomLocation,
      instructions,
      buildingId: buildingId || undefined,
      entranceId: entranceId || undefined,
      classroomId: classroomId || undefined,
    };

    try {
      const url = isEditing ? `/api/departments/${initialData?._id}` : "/api/departments";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        router.push("/admin/departments");
        router.refresh();
      } else {
        setError(json.error || "Failed to save department.");
      }
    } catch (err: any) {
      setError(err.message || "Network error while saving department.");
    } finally {
      setLoading(false);
    }
  };

  const buildings = mapObjects.filter((o) => o.type === "building");
  const entrances = mapObjects.filter((o) => o.type === "entrance");
  const classrooms = mapObjects.filter((o) => o.type === "classroom");

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/departments"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Departments
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isEditing ? "Update Department" : "Save Department"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs text-red-800 dark:text-red-300 font-medium">
          {error}
        </div>
      )}

      {/* Basic Department Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
          1. Basic Department Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Computer Science and Engineering"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Short Name / Code *
            </label>
            <input
              type="text"
              required
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="e.g. CSE"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="computer-science-and-engineering"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Building Name *
            </label>
            <input
              type="text"
              required
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              placeholder="e.g. CSE Block"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Floor *
            </label>
            <input
              type="text"
              required
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="e.g. 2nd Floor"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Room Number *
            </label>
            <input
              type="text"
              required
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. Room 204"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Optional Linked Campus Map Objects */}
        {mapObjects.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 mt-4">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Link with Campus Map Editor Objects (Optional)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Building Polygon
                </label>
                <select
                  value={buildingId}
                  onChange={(e) => handleSelectBuildingObject(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white"
                >
                  <option value="">-- None (Manual coordinates) --</option>
                  {buildings.map((b) => (
                    <option key={b._id} value={b._id}>
                      🏢 {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Entrance Marker
                </label>
                <select
                  value={entranceId}
                  onChange={(e) => handleSelectEntranceObject(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white"
                >
                  <option value="">-- None (Manual coordinates) --</option>
                  {entrances.map((ent) => (
                    <option key={ent._id} value={ent._id}>
                      🚪 {ent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Classroom Marker
                </label>
                <select
                  value={classroomId}
                  onChange={(e) => handleSelectClassroomObject(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white"
                >
                  <option value="">-- None (Manual coordinates) --</option>
                  {classrooms.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      📌 {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Brief overview of the department..."
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Active Department (Visible to Students)
          </label>
        </div>
      </div>

      {/* Coordinate Picker Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>2. Campus Leaflet Coordinate Picker</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select mode and click on the map to set Building center, Outdoor Entrance, and Classroom visual pin coordinates.
            </p>
          </div>
        </div>

        <CoordinatePicker
          buildingLocation={buildingLocation}
          entranceLocation={entranceLocation}
          roomLocation={roomLocation}
          onSelectCoordinate={handleSelectCoordinate}
        />
      </div>

      {/* Manual Indoor Directions Step Editor */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              3. Step-by-Step Indoor Directions
            </h3>
            <p className="text-xs text-slate-500">
              Add ordered human-readable instructions from building entrance to classroom.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddInstruction}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs shadow-sm hover:opacity-90"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Step</span>
          </button>
        </div>

        <div className="space-y-3">
          {instructions.map((step, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-extrabold text-xs">
                  Step {step.stepNumber}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveInstruction(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveInstruction(idx, "down")}
                    disabled={idx === instructions.length - 1}
                    className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteInstruction(idx)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Delete Step"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  required
                  rows={2}
                  value={step.text}
                  onChange={(e) => handleUpdateInstructionText(idx, e.target.value)}
                  placeholder={`Instruction text for Step ${step.stepNumber}, e.g. Take the right staircase to 2nd floor...`}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                />

                <div className="flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="url"
                    value={step.imageUrl || ""}
                    onChange={(e) => handleUpdateInstructionImage(idx, e.target.value)}
                    placeholder="Optional image URL (Cloudinary or public photo link)"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-mono text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isEditing ? "Save Changes" : "Create Department"}</span>
        </button>
      </div>
    </form>
  );
}
