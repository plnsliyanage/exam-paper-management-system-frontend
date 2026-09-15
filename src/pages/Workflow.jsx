import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAcademicCycle } from "../context/AcademicCycleContext";
import { useAuth } from "../context/AuthContext";

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
  "First Marking": { circle: "border-violet-500 text-violet-600 bg-violet-50", label: "text-violet-700", badge: "bg-violet-100 text-violet-800" },
  Marking: { circle: "border-violet-500 text-violet-600 bg-violet-50", label: "text-violet-700", badge: "bg-violet-100 text-violet-800" },
  "Second Marking": { circle: "border-amber-500 text-amber-600 bg-amber-50", label: "text-amber-700", badge: "bg-amber-100 text-amber-800" },
  Completed: { circle: "border-teal-500 text-teal-600 bg-teal-50", label: "text-teal-700", badge: "bg-teal-100 text-teal-800" },
  "Marking Complete": { circle: "border-teal-500 text-teal-600 bg-teal-50", label: "text-teal-700", badge: "bg-teal-100 text-teal-800" },
};

const getStageColor = (name) => {
  if (!name) return STAGE_COLORS.Drafting || DEFAULT_COLOR;
  return STAGE_COLORS[name] || STAGE_COLORS.Drafting || DEFAULT_COLOR;
};

const STATUS_BADGE = {
  PENDING: "bg-amber-100 text-amber-800 border border-amber-200",
  DRAFT: "bg-blue-100 text-blue-800 border border-blue-200",
  SUBMITTED: "bg-purple-100 text-purple-800 border border-purple-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  REJECTED: "bg-rose-100 text-rose-800 border border-rose-200",
  PRINTING: "bg-indigo-100 text-indigo-800 border border-indigo-200",
  PRINTING_QUEUE: "bg-indigo-100 text-indigo-800 border border-indigo-200",
  "PAPERS STORED": "bg-cyan-100 text-cyan-800 border border-cyan-200",
  PAPERS_STORED: "bg-cyan-100 text-cyan-800 border border-cyan-200",
  "ANSWER SHEETS TAKEN": "bg-orange-100 text-orange-800 border border-orange-200",
  ANSWER_SHEETS_TAKEN: "bg-orange-100 text-orange-800 border border-orange-200",
  FIRST_MARKING: "bg-violet-100 text-violet-800 border border-violet-200",
  "FIRST MARKING": "bg-violet-100 text-violet-800 border border-violet-200",
  MARKING: "bg-violet-100 text-violet-800 border border-violet-200",
  UNDER_MARKING: "bg-violet-100 text-violet-800 border border-violet-200",
  SECOND_MARKING: "bg-amber-100 text-amber-800 border border-amber-300 ring-2 ring-amber-100",
  "SECOND MARKING": "bg-amber-100 text-amber-800 border border-amber-300 ring-2 ring-amber-100",
  UNDER_SECOND_MARKING: "bg-amber-100 text-amber-800 border border-amber-300 ring-2 ring-amber-100",
  SECOND_MARKING_COMPLETE: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  "SECOND MARKING COMPLETE": "bg-emerald-100 text-emerald-800 border border-emerald-200",
  "MARKING COMPLETE": "bg-teal-100 text-teal-800 border border-teal-200",
  MARKING_COMPLETE: "bg-teal-100 text-teal-800 border border-teal-200",
  COMPLETED: "bg-teal-100 text-teal-800 border border-teal-200",
  UNDER_MODERATION: "bg-purple-100 text-purple-800 border border-purple-200",
  DELAYED: "bg-red-100 text-red-700 border border-red-200",
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
  FIRST_MARKING: "First Marking",
  "FIRST MARKING": "First Marking",
  MARKING: "First Marking",
  UNDER_MARKING: "First Marking",
  SECOND_MARKING: "Second Marking",
  "SECOND MARKING": "Second Marking",
  UNDER_SECOND_MARKING: "Second Marking",
  SECOND_MARKING_COMPLETE: "2nd Marking Complete",
  "SECOND MARKING COMPLETE": "2nd Marking Complete",
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
  { stageName: "First Marking", actor: "Lecturer grading", completed: false, current: false, events: [] },
  { stageName: "Second Marking", actor: "Moderator 2nd marking", completed: false, current: false, events: [] },
  { stageName: "Completed", actor: "Archived & Finalized", completed: false, current: false, events: [] },
];

export default function Workflow() {
  const navigate = useNavigate();
  const { selectedCycleId } = useAcademicCycle();
  const { getUsername, getRole } = useAuth();
  const [packets, setPackets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMessage, setActionMessage] = useState({ text: "", isError: false });

  const currentUsername = (getUsername() || "").toLowerCase();
  const currentUserRole = getRole() || "ROLE_USER";
  const isPrivileged = ["ROLE_ADMIN", "ROLE_SYSTEM_ADMIN", "ROLE_GUEST"].includes(currentUserRole);

  const filteredPackets = packets.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.packetId && p.packetId.toLowerCase().includes(q)) ||
      (p.courseCode && p.courseCode.toLowerCase().includes(q)) ||
      (p.courseName && p.courseName.toLowerCase().includes(q))
    );
  });

  const fetchWorkflow = useCallback(async (targetPacketId = null) => {
    try {
      setLoading(true);
      const cycleParam = selectedCycleId ? `?cycleId=${selectedCycleId}` : "";
      const res = await axiosInstance.get(`/workflow${cycleParam}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setPackets(list);
      if (targetPacketId) {
        const match = list.find((p) => p.packetId === targetPacketId || p.id === targetPacketId);
        setSelected(match || list[0] || null);
      } else {
        setSelected((prev) => {
          if (!prev) return list[0] || null;
          const match = list.find((p) => p.packetId === prev.packetId || (p.id && p.id === prev.id));
          return match || list[0] || null;
        });
      }
    } catch (err) {
      setError("Failed to load workflow.");
    } finally {
      setLoading(false);
    }
  }, [selectedCycleId]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  const getNumericId = (pkt) => {
    if (!pkt) return null;
    if (pkt.id) return pkt.id;
    if (typeof pkt.packetId === "string" && pkt.packetId.includes("-")) {
      const parts = pkt.packetId.split("-");
      return parseInt(parts[parts.length - 1], 10);
    }
    return pkt.packetId;
  };

  const handleAction = async (actionName, note = null) => {
    if (!selected) return;
    const targetId = getNumericId(selected);
    if (!targetId) return;

    setActionLoading(actionName);
    setActionMessage({ text: "", isError: false });

    try {
      await axiosInstance.put(`/packets/${targetId}/status`, {
        action: actionName,
        note: note,
      });
      setActionMessage({
        text: `✓ Successfully updated packet status to "${actionName.replace(/_/g, " ")}"`,
        isError: false,
      });
      await fetchWorkflow(selected.packetId);
    } catch (err) {
      setActionMessage({
        text: err.response?.data?.message || err.message || "Failed to update packet workflow stage.",
        isError: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

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

  // Actor checks for selected packet
  const isModOfSelected = selected && (
    (selected.moderatorUsername && selected.moderatorUsername.toLowerCase() === currentUsername) ||
    (selected.moderatorName && selected.moderatorName.toLowerCase() === currentUsername) ||
    currentUserRole === "ROLE_MODERATOR" ||
    isPrivileged
  );

  const isAuthorOfSelected = selected && (
    (selected.lecturerUsername && selected.lecturerUsername.toLowerCase() === currentUsername) ||
    (selected.lecturerName && selected.lecturerName.toLowerCase() === currentUsername) ||
    currentUserRole === "ROLE_USER" ||
    isPrivileged
  );

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

        {/* 10-stage horizontal stepper with dynamic progress line */}
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
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0"></span>
            <span>All 10 workflow stages and second markings are 100% finalized and safely stored.</span>
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
                const total = p.totalStages || 10;
                const current = p.currentStage || 1;
                const isPktDone = p.status === "COMPLETED" || p.status === "MARKING COMPLETE" || p.status === "MARKING_COMPLETE" || current === total;
                const percent = isPktDone ? 100 : Math.min(100, Math.round((current / total) * 100));
                const isSelected = selected?.packetId === p.packetId;

                return (
                  <div
                    key={p.packetId || i}
                    onClick={() => {
                      setSelected(p);
                      setActionMessage({ text: "", isError: false });
                    }}
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
                        <span>{isPktDone ? "All 10 Stages Completed" : `Stage ${current} of ${total}`}</span>
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

        {/* Right — stage detail & interactive actions */}
        {selected ? (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-bold text-[#7c4dff] uppercase tracking-wider">{selected.packetId}</p>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${STATUS_BADGE[selected.status] || "bg-gray-100"}`}>
                    {STATUS_LABELS[selected.status] || selected.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">{selected.courseName}</h2>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                  <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{selected.courseCode}</span>
                  {selected.lecturerName && (
                    <span className="text-purple-700 font-medium">✍️ Author: <strong className="text-gray-800">{selected.lecturerName}</strong></span>
                  )}
                  {selected.moderatorName && (
                    <span className="text-blue-700 font-medium">🔍 Moderator: <strong className="text-gray-800">{selected.moderatorName}</strong></span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button
                  onClick={() => {
                    const numId = getNumericId(selected);
                    navigate(`/packets/${numId}`);
                  }}
                  className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-[#7c4dff] hover:border-[#7c4dff] rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Open Full Packet Management Page"
                >
                  <span>📄</span> View Packet Details ↗
                </button>
              </div>
            </div>

            {/* Notification / Toast Message */}
            {actionMessage.text && (
              <div className={`mx-6 mt-4 p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                actionMessage.isError ? "bg-rose-50 border border-rose-200 text-rose-800" : "bg-emerald-50 border border-emerald-200 text-emerald-800"
              }`}>
                <span>{actionMessage.text}</span>
                <button
                  onClick={() => setActionMessage({ text: "", isError: false })}
                  className="text-gray-400 hover:text-gray-700 ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Stage Progress & History */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">

              {/* ── CONTEXTUAL INTERACTIVE WORKFLOW ACTIONS ── */}
              {/* 1. SECOND MARKING STAGE */}
              {(selected.status === "SECOND_MARKING" || selected.status === "SECOND MARKING" || selected.status === "UNDER_SECOND_MARKING") && (
                <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📝</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                          Stage 9: Second Marking Required
                        </h4>
                        <span className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                          Moderator Action
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        First marking has been completed by course lecturer ({selected.lecturerName || "Lecturer"}). As the assigned peer moderator ({selected.moderatorName || "Moderator"}), please verify mark sheets and complete the second marking stage.
                      </p>
                    </div>
                  </div>

                  {isModOfSelected ? (
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => handleAction("COMPLETE_SECOND_MARKING")}
                        disabled={!!actionLoading}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading === "COMPLETE_SECOND_MARKING" ? (
                          <span className="animate-spin text-sm">⟳</span>
                        ) : (
                          <span className="text-sm">✓</span>
                        )}
                        Complete 2nd Marking & Return to Lecturer
                      </button>

                      <button
                        onClick={() => {
                          const numId = getNumericId(selected);
                          navigate(`/packets/${numId}`);
                        }}
                        className="px-4 py-2.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        Enter Detailed Marks / Comments ↗
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-amber-100/60 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-center gap-2">
                      <span>⏳</span>
                      Awaiting assigned moderator ({selected.moderatorName || "Moderator"}) to complete second marking verification.
                    </div>
                  )}
                </div>
              )}

              {/* 2. SECOND MARKING COMPLETE -> FINALIZATION STAGE */}
              {(selected.status === "SECOND_MARKING_COMPLETE" || selected.status === "SECOND MARKING COMPLETE") && (
                <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                          Second Marking Completed — Ready for Finalization
                        </h4>
                        <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                          Lecturer Finalization
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                        Moderator ({selected.moderatorName || "Moderator"}) has reviewed and approved the second marking. Course lecturer ({selected.lecturerName || "Lecturer"}) can now finalize and securely archive the exam packet.
                      </p>
                    </div>
                  </div>

                  {isAuthorOfSelected ? (
                    <div className="pt-2">
                      <button
                        onClick={() => handleAction("COMPLETE")}
                        disabled={!!actionLoading}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading === "COMPLETE" ? (
                          <span className="animate-spin text-sm">⟳</span>
                        ) : (
                          <span className="text-sm">📦</span>
                        )}
                        Finalize & Complete Exam Packet
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-100/60 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                      <span>⏳</span>
                      Returned to course lecturer ({selected.lecturerName || "Lecturer"}) for finalization.
                    </div>
                  )}
                </div>
              )}

              {/* 3. FIRST MARKING STAGE */}
              {(selected.status === "MARKING" || selected.status === "FIRST_MARKING" || selected.status === "FIRST MARKING" || selected.status === "UNDER_MARKING") && (
                <div className="p-5 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✏️</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-purple-900 uppercase tracking-wider">
                          Stage 8: First Marking in Progress
                        </h4>
                        <span className="text-[10px] bg-purple-200/70 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                          Lecturer Grading
                        </span>
                      </div>
                      <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                        Assigned course lecturer ({selected.lecturerName || "Lecturer"}) is grading student answer sheets. When finished, submit first marking to transfer the packet to the peer moderator for second marking.
                      </p>
                    </div>
                  </div>

                  {isAuthorOfSelected ? (
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => handleAction("COMPLETE_FIRST_MARKING")}
                        disabled={!!actionLoading}
                        className="px-5 py-2.5 bg-[#7c4dff] hover:bg-[#6a3df0] text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading === "COMPLETE_FIRST_MARKING" ? (
                          <span className="animate-spin text-sm">⟳</span>
                        ) : (
                          <span className="text-sm">✓</span>
                        )}
                        Finish 1st Marking & Send to Moderator
                      </button>

                      <button
                        onClick={() => {
                          const numId = getNumericId(selected);
                          navigate(`/packets/${numId}`);
                        }}
                        className="px-4 py-2.5 bg-white border border-purple-300 text-purple-900 hover:bg-purple-100/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        Enter Marks / Scripts ↗
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-purple-100/60 border border-purple-200 rounded-xl text-xs text-purple-800 font-medium flex items-center gap-2">
                      <span>⏳</span>
                      Assigned lecturer ({selected.lecturerName || "Lecturer"}) is currently grading the paper scripts.
                    </div>
                  )}
                </div>
              )}

              {/* 4. MODERATION REVIEW STAGE */}
              {(selected.status === "SUBMITTED" || selected.status === "UNDER_MODERATION" || selected.status === "SUBMITTED_FOR_MODERATION") && (
                <div className="p-5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📋</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-purple-900 uppercase tracking-wider">
                          Stage 3: Paper Moderation Review
                        </h4>
                        <span className="text-[10px] bg-purple-200/70 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                          Moderator Action
                        </span>
                      </div>
                      <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                        Draft paper has been submitted. Moderator ({selected.moderatorName || "Moderator"}) reviews questions and approves or requests revision.
                      </p>
                    </div>
                  </div>

                  {isModOfSelected ? (
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => handleAction("APPROVE")}
                        disabled={!!actionLoading}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading === "APPROVE" ? (
                          <span className="animate-spin text-sm">⟳</span>
                        ) : (
                          <span className="text-sm">✓</span>
                        )}
                        Approve Exam Paper
                      </button>

                      <button
                        onClick={() => {
                          const numId = getNumericId(selected);
                          navigate(`/packets/${numId}`);
                        }}
                        className="px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        Review & Feedback / Reject ↗
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-purple-100/60 border border-purple-200 rounded-xl text-xs text-purple-800 font-medium flex items-center gap-2">
                      <span>⏳</span>
                      Submitted for moderation review by {selected.moderatorName || "assigned moderator"}.
                    </div>
                  )}
                </div>
              )}

              {/* 5. ALL COMPLETED BANNER */}
              {isAllCompleted && (
                <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-start gap-3 shadow-sm">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">Exam Paper Lifecycle 100% Completed</h4>
                    <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                      All 10 steps from drafting, moderation, printing, custody storage, student exam, lecturer first marking, and moderator second marking have been completed and finalized.
                    </p>
                  </div>
                </div>
              )}

              {/* Timeline Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800">Stage Progress & History</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                  isAllCompleted
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {completedCount} of {selected.stages?.length || 10} Completed
                </span>
              </div>

              {/* Timeline Items */}
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
