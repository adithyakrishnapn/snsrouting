"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/ui/header";
import { DepartmentSearch } from "@/components/departments/DepartmentSearch";
import { DepartmentCard } from "@/components/departments/DepartmentCard";
import { DepartmentModal } from "@/components/departments/DepartmentModal";
import { LocationButton } from "@/components/navigation/LocationButton";
import { NavigationPanel } from "@/components/navigation/NavigationPanel";
import { DirectionSteps } from "@/components/navigation/DirectionSteps";
import { useUserLocation } from "@/hooks/useUserLocation";
import { IDepartment } from "@/types/department";
import { RouteInfo } from "@/types/navigation";
import { ICampusMapObject } from "@/types/map";
import { SEED_DEPARTMENTS } from "@/lib/seedData";
import { Sparkles, MapPin, Database, RefreshCw, Compass, Building2 } from "lucide-react";

// Dynamically import client-only Leaflet CampusMap to avoid SSR errors
const CampusMap = dynamic(() => import("@/components/map/CampusMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-500 font-semibold animate-pulse">
      Loading Interactive Campus Map...
    </div>
  ),
});

export default function StudentNavigatorPage() {
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [mapObjects, setMapObjects] = useState<ICampusMapObject[]>([]);
  const [loadingDepts, setLoadingDepts] = useState<boolean>(true);
  const [selectedDepartment, setSelectedDepartment] = useState<IDepartment | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [routeData, setRouteData] = useState<RouteInfo | null>(null);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Browser Geolocation hook with demo campus fallback
  const {
    latitude,
    longitude,
    accuracy,
    loading: loadingLocation,
    error: locationError,
    isDemoLocation,
    requestLocation,
    setCampusDemoLocation,
  } = useUserLocation();

  // Fetch departments from API
  const fetchDepartments = useCallback(async () => {
    setLoadingDepts(true);
    try {
      const res = await fetch("/api/departments");
      const json = await res.json();

      if (json.success && json.data && json.data.length > 0) {
        setDepartments(json.data);
        if (!selectedDepartment) {
          setSelectedDepartment(json.data[0]);
        }
      } else {
        const placeholders = SEED_DEPARTMENTS.map((d, idx) => ({ ...d, _id: `placeholder-${idx}` }));
        setDepartments(placeholders as IDepartment[]);
        if (!selectedDepartment) {
          setSelectedDepartment(placeholders[0] as IDepartment);
        }
      }
    } catch (e) {
      console.error("Failed to fetch departments from API, using fallback data:", e);
      const placeholders = SEED_DEPARTMENTS.map((d, idx) => ({ ...d, _id: `placeholder-${idx}` }));
      setDepartments(placeholders as IDepartment[]);
      if (!selectedDepartment) {
        setSelectedDepartment(placeholders[0] as IDepartment);
      }
    } finally {
      setLoadingDepts(false);
    }
  }, [selectedDepartment]);

  // Fetch campus map objects (Buildings, Paths, Markers)
  const fetchMapObjects = useCallback(async () => {
    try {
      const res = await fetch("/api/map");
      const json = await res.json();
      if (json.success && json.data) {
        setMapObjects(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch map objects:", e);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchMapObjects();

    // Auto-open upfront department selection modal on initial load for mobile & desktop UX
    const hasPrompted = sessionStorage.getItem("sns_dept_prompted");
    if (!hasPrompted) {
      setIsModalOpen(true);
      sessionStorage.setItem("sns_dept_prompted", "true");
    }
  }, [fetchDepartments, fetchMapObjects]);

  // Seed database button handler if DB is empty
  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/departments/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        await fetchDepartments();
        await fetchMapObjects();
      }
    } catch (e) {
      console.error("Failed to seed database:", e);
    } finally {
      setSeeding(false);
    }
  };

  // Fetch walking route whenever user location or selected department changes
  useEffect(() => {
    if (!latitude || !longitude || !selectedDepartment || !selectedDepartment.entranceLocation) {
      setRouteData(null);
      return;
    }

    const getRoute = async () => {
      setLoadingRoute(true);
      try {
        const res = await fetch("/api/directions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            start: { latitude, longitude },
            end: selectedDepartment.entranceLocation,
          }),
        });

        const json = await res.json();
        if (json.success && json.data) {
          setRouteData(json.data);
        } else {
          setRouteData(null);
        }
      } catch (err) {
        console.error("Error fetching directions:", err);
        setRouteData(null);
      } finally {
        setLoadingRoute(false);
      }
    };

    getRoute();
  }, [latitude, longitude, selectedDepartment]);

  // Filter departments based on search query
  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;
    const q = searchQuery.toLowerCase().trim();
    return departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(q) ||
        dept.shortName.toLowerCase().includes(q) ||
        dept.buildingName.toLowerCase().includes(q) ||
        dept.roomNumber.toLowerCase().includes(q) ||
        dept.floor.toLowerCase().includes(q)
    );
  }, [departments, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <Header />

      {/* Upfront Department Modal Dialog */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        departments={departments}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={(dept) => {
          setSelectedDepartment(dept);
          setIsModalOpen(false);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Banner header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
              <span>SNS Campus Navigation System</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">SNS College of Engineering</h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Locate campus buildings, calculate outdoor walking paths to entrances, and view step-by-step indoor directions to classrooms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Upfront Department Picker Trigger Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <Compass className="w-4 h-4 text-sky-200" />
              <span>Select Department</span>
            </button>

            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="text-xs font-semibold px-3 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5"
              title="Reset placeholder departments in database"
            >
              {seeding ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Database className="w-3.5 h-3.5 text-sky-300" />
              )}
              <span>{seeding ? "Seeding..." : "Seed Depts"}</span>
            </button>
          </div>
        </div>

        {/* Selected Department Quick Banner on Mobile */}
        {selectedDepartment && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm sm:hidden">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-extrabold text-xs">
                {selectedDepartment.shortName}
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {selectedDepartment.name}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {selectedDepartment.buildingName} • {selectedDepartment.roomNumber}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold text-[11px]"
            >
              Change
            </button>
          </div>
        )}

        {/* Main Grid: Responsive Desktop Split / Mobile Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Search, Dept Selection & Directions (Lg: 5 cols) */}
          <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
            {/* Locate Me GPS & Campus Demo Button */}
            <LocationButton
              onLocate={requestLocation}
              onSetDemoLocation={setCampusDemoLocation}
              loading={loadingLocation}
              error={locationError}
              hasLocation={!!(latitude && longitude)}
              isDemoLocation={isDemoLocation}
            />

            {/* Search Bar */}
            <div className="space-y-3">
              <DepartmentSearch
                query={searchQuery}
                onQueryChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
              />

              {/* Department Quick Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {departments.map((dept) => (
                  <button
                    key={dept._id || dept.slug}
                    onClick={() => setSelectedDepartment(dept)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                      selectedDepartment?.slug === dept.slug
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {dept.shortName}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Department Navigation Card */}
            {selectedDepartment && (
              <NavigationPanel
                department={selectedDepartment}
                routeData={routeData}
                loadingRoute={loadingRoute}
                hasUserLocation={!!(latitude && longitude)}
                onRequestLocation={requestLocation}
              />
            )}

            {/* Department List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <span>Select Department ({filteredDepartments.length})</span>
                {loadingDepts && <span className="text-slate-400 font-normal">Loading...</span>}
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredDepartments.map((dept) => (
                  <DepartmentCard
                    key={dept._id || dept.slug}
                    department={dept}
                    isSelected={selectedDepartment?.slug === dept.slug}
                    onSelect={(d) => setSelectedDepartment(d)}
                  />
                ))}

                {filteredDepartments.length === 0 && (
                  <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-500">
                    No departments matching &quot;{searchQuery}&quot; found.
                  </div>
                )}
              </div>
            </div>

            {/* Indoor Step-by-Step Directions */}
            {selectedDepartment && (
              <DirectionSteps
                steps={selectedDepartment.instructions}
                buildingName={selectedDepartment.buildingName}
                roomNumber={selectedDepartment.roomNumber}
                floor={selectedDepartment.floor}
              />
            )}
          </div>

          {/* Right Column: Interactive Campus Map (Lg: 7 cols) */}
          <div className="lg:col-span-7 order-1 lg:order-2 lg:sticky lg:top-20 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Interactive Campus Map</span>
              </span>
              {selectedDepartment && (
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Showing {selectedDepartment.shortName} Block
                </span>
              )}
            </div>

            <div className="h-[420px] sm:h-[550px] lg:h-[650px] w-full">
              <CampusMap
                userLocation={
                  latitude && longitude ? { latitude, longitude, accuracy } : null
                }
                departments={departments}
                selectedDepartment={selectedDepartment}
                routeData={routeData}
                mapObjects={mapObjects}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
