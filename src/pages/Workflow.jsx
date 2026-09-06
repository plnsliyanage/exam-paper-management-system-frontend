import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const DEFAULT_COLOR = {
  circle: "border-[#7c4dff] text-[#7c4dff] bg-purple-50",
  label: "text-[#7c4dff]",
  badge: "bg-purple-100 text-[#7c4dff]",
};

const STAGE_COLORS = {
  Pending: { circle: "border-amber-500 text-amber-600 bg-amber-50", label: "text-amber-600", badge: "bg-amber-100 text-amber-800" },
  Drafting: { circle: "border-blue-500 text-blue-600 bg-blue-50", label: "text-blue-600", badge: "bg-blue-100 text-blue-800" },
  Draft: { circle: "border-blue-500 text-blue-600 bg-blue-50", label: "text-blue-600", badge: "bg-blue-100 text-blue-800" },
  Moderation: { circle: "border-purple-500 text-purple-600 bg-purple-50", label: "text-purple-600", badge: "bg-purple-100 text-purple-800" },
  Approved: { circle: "border-emerald-500 text-emerald-600 bg-emerald-50", label: "text-emerald-600", badge: "bg-emerald-100 text-emerald-800" },
  Printing: { circle: "border-indigo-500 text-indigo-600 bg-indigo-50", label: "text-indigo-600", badge: "bg-indigo-100 text-indigo-800" },
  "Papers Stored": { circle: "border-cyan-500 text-cyan-600 bg-cyan-50", label: "text-cyan-700", badge: "bg-cyan-100 text-cyan-800" },
  "Answer Sheets Taken": { circle: "border-orange-500 text-orange-600 bg-orange-50", label: "text-orange-700", badge: "bg-orange-100 text-orange-800" },
  Marking: { circle: "border-violet-500 text-violet-600 bg-violet-50", label: "text-violet-700", badge: "bg-violet-100 text-violet-800" },
  Completed: { circle: "border-teal-500 text-teal-600 bg-teal-50", label: "text-teal-700", badge: "bg-teal-100 text-teal-800" },
  "Marking Complete": { circle: "border-teal-500 text-teal-600 bg-teal-50", label: "text-teal-700", badge: "bg-teal-100 text-teal-800" },
};

const getStageColor = (name) => {
  if (!name) return STAGE_COLORS.Drafting || DEFAULT_COLOR;
  return STAGE_COLORS[name] || STAGE_COLORS.Drafting || DEFAULT_COLOR;
};

const STATUS_BADGE = {
  PENDING: "bg-amber-100 text-amber-800",
  DRAFT: "bg-blue-100 text-blue-800",
  SUBMITTED: "bg-purple-100 text-purple-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  PRINTING: "bg-indigo-100 text-indigo-800",
  PRINTING_QUEUE: "bg-indigo-100 text-indigo-800",
  "PAPERS STORED": "bg-cyan-100 text-cyan-800",
  PAPERS_STORED: "bg-cyan-100 text-cyan-800",
  "ANSWER SHEETS TAKEN": "bg-orange-100 text-orange-800",
  ANSWER_SHEETS_TAKEN: "bg-orange-100 text-orange-800",
  MARKING: "bg-violet-100 text-violet-800",
  UNDER_MARKING: "bg-violet-100 text-violet-800",
  "MARKING COMPLETE": "bg-teal-100 text-teal-800",
  MARKING_COMPLETE: "bg-teal-100 text-teal-800",
  COMPLETED: "bg-teal-100 text-teal-800",
  UNDER_MODERATION: "bg-purple-100 text-purple-800",
  DELAYED: "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  PENDING: "Pending",
  DRAFT: "Drafting",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PRINTING: "Printing",
  PRINTING_QUEUE: "Printing",
  "PAPERS STORED": "Papers Stored",
  PAPERS_STORED: "Papers Stored",
  "ANSWER SHEETS TAKEN": "Sheets Taken",
  ANSWER_SHEETS_TAKEN: "Sheets Taken",
  MARKING: "Marking",
  UNDER_MARKING: "Marking",
  "MARKING COMPLETE": "Marking Complete",
  MARKING_COMPLETE: "Marking Complete",
  COMPLETED: "Completed",
  UNDER_MODERATION: "Moderation",
  DELAYED: "Delayed",
};

const DEFAULT_STAGES = [
  { stageName: "Pending", actor: "Registry assigned", completed: false, current: false, events: [] },
  { stageName: "Drafting", actor: "Lecturer preparing", completed: false, current: false, events: [] },
  { stageName: "Moderation", actor: "Moderator review", completed: false, current: false, events: [] },
  { stageName: "Approved", actor: "Moderator approved", completed: false, current: false, events: [] },
  { stageName: "Printing", actor: "Lecturer printing", completed: false, current: false, events: [] },
  { stageName: "Papers Stored", actor: "Safe custody", completed: false, current: false, events: [] },
  { stageName: "Answer Sheets Taken", actor: "Exam finished & collected", completed: false, current: false, events: [] },
  { stageName: "Marking", actor: "Lecturer marking", completed: false, current: false, events: [] },
  { stageName: "Marking Complete", actor: "Finalized", completed: false, current: false, events: [] },
];

export default function Workflow() {
  const [packets, setPackets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const filteredPackets = packets.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.packetId && p.packetId.toLowerCase().includes(q)) ||
      (p.courseCode && p.courseCode.toLowerCase().includes(q)) ||
      (p.courseName && p.courseName.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const res = await axiosInstance.get("/workflow");
        const list = Array.isArray(res.data) ? res.data : [];
        setPackets(list);
        if (list.length > 0) setSelected(list[0]);
      } catch (err) {
        setError("Failed to load workflow.");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflow();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c4dff] mr-3"></div>
        Loading workflow...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        {error}
      </div>
    );

  const displayStages = selected?.stages && selected.stages.length > 0 ? selected.stages : DEFAULT_STAGES;
  const completedCount = displayStages.filter((s) => s.completed).length;
  const isAllCompleted = completedCount === displayStages.length || selected?.status === "COMPLETED" || selected?.status === "MARKING COMPLETE" || selected?.status === "MARKING_COMPLETE";
  const progressLinePercent = displayStages.length > 1
    ? Math.min(100, Math.max(0, ((completedCount - (isAllCompleted ? 0 : 0.5)) / (displayStages.length - 1)) * 100))
    : 0;

  return (
    <div className="space-y-4">
      {/* Top — workflow stages diagram */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-800">Exam Paper Lifecycle Progress</h2>
              {isAllCompleted && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1 border border-emerald-200">
                  ✓ 100% Completed
                </span>
              )}
            </div>
            {selected && (
              <p className="text-xs text-gray-500 mt-0.5">
                Viewing Packet: <span className="font-semibold text-gray-800">{selected.packetId}</span> — {selected.courseCode} ({selected.courseName})
              </p>
            )}
          </div>
          {selected && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Status:</span>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_BADGE[selected.status] || "bg-gray-100 text-gray-700"}`}>
                {STATUS_LABELS[selected.status] || selected.status}
              </span>
            </div>
          )}
        </div>

        {/* 9-stage horizontal stepper with dynamic progress line */}
        <div className="relative overflow-x-auto pb-3 pt-1 px-2">
          {/* Background track line */}
          <div className="absolute top-6 left-8 right-8 h-1 bg-gray-200 z-0 rounded-full" />
          {/* Active emerald filled track line */}
          <div
            className="absolute top-6 left-8 h-1 bg-emerald-500 z-0 rounded-full transition-all duration-500"
            style={{ width: `calc(${progressLinePercent}% * (100% - 4rem) / 100)` }}
          />

          <div className="flex items-start justify-between relative z-10">
            {displayStages.map((stage, i) => {
              const colors = getStageColor(stage.stageName);
              return (
                <div key={i} className="flex flex-col items-center flex-1 min-w-[85px]">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all bg-white ${
                      stage.completed
                        ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm"
                        : stage.current
                        ? `${colors.circle} ring-4 ring-purple-100 shadow-md scale-110 font-extrabold`
                        : "border-gray-200 text-gray-400"
                    }`}
                  >
                    {stage.completed ? "✓" : i + 1}
                  </div>
                  <p
                    className={`text-xs font-semibold mt-2.5 text-center leading-tight ${
                      stage.current
                        ? `${colors.label} font-bold`
                        : stage.completed
                        ? "text-emerald-700 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {stage.stageName}
                  </p>
                  <p className="text-[10px] text-gray-400 text-center mt-0.5 max-w-[85px] leading-tight line-clamp-2">
                    {stage.actor}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {isAllCompleted && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <span className="text-base">🎉</span>
            <span>All 9 workflow stages and marking are 100% finalized and safely stored.</span>
          </div>
        )}
      </div>

      {/* Bottom — active packets + detail */}
      <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[calc(100vh-320px)]">

        {/* Left — packet list */}
        <div className="w-full lg:w-84 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">

          {/* Header + search */}
          <div className="p-4 border-b border-gray-100 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Active Packets</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                {filteredPackets.length}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <span className="text-gray-400 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Search by ID or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs outline-none text-gray-600 w-full"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Packet list */}
          <div className="divide-y divide-gray-50 overflow-y-auto flex-1">
            {filteredPackets.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-xs text-gray-400">No packets match "{search}"</p>
              </div>
            ) : (
              filteredPackets.map((p, i) => {
                const total = p.totalStages || 9;
                const current = p.currentStage || 1;
                const isPktDone = p.status === "COMPLETED" || p.status === "MARKING COMPLETE" || p.status === "MARKING_COMPLETE" || current === total;
                const percent = isPktDone ? 100 : Math.min(100, Math.round((current / total) * 100));
                const isSelected = selected?.packetId === p.packetId;

                return (
                  <div
                    key={p.packetId || i}
                    onClick={() => setSelected(p)}
                    className={`p-4 cursor-pointer hover:bg-gray-50/80 transition ${
                      isSelected ? "bg-purple-50/60 border-l-4 border-[#7c4dff]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium text-gray-400">{p.packetId}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_BADGE[p.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-bold text-gray-800">{p.courseCode}</p>
                      {isPktDone && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          ✓ Done
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2.5 line-clamp-1">{p.courseName}</p>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                        <span>{isPktDone ? "All 9 Stages Completed" : `Stage ${current} of ${total}`}</span>
                        <span className={`font-semibold ${isPktDone ? "text-emerald-600" : "text-[#7c4dff]"}`}>
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isPktDone
                              ? "bg-emerald-500"
                              : "bg-gradient-to-r from-[#7c4dff] to-[#9c75ff]"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right — stage detail */}
        {selected ? (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between shrink-0 bg-slate-50/50">
              <div>
                <p className="text-xs font-semibold text-[#7c4dff] uppercase tracking-wider mb-1">{selected.packetId}</p>
                <h2 className="text-lg font-bold text-gray-900">{selected.courseName}</h2>
                <p className="text-xs text-gray-500 font-medium">{selected.courseCode}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold inline-block ${STATUS_BADGE[selected.status] || "bg-gray-100"}`}>
                  {STATUS_LABELS[selected.status] || selected.status}
                </span>
                <p className="text-[11px] text-gray-400 mt-1">
                  {isAllCompleted ? "100% Completed" : `Stage ${selected.currentStage} of ${selected.totalStages || 9}`}
                </p>
              </div>
            </div>

            {/* Stage Progress Timeline */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800">Stage Progress & History</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                  isAllCompleted
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {completedCount} of {selected.stages?.length || 9} Completed
                </span>
              </div>

              {isAllCompleted && (
                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">Exam Paper Lifecycle Completed</h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      All steps from drafting, moderation, printing, custody safe storage, student examination, through final script marking have been successfully completed.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-0">
                {selected.stages?.map((stage, i) => {
                  const colors = getStageColor(stage.stageName);
                  const isLast = i === (selected.stages.length - 1);

                  return (
                    <div key={i} className="flex gap-4">
                      {/* Circle + connecting vertical line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            stage.completed
                              ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm"
                              : stage.current
                              ? `${colors.circle} ring-4 ring-purple-100 shadow-sm`
                              : "border-gray-200 bg-white text-gray-400"
                          }`}
                        >
                          {stage.completed ? (
                            <span className="text-emerald-600 font-bold text-xs">✓</span>
                          ) : stage.current ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-current" />
                          ) : (
                            <span className="text-[11px] font-semibold text-gray-300">{i + 1}</span>
                          )}
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 flex-1 my-1 min-h-[32px] ${
                              stage.completed ? "bg-emerald-400" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`pb-6 flex-1 ${isLast ? "pb-2" : ""}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`text-sm font-bold ${
                              stage.current
                                ? colors.label
                                : stage.completed
                                ? "text-gray-900"
                                : "text-gray-400"
                            }`}
                          >
                            {stage.stageName}
                          </p>
                          {stage.completed ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                              Completed
                            </span>
                          ) : stage.current ? (
                            <span className="text-[10px] bg-purple-100 text-[#7c4dff] px-2 py-0.5 rounded-full font-semibold">
                              In Progress
                            </span>
                          ) : (
                            <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{stage.actor}</p>

                        {/* Events logged in this stage */}
                        {stage.events && stage.events.length > 0 ? (
                          <div className="space-y-1.5 bg-slate-50 rounded-xl p-3 border border-slate-100 mt-2">
                            {stage.events.map((ev, j) => (
                              <div key={j} className="flex items-start justify-between py-0.5 text-xs gap-2">
                                <p className="text-gray-700 font-medium leading-snug">{ev.message}</p>
                                <p className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">{ev.date}</p>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-gray-400">
            <p className="text-sm font-semibold text-gray-700">No Packet Selected</p>
            <p className="text-xs text-gray-400 mt-1">Select a packet from the left list to view its workflow stage progress.</p>
          </div>
        )}
      </div>
    </div>
  );
}
