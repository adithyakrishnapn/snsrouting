"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { IDepartment, InstructionStep, Coordinate } from "@/types/department";
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
} from "lucide-react";
import Link from "next/link";

const CoordinatePicker = dynamic(() => import("@/components/map/CoordinatePicker"), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-xs text-slate-500 animate-pulse font-semibold">
      Loading Coordinate Picker...
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

  // Form Fields
  const [name, setName] = useState(initialData?.name || "");
  const [shortName, setShortName] = useState(initialData?.shortName || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [buildingName, setBuildingName] = useState(initialData?.buildingName || "");
  const [floor, setFloor] = useState(initialData?.floor || "");
  const [roomNumber, setRoomNumber] = useState(initialData?.roomNumber || "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  // Coordinates
  const [buildingLocation, setBuildingLocation] = useState<Coordinate>(
    initialData?.location || { latitude: 11.103333, longitude: 77.02735 }
  );
  const [entranceLocation, setEntranceLocation] = useState<Coordinate>(
    initialData?.entranceLocation || { latitude: 11.10325, longitude: 77.0273 }
  );
  const [roomLocation, setRoomLocation] = useState<Coordinate>(
    initialData?.roomLocation || { latitude: 11.103333, longitude: 77.02735 }
  );

  // Instructions
  const [instructions, setInstructions] = useState<InstructionStep[]>(
    initialData?.instructions && initialData.instructions.length > 0
      ? initialData.instructions
      : [
          { stepNumber: 1, text: "Enter through the AI Campus main entrance located on the left side of the building." },
          { stepNumber: 2, text: "Take the staircase on the right side to the 2nd Floor." },
        ]
  );

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
          1. Basic Department & Classroom Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Classroom/Department Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Electrical & Electronics Engineering (Sec A) - 1st Year"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Short Name / Class Code *
            </label>
            <input
              type="text"
              required
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="e.g. 1st EEE-A"
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
              placeholder="1st-eee-a-ai-campus"
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
              placeholder="e.g. AI Campus - Innovation Complex"
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
              placeholder="e.g. IA042"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Brief overview of the classroom..."
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
            Active Classroom (Visible to Students)
          </label>
        </div>
      </div>

      {/* Coordinate Selector Section (powers Google Maps URL) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>2. Google Maps Destination Coordinates</span>
            </h3>
            <p className="text-xs text-slate-500">
              Enter or pick classroom coordinates. These latitude/longitude coordinates generate the outdoor Google Maps walking navigation link.
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
          <span>{isEditing ? "Save Changes" : "Create Classroom"}</span>
        </button>
      </div>
    </form>
  );
}
