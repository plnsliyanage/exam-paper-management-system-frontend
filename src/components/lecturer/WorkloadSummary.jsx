import React from "react";
import { BarChart3 } from "lucide-react";

export default function WorkloadSummary({ dashboardStats }) {
  const completionRate = Number(dashboardStats.completionRate || 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
      <h2 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
        <BarChart3 className="w-4 h-4 text-brand-600" />
        Workload Summary
      </h2>

      <div>
        <div className="flex justify-between text-xs font-semibold mb-1">
          <span>Overall Completion Rate</span>
          <span className="text-brand-600">
            {dashboardStats.completionRate}%
          </span>
        </div>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all"
            style={{
              width: `${Math.min(Math.max(completionRate, 0), 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="pt-2 text-[11px] text-slate-500 space-y-1.5 border-t border-slate-100">
        <div className="flex justify-between">
          <span>Paper Setting Tasks:</span>
          <span className="font-bold text-slate-700">
            {dashboardStats.paperSettingCount} Active
          </span>
        </div>

        <div className="flex justify-between">
          <span>Script Marking Tasks:</span>
          <span className="font-bold text-slate-700">
            {dashboardStats.scriptMarkingCount} Active
          </span>
        </div>

        <div className="flex justify-between">
          <span>Moderation / Checking Tasks:</span>
          <span className="font-bold text-slate-700">
            {dashboardStats.moderationCount} Active
          </span>
        </div>
      </div>
    </div>
  );
}
