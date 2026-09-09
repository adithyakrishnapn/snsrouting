import { DepartmentForm } from "@/components/admin/DepartmentForm";

export default function NewDepartmentPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Admin Dashboard
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Create New Department
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fill in department details, select locations on the Leaflet map, and add step-by-step indoor directions.
          </p>
        </div>

        <DepartmentForm isEditing={false} />
      </div>
    </div>
  );
}
