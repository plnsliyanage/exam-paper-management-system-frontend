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
  PENDING: { label: "Pending Start", bg: "bg-amber-50 text-amber-800 border-amber-200" },
  DRAFT: { label: "Drafting", bg: "bg-blue-50 text-blue-800 border-blue-200" },
  SUBMITTED: { label: "In Moderation", bg: "bg-purple-50 text-purple-800 border-purple-200" },
  UNDER_MODERATION: { label: "In Moderation", bg: "bg-purple-50 text-purple-800 border-purple-200" },
  APPROVED: { label: "Approved (Print)", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  REJECTED: { label: "Revision Needed", bg: "bg-rose-50 text-rose-800 border-rose-200" },
  PRINTING: { label: "Printing", bg: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  PRINTING_QUEUE: { label: "Printing", bg: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  "PAPERS STORED": { label: "Papers Stored", bg: "bg-cyan-50 text-cyan-800 border-cyan-200" },
  PAPERS_STORED: { label: "Papers Stored", bg: "bg-cyan-50 text-cyan-800 border-cyan-200" },
  "ANSWER SHEETS TAKEN": { label: "Sheets Taken", bg: "bg-orange-50 text-orange-800 border-orange-200" },
  ANSWER_SHEETS_TAKEN: { label: "Sheets Taken", bg: "bg-orange-50 text-orange-800 border-orange-200" },
  MARKING: { label: "Marking", bg: "bg-violet-50 text-violet-800 border-violet-200" },
  "MARKING COMPLETE": { label: "Completed", bg: "bg-teal-50 text-teal-800 border-teal-200" },
  MARKING_COMPLETE: { label: "Completed", bg: "bg-teal-50 text-teal-800 border-teal-200" },
  COMPLETED: { label: "Completed", bg: "bg-teal-50 text-teal-800 border-teal-200" },
  DELAYED: { label: "Delayed", bg: "bg-rose-50 text-rose-800 border-rose-200" },
};

export default function PacketCard({
  packet,
  onSelectDetail,
  onOpenMarking,
  onCompleteTask,
  onSubmitPacket,
}) {
  const statusKey = (packet.status || "").toUpperCase();
  const isCompleted = statusKey === "COMPLETED" || statusKey === "MARKING COMPLETE" || statusKey === "MARKING_COMPLETE";
  const isPending = statusKey === "PENDING";
  const isDraft = statusKey === "DRAFT";
  const isRejected = statusKey === "REJECTED";
  const isApproved = statusKey === "APPROVED";
  const isPrinting = statusKey === "PRINTING" || statusKey === "PRINTING_QUEUE";
  const isStored = statusKey === "PAPERS STORED" || statusKey === "PAPERS_STORED";
  const isSheetsTaken = statusKey === "ANSWER SHEETS TAKEN" || statusKey === "ANSWER_SHEETS_TAKEN";
  const isMarking = statusKey === "MARKING";
  const isSubmitted = statusKey === "SUBMITTED" || statusKey === "UNDER_MODERATION";
  const statusInfo = statusConfig[packet.status] || statusConfig[statusKey] || { label: packet.status || "Pending", bg: "bg-slate-100 text-slate-700 border-slate-200" };

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
      className={`p-4 border rounded-xl bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition ${isCompleted
          ? "border-emerald-200 bg-emerald-50/20"
          : isRejected
            ? "border-rose-200 bg-rose-50/10"
            : isApproved
              ? "border-emerald-100 bg-emerald-50/10"
              : isSubmitted
                ? "border-purple-100 bg-purple-50/10"
                : isStored
                  ? "border-cyan-100 bg-cyan-50/10"
                  : isSheetsTaken
                    ? "border-orange-100 bg-orange-50/10"
                    : isMarking
                      ? "border-violet-100 bg-violet-50/10"
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

        {isPending ? (
          <button
            onClick={() => onCompleteTask(packet.packetId || packet.id, "DRAFT")}
            className="px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 bg-[#7c4dff] text-white hover:bg-[#6a3df0] shadow-sm transition-colors cursor-pointer text-xs"
            title="Start Drafting Exam Paper"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Start Draft
          </button>
        ) : isDraft ? (
          <button
            onClick={() => onSubmitPacket ? onSubmitPacket(packet.packetId || packet.id) : onCompleteTask(packet.packetId || packet.id, "SUBMIT")}
            className="px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 bg-[#7c4dff] text-white hover:bg-[#6a3df0] shadow-sm transition-colors cursor-pointer text-xs"
            title="Submit Exam Paper for Moderation"
          >
            <Send className="w-3.5 h-3.5" />
            Submit
          </button>
        ) : isRejected ? (
          <button
            onClick={() => onCompleteTask(packet.packetId || packet.id, "DRAFT")}
            className="px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-colors cursor-pointer text-xs"
            title="Revise Draft"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Revise Draft
          </button>
        ) : isApproved ? (
          <button
            onClick={() => {
              window.print();
              onCompleteTask(packet.packetId || packet.id, "PRINT");
            }}
            className="px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer text-xs"
            title="Proceed to Print Paper"
          >
            🖨️ Print Paper
          </button>
        ) : isPrinting ? (
          <button
            onClick={() => onCompleteTask(packet.packetId || packet.id, "PAPERS_STORED")}
            className="px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm transition-colors cursor-pointer text-xs"
            title="Store Printed Papers"
          >
            <Check className="w-3 h-3" />
            Store Papers
          </button>
        ) : isStored ? (
          <button
            onClick={() => onCompleteTask(packet.packetId || packet.id, "ANSWER_SHEETS_TAKEN")}
            className="px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 bg-orange-600 text-white hover:bg-orange-700 shadow-sm transition-colors cursor-pointer text-xs"
            title="Take Answer Sheets from Store"
          >
            📑 Take Answer Sheets
          </button>
        ) : isSheetsTaken ? (
          <button
            onClick={() => onCompleteTask(packet.packetId || packet.id, "MARKING")}
            className="px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 bg-violet-600 text-white hover:bg-violet-700 shadow-sm transition-colors cursor-pointer text-xs"
            title="Start Marking Answer Sheets"
          >
            ✏️ Start Marking
          </button>
        ) : isMarking ? (
          <button
            onClick={() => onCompleteTask(packet.packetId || packet.id, "MARKING_COMPLETE")}
            className="px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-colors cursor-pointer text-xs"
            title="Finish Marking & Store Mark Sheets"
          >
            <Check className="w-3 h-3" />
            Complete Marking
          </button>
        ) : isCompleted ? (
          <span className="px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 bg-teal-100 text-teal-800 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        ) : (
          <span className="px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 bg-purple-100 text-purple-800 text-xs">
            <Clock className="w-3.5 h-3.5" />
            In Moderation
          </span>
        )}
      </div>
    </div>
  );
}
