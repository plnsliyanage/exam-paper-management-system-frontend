import React from "react";

const FILTER_TABS = [
  { id: "ALL", label: "All Packets" },
  { id: "PENDING", label: "Pending" },
  { id: "DRAFT", label: "Drafting" },
  { id: "SUBMITTED", label: "In Moderation" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Revision Needed" },
  { id: "PRINTING", label: "Printing" },
  { id: "PAPERS STORED", label: "Papers Stored" },
  { id: "ANSWER SHEETS TAKEN", label: "Sheets Taken" },
  { id: "MARKING", label: "Marking" },
  { id: "COMPLETED", label: "Completed" },
];

export default function TaskFilterTabs({ taskFilter, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer text-xs ${
            taskFilter === tab.id
              ? "bg-[#7c4dff] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
