import React from "react";

export default function MetricCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-slate-50 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>

      <div>
        <span className="text-xs text-slate-400 font-semibold">{title}</span>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value ?? 0}</p>
      </div>
    </div>
  );
}
