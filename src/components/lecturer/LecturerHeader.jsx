import React from "react";
import { Calendar, User } from "lucide-react";

export default function LecturerHeader({ currentUser, currentSemester }) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Lecturer Workspace
          </h1>

          <span className="bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Semester: {currentSemester}
          </span>
        </div>

        <p className="text-sm text-slate-500 mt-1">
          Manage your exam paper settings, script markings, and moderations for{" "}
          {currentSemester}
        </p>
      </div>

      <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
          <User className="w-5 h-5" />
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-800">
            {currentUser.name}
          </h4>
          <p className="text-[11px] text-slate-400">
            {currentUser.department} ({currentUser.id})
          </p>
        </div>
      </div>
    </header>
  );
}
