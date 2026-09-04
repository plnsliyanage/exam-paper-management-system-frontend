import React from "react";
import {
  CheckCircle2,
  FileText,
  CheckSquare,
  ShieldCheck,
  Eye,
  Edit3,
  Check,
  Send,
  Clock,
} from "lucide-react";

const statusConfig = {
  DRAFT: { label: "Draft", bg: "bg-gray-100 text-gray-600 border-gray-200" },
  PENDING: { label: "Submitted", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  SUBMITTED: { label: "Submitted", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  UNDER_MODERATION: { label: "Under Moderation", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { label: "Approved", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PRINTING_QUEUE: { label: "Printing Queue", bg: "bg-purple-50 text-purple-700 border-purple-200" },
  COMPLETED: { label: "Completed", bg: "bg-teal-50 text-teal-700 border-teal-200" },
  DELAYED: { label: "Delayed", bg: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function PacketCard({
  packet,
  onSelectDetail,
  onOpenMarking,
  onCompleteTask,
  onSubmitPacket,
}) {
  const isCompleted = packet.status === "COMPLETED";
  const isDraft = packet.status === "DRAFT" || !packet.status;
  const isSubmitted = packet.status === "PENDING" || packet.status === "SUBMITTED" || packet.status === "UNDER_MODERATION";
  const statusInfo = statusConfig[packet.status] || { label: packet.status || "Draft", bg: "bg-slate-100 text-slate-700 border-slate-200" };

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
            Moderation
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1 w-fit">
            <FileText className="w-3 h-3" />
            Paper Setting
          </span>
        );
    }
  };

  return (
    <div
      className={`p-4 border rounded-xl bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition ${
        isCompleted
          ? "border-emerald-200 bg-emerald-50/30 opacity-75"
          : isSubmitted
          ? "border-blue-100 hover:border-blue-200"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {packet.courseCode}
          </span>

          <span className="text-[10px] font-semibold text-[#7c4dff] bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
            {packet.packetId}
          </span>

          {renderTaskBadge(packet.taskType)}

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${statusInfo.bg}`}>
            {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : isSubmitted ? <Clock className="w-3 h-3" /> : null}
            {statusInfo.label}
          </span>
        </div>

        <h3 className="font-bold text-slate-800 text-sm">
          {packet.courseName}
        </h3>

        <p className="text-xs text-slate-400">
          Moderator: <span className="text-slate-600 font-medium">{packet.moderatorName || "Not assigned"}</span>
          {" | "}Deadline: <span className={packet.overdue ? "text-red-500 font-semibold" : "text-slate-600"}>{packet.deadline || "N/A"}</span>
          {packet.taskType === "MARK_SCRIPTS" && (
            <>
              {" | "}Scripts:{" "}
              <span className="font-bold text-amber-600">
                {packet.scriptsCount ?? packet.totalScripts ?? 0}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          onClick={() => onSelectDetail(packet.packetId || packet.id)}
          title="View Details"
          className="p-2 hover:bg-[#7c4dff]/10 rounded-lg text-slate-500 hover:text-[#7c4dff] transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4" />
        </button>

        {packet.taskType === "MARK_SCRIPTS" && !isCompleted && (
          <button
            onClick={() => onOpenMarking(packet)}
            title="Enter Marks"
            className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}

        {isDraft ? (
          <button
            onClick={() => onSubmitPacket ? onSubmitPacket(packet.packetId || packet.id) : onCompleteTask(packet.packetId || packet.id, "SUBMIT")}
            className="px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 bg-[#7c4dff] text-white hover:bg-[#6a3df0] shadow-sm transition-colors cursor-pointer text-xs"
            title="Submit Exam Paper for Moderation"
          >
            <Send className="w-3.5 h-3.5" />
            Submit
          </button>
        ) : isCompleted ? (
          <span className="px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        ) : (
          <button
            onClick={() => onCompleteTask && onCompleteTask(packet.packetId || packet.id, "COMPLETE")}
            className="px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
            title="Mark as Completed"
          >
            <Check className="w-3 h-3" />
            Complete
          </button>
        )}
      </div>
    </div>
  );
}
