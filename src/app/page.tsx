"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { Header } from "@/components/ui/header";
import { DirectionSteps } from "@/components/navigation/DirectionSteps";
import { IDepartment } from "@/types/department";
import { SEED_DEPARTMENTS } from "@/lib/seedData";
import { createGoogleMapsDirectionsUrl } from "@/lib/googleMaps";
import {
  Building2,
  Navigation2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Layers,
  Info,
  MapPin,
} from "lucide-react";

export default function StudentHomePage() {
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [loadingDepts, setLoadingDepts] = useState<boolean>(true);
  const [selectedSlug, setSelectedSlug] = useState<string>("1st-eee-a-ai-campus");

  // Fetch departments from MongoDB API (or use seed data as fallback)
  const fetchDepartments = useCallback(async () => {
    setLoadingDepts(true);
    try {
      const res = await fetch("/api/departments");
      const json = await res.json();

      if (json.success && json.data && json.data.length > 0) {
        setDepartments(json.data);
      } else {
        const placeholders = SEED_DEPARTMENTS.map((d, idx) => ({ ...d, _id: `placeholder-${idx}` }));
        setDepartments(placeholders as IDepartment[]);
      }
    } catch (e) {
      console.error("Failed to fetch departments from API, using seed data:", e);
      const placeholders = SEED_DEPARTMENTS.map((d, idx) => ({ ...d, _id: `placeholder-${idx}` }));
      setDepartments(placeholders as IDepartment[]);
    } finally {
      setLoadingDepts(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Selected department object
  const selectedDept = useMemo(() => {
    return (
      departments.find((d) => d.slug === selectedSlug || d.shortName === selectedSlug) ||
      departments[0] ||
      (SEED_DEPARTMENTS[0] as IDepartment)
    );
  }, [departments, selectedSlug]);

  // Calculate Google Maps directions URL dynamically from saved classroom location coordinates
  const googleMapsUrl = useMemo(() => {
    if (!selectedDept || !selectedDept.location) return null;
    return createGoogleMapsDirectionsUrl(
      selectedDept.location.latitude,
      selectedDept.location.longitude
    );
  }, [selectedDept]);

  // Handle Google Maps navigation click
  const handleNavigateClick = () => {
    if (googleMapsUrl) {
      window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-3 py-8 px-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SNS College of Engineering</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            Find Your Classroom
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-medium">
            Select your classroom and use Google Maps to reach the campus. Once you arrive, follow the step-by-step indoor directions to your room.
          </p>
        </section>

        {/* Classroom Selector Pills/Cards */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Select Classroom ({departments.length || 4})</span>
            </h3>
            {loadingDepts && <span className="text-xs text-slate-400 font-medium">Loading...</span>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {departments.map((dept) => {
              const isSelected = selectedDept?.slug === dept.slug || selectedDept?.shortName === dept.shortName;
              return (
                <button
                  key={dept._id || dept.slug}
                  onClick={() => setSelectedSlug(dept.slug)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2.5 relative ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 scale-[1.02]"
                      : "bg-white hover:bg-slate-100/80 text-slate-800 border-slate-200 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`}>
                      {dept.shortName}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold truncate leading-snug">
                      Room {dept.roomNumber}
                    </h4>
                    <p className={`text-[11px] font-medium ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                      {dept.floor}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected Classroom Main Details & Dual-Step Guidance */}
        {selectedDept && (
          <section className="space-y-6">
            {/* Classroom Info Banner Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-black text-xs shadow-xs">
                      {selectedDept.shortName}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                      🏢 {selectedDept.floor} • Room {selectedDept.roomNumber}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-1">
                    {selectedDept.name}
                  </h3>

                  <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{selectedDept.buildingName}</span>
                  </p>
                </div>

                {/* Classroom Existing Photo Preview */}
                {selectedDept.images && selectedDept.images.length > 0 ? (
                  <div className="relative w-full md:w-56 h-36 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                    <Image
                      src={selectedDept.images[0]}
                      alt={`Classroom ${selectedDept.roomNumber}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-400" />
                      <span>Classroom Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full md:w-56 h-32 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-medium italic shrink-0">
                    Classroom photo unavailable
                  </div>
                )}
              </div>

              {selectedDept.description && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-medium">
                  {selectedDept.description}
                </div>
              )}
            </div>

            {/* STEP 1: GET TO CAMPUS (Google Maps Outdoor Handoff) */}
            <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-700">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>STEP 1: GET TO CAMPUS</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900">Outdoor Campus Navigation</h4>
                  <p className="text-xs font-medium text-slate-600">
                    Google Maps will provide walking directions from your current location directly to the campus building.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                {googleMapsUrl ? (
                  <button
                    onClick={handleNavigateClick}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 transition-all duration-200 active:scale-95 group"
                  >
                    <Navigation2 className="w-5 h-5 text-white fill-white group-hover:rotate-12 transition-transform" />
                    <span>Navigate with Google Maps</span>
                    <ExternalLink className="w-4 h-4 text-blue-200" />
                  </button>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-bold flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Location not configured for this classroom.</span>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2: FIND YOUR CLASSROOM (Indoor Step Directions) */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 px-1">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>STEP 2: FIND YOUR CLASSROOM</span>
              </div>
              <p className="text-xs font-medium text-slate-600 px-1">
                Once you reach the campus building, follow the indoor directions below to reach room {selectedDept.roomNumber}.
              </p>

              <DirectionSteps
                steps={selectedDept.instructions}
                buildingName={selectedDept.buildingName}
                roomNumber={selectedDept.roomNumber}
                floor={selectedDept.floor}
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
