import React from "react";

const SCOPE_TABS = [
  { id: "SCOPE_ALL", label: "📚 All Packets" },
  { id: "SCOPE_AUTHORED", label: "✍️ Teaching (Author)" },
  { id: "SCOPE_MODERATION", label: "🔍 Moderating (Review)" },
];

export default function TaskFilterTabs({
  roleScope = "SCOPE_ALL",
  onScopeChange,
}) {
  if (!onScopeChange) return null;

  return (
    <div className="flex flex-wrap gap-1.5 p-1 bg-purple-50/70 border border-purple-100 rounded-xl w-fit">
      {SCOPE_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onScopeChange(tab.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            roleScope === tab.id
              ? "bg-[#7c4dff] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
