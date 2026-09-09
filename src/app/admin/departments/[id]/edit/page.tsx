"use client";

import { useState, useEffect, use } from "react";
import { DepartmentForm } from "@/components/admin/DepartmentForm";
import { IDepartment } from "@/types/department";
import { Loader2 } from "lucide-react";

export default function EditDepartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [department, setDepartment] = useState<IDepartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const res = await fetch(`/api/departments/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setDepartment(data.data);
        } else {
          setError(data.error || "Department not found.");
        }
      } catch (err) {
        setError("Failed to load department details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading Department Data...</span>
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-3 max-w-sm">
          <div className="text-sm font-bold text-red-600">{error || "Department not found"}</div>
          <a href="/admin/departments" className="text-xs font-bold text-blue-600 underline">
            Return to Department List
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Admin Dashboard
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Edit Department: {department.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Modify coordinates using the Leaflet map picker or update indoor directions.
          </p>
        </div>

        <DepartmentForm initialData={department} isEditing={true} />
      </div>
    </div>
  );
}
