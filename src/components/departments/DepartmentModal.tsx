"use client";

import { IDepartment } from "@/types/department";
import { X, Search, Compass, MapPin, Sparkles, Building2 } from "lucide-react";
import { useState } from "react";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: IDepartment[];
  selectedDepartment: IDepartment | null;
  onSelectDepartment: (dept: IDepartment) => void;
}

export function DepartmentModal({
  isOpen,
  onClose,
  departments,
  selectedDepartment,
  onSelectDepartment,
}: DepartmentModalProps) {
  const [filterQuery, setFilterQuery] = useState("");

  if (!isOpen) return null;

  const filtered = departments.filter((d) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase().trim();
    return (
      d.name.toLowerCase().includes(q) ||
      d.shortName.toLowerCase().includes(q) ||
      d.buildingName.toLowerCase().includes(q) ||
      d.roomNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SNS Campus Navigator</span>
            </div>
            <h2 className="text-lg font-extrabold mt-0.5">Select Destination Department</h2>
            <p className="text-xs text-slate-300">Choose a department to start outdoor map route & indoor guide.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search CSE, ECE, Mechanical, Room 204..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              autoFocus
            />
          </div>
        </div>

        {/* Department Options Grid */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filtered.map((dept) => {
            const isSelected = selectedDepartment?.slug === dept.slug;
            return (
              <button
                key={dept._id || dept.slug}
                onClick={() => {
                  onSelectDepartment(dept);
                  onClose();
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-extrabold text-xs">
                      {dept.shortName}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-blue-500" />
                      {dept.buildingName}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {dept.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                      🏢 {dept.floor}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                      📌 {dept.roomNumber}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-center pt-1">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-blue-600"
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-10 text-center text-xs text-slate-500">
              No departments matching &quot;{filterQuery}&quot; found.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
