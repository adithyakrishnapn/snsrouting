"use client";

import { IDepartment } from "@/types/department";
import { Building2, MapPin, ChevronRight } from "lucide-react";

interface DepartmentCardProps {
  department: IDepartment;
  isSelected: boolean;
  onSelect: (department: IDepartment) => void;
}

export function DepartmentCard({ department, isSelected, onSelect }: DepartmentCardProps) {
  return (
    <div
      onClick={() => onSelect(department)}
      className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${
        isSelected
          ? "bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/50"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold text-[11px]">
              {department.shortName}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {department.floor} • {department.roomNumber}
            </span>
          </div>

          <h3 className="mt-1.5 text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {department.name}
          </h3>

          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{department.buildingName}</span>
          </div>
        </div>

        <div className="mt-1 flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
