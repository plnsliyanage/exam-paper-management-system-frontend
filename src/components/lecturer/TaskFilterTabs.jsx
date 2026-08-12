import React from "react";

export default function TaskFilterTabs({ taskFilter, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {["ALL", "SET_PAPER", "MARK_SCRIPTS", "MODERATION"].map((type) => (
        <button
          key={type}
          onClick={() => onFilterChange(type)}
          className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
            taskFilter === type
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {type === "ALL" ? "All Tasks" : type.replace("_", " ")}
        </button>
      ))}
    </div>
  );
}
