import React from "react";
import { BarChart3 } from "lucide-react";

export default function WorkloadSummary({ dashboardStats }) {
  const completionRate = Number(dashboardStats?.completionRate || 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
      <h2 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
        <BarChart3 className="w-4 h-4 text-[#7c4dff]" />
        Workload Summary
      </h2>

      <div>
        <div className="flex justify-between text-xs font-semibold mb-1">
          <span>Overall Completion Rate</span>
          <span className="text-[#7c4dff]">
            {dashboardStats?.completionRate ?? 0}%
          </span>
        </div>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#7c4dff] rounded-full transition-all"
            style={{
              width: `${Math.min(Math.max(completionRate, 0), 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="pt-2 text-[11px] text-slate-500 space-y-1.5 border-t border-slate-100">
        <div className="flex justify-between">
          <span>Pending Draft Preparation:</span>
          <span className="font-bold text-amber-700">
            {dashboardStats?.pendingDraftCount ?? 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Submitted for Moderation:</span>
          <span className="font-bold text-purple-700">
            {dashboardStats?.inModerationCount ?? 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Approved / Printing & Stored:</span>
          <span className="font-bold text-emerald-700">
            {dashboardStats?.approvedPrintCount ?? 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Answer Sheets & Marking:</span>
          <span className="font-bold text-violet-700">
            {dashboardStats?.markingCount ?? 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Marking Completed:</span>
          <span className="font-bold text-teal-700">
            {dashboardStats?.completedTasks ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}
