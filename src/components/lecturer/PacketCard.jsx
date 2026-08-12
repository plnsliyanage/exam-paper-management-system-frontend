import React from "react";
import {
  CheckCircle2,
  FileText,
  CheckSquare,
  ShieldCheck,
  Eye,
  Edit3,
  Check,
} from "lucide-react";

export default function PacketCard({
  packet,
  onSelectDetail,
  onOpenMarking,
  onCompleteTask,
}) {
  const isCompleted = packet.status === "COMPLETED";

  const renderTaskBadge = (taskType) => {
    switch (taskType) {
      case "SET_PAPER":
        return (
          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1 w-fit">
            <FileText className="w-3 h-3" />
            Paper Setting
          </span>
        );
      case "MARK_SCRIPTS":
        return (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 w-fit">
            <CheckSquare className="w-3 h-3" />
            Script Marking
          </span>
        );
      case "MODERATION":
        return (
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 w-fit">
            <ShieldCheck className="w-3 h-3" />
            Moderation / Checking
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`p-4 border rounded-xl bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition ${
        isCompleted
          ? "border-emerald-200 bg-emerald-50/30 opacity-75"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {packet.courseCode}
          </span>

          {renderTaskBadge(packet.taskType)}

          {isCompleted && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Completed
            </span>
          )}
        </div>

        <h3 className="font-bold text-slate-800 text-sm">
          {packet.courseName}
        </h3>

        <p className="text-xs text-slate-400">
          Holder: {packet.currentHolder || "Not assigned"} | Deadline:{" "}
          {packet.deadline || "N/A"}
          {packet.taskType === "MARK_SCRIPTS" && (
            <>
              {" | "}Scripts:{" "}
              <span className="font-bold text-amber-600">
                {packet.scriptsCount ?? 0}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          onClick={() => onSelectDetail(packet.packetId)}
          title="View Details"
          className="p-2 hover:bg-brand-50 rounded-lg text-slate-500 hover:text-brand-600"
        >
          <Eye className="w-4 h-4" />
        </button>

        {packet.taskType === "MARK_SCRIPTS" && !isCompleted && (
          <button
            onClick={() => onOpenMarking(packet)}
            title="Enter Marks"
            className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => !isCompleted && onCompleteTask(packet.packetId)}
          disabled={isCompleted}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
            isCompleted
              ? "bg-slate-900 text-white cursor-not-allowed"
              : "bg-rose-600 text-white hover:bg-rose-700"
          }`}
        >
          <Check className="w-3 h-3" />
          {isCompleted ? "Completed" : "Complete"}
        </button>
      </div>
    </div>
  );
}
