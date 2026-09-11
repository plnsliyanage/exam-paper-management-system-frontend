const SCOPE_TABS = [
  { id: "SCOPE_ALL", label: "📚 All Packets" },
  { id: "SCOPE_AUTHORED", label: "✍️ Teaching (Author)" },
  { id: "SCOPE_MODERATION", label: "🔍 Moderating (Review)" },
];

const FILTER_TABS = [
  { id: "ALL", label: "All Status" },
  { id: "PENDING", label: "Pending Start" },
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

export default function TaskFilterTabs({
  roleScope = "SCOPE_ALL",
  onScopeChange,
  taskFilter,
  onFilterChange,
}) {
  return (
    <div className="space-y-2.5">
      {/* Role Scope Switcher */}
      {onScopeChange && (
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
      )}

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer text-xs ${
              taskFilter === tab.id
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
