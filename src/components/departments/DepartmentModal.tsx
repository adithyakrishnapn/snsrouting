"use client";

import { IDepartment } from "@/types/department";
import { X, Search, Compass, MapPin, Building2, Check } from "lucide-react";
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
      d.roomNumber.toLowerCase().includes(q) ||
      d.floor.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Select Destination Classroom</h2>
              <p className="text-xs text-slate-400">Choose a classroom to calculate route & indoor directions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search IA042, 1st EEE-A, IA028, 2nd Floor..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>
        </div>

        {/* Classroom List Options */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {filtered.map((dept) => {
            const isSelected = selectedDepartment?.slug === dept.slug;
            return (
              <button
                key={dept._id || dept.slug}
                onClick={() => {
                  onSelectDepartment(dept);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-blue-600/15 border-blue-500 shadow-md ring-1 ring-blue-500/30"
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Classroom Door Photo Thumbnail */}
                  {dept.images && dept.images.length > 0 && (
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden border border-slate-700 shrink-0 shadow-sm">
                      <img
                        src={dept.images[0]}
                        alt={`Room ${dept.roomNumber}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-extrabold text-[11px]">
                        {dept.shortName}
                      </span>
                      <span className="text-[11px] font-bold text-slate-300">
                        {dept.floor} • Room {dept.roomNumber}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-white truncate">
                      {dept.name}
                    </h3>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{dept.buildingName}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-center">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 group-hover:text-white"
                    }`}
                  >
                    {isSelected ? <Check className="w-4 h-4" /> : <Compass className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No classrooms matching &quot;{filterQuery}&quot; found.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
