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

          <span className="bg-[#7c4dff]/10 text-[#7c4dff] border border-[#7c4dff]/20 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
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
        <div className="w-9 h-9 rounded-xl bg-[#7c4dff]/10 text-[#7c4dff] flex items-center justify-center font-bold">
          <User className="w-5 h-5" />
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-800">
            {currentUser?.name || "Lecturer"}
          </h4>
          <p className="text-[11px] text-slate-400">
            {currentUser?.department || "Academic Faculty"}
          </p>
        </div>
      </div>
    </header>
  );
}
