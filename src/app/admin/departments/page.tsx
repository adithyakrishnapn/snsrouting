"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IDepartment } from "@/types/department";
import {
  Plus,
  Edit,
  Trash2,
  Database,
  LogOut,
  MapPin,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Home,
  Map,
} from "lucide-react";

export default function AdminDepartmentListPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/departments?all=true");
      const data = await res.json();
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch admin departments:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleLogout = async () => {
    await fetch("/api/admin/me", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  const handleSeedDatabase = async () => {
    if (!confirm("Are you sure you want to seed database with initial 4 departments? Existing records will be replaced.")) {
      return;
    }
    setSeeding(true);
    try {
      const res = await fetch("/api/departments/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchDepartments();
      } else {
        alert(data.error || "Failed to seed database");
      }
    } catch (e) {
      alert("Error seeding database");
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDepartments((prev) => prev.filter((d) => d._id !== id));
      } else {
        alert(data.error || "Failed to delete department");
      }
    } catch (e) {
      alert("Error deleting department");
    }
  };

  const handleToggleActive = async (dept: IDepartment) => {
    try {
      const res = await fetch(`/api/departments/${dept._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !dept.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setDepartments((prev) =>
          prev.map((d) => (d._id === dept._id ? { ...d, isActive: !d.isActive } : d))
        );
      }
    } catch (e) {
      console.error("Error toggling active state:", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Admin Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Admin Portal
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Campus Department Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure department buildings, outdoor entrances, classroom coordinates &amp; indoor instructions.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/map"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 transition-all"
            >
              <Map className="w-3.5 h-3.5 text-blue-600" />
              <span>Campus Map Editor</span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Student Map</span>
            </Link>

            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all"
            >
              {seeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              <span>{seeding ? "Seeding..." : "Seed 4 Depts"}</span>
            </button>

            <Link
              href="/admin/departments/new"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Department Table / Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
            Loading campus departments...
          </div>
        ) : departments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <Database className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Departments Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You can click <strong>Seed 4 Depts</strong> to automatically initialize Computer Science, ECE, EEE, and Mechanical Engineering placeholder records.
            </p>
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              Initialize Placeholder Departments
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div
                key={dept._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold text-xs">
                        {dept.shortName}
                      </span>
                      <button
                        onClick={() => handleToggleActive(dept)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          dept.isActive
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {dept.isActive ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                        <span>{dept.isActive ? "Active" : "Inactive"}</span>
                      </button>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {dept.buildingName} • {dept.floor} • {dept.roomNumber}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/departments/${dept._id}/edit`}
                      className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Department & Coordinates"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </Link>

                    <button
                      onClick={() => handleDelete(dept._id!, dept.name)}
                      className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 transition-colors"
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Coordinate badge summary */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" /> Entrance:
                    </span>
                    <span className="font-mono text-[11px]">
                      {dept.entranceLocation?.latitude}, {dept.entranceLocation?.longitude}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-purple-600" /> Room Pin:
                    </span>
                    <span className="font-mono text-[11px]">
                      {dept.roomLocation?.latitude}, {dept.roomLocation?.longitude}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>{dept.instructions?.length || 0} Indoor Instruction Steps</span>
                  <Link
                    href="/"
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Eye className="w-3 h-3" /> Test on Map
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
