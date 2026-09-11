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
  CheckCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const statusConfig = {
  PENDING: { label: "Pending Start", bg: "bg-amber-50 text-amber-800 border-amber-200" },
  DRAFT: { label: "Drafting", bg: "bg-blue-50 text-blue-800 border-blue-200" },
  SUBMITTED: { label: "In Moderation", bg: "bg-purple-50 text-purple-800 border-purple-200" },
  UNDER_MODERATION: { label: "In Moderation", bg: "bg-purple-50 text-purple-800 border-purple-200" },
  SUBMITTED_FOR_MODERATION: { label: "In Moderation", bg: "bg-purple-50 text-purple-800 border-purple-200" },
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
  onOpenSchedulePrint,
}) {
  const { getUsername } = useAuth();
  const currentUsername = (getUsername() || "").toLowerCase();
  const isModOfPacket = (packet.moderatorUsername && packet.moderatorUsername.toLowerCase() === currentUsername) ||
                        (packet.moderatorName && packet.moderatorName.toLowerCase() === currentUsername);
  const isAuthorOfPacket = (packet.lecturerUsername && packet.lecturerUsername.toLowerCase() === currentUsername) ||
                           (packet.lecturerName && packet.lecturerName.toLowerCase() === currentUsername) ||
                           !isModOfPacket;

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
  const isSubmitted = statusKey === "SUBMITTED" || statusKey === "UNDER_MODERATION" || statusKey === "SUBMITTED_FOR_MODERATION";
  const statusInfo = statusConfig[packet.status] || statusConfig[statusKey] || { label: packet.status || "Pending", bg: "bg-slate-100 text-slate-700 border-slate-200" };

  return (
    <div
      className={`p-4 border rounded-xl bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition ${isCompleted
          ? "border-emerald-200 bg-emerald-50/20"
          : isRejected
            ? "border-rose-200 bg-rose-50/10"
            : isApproved
              ? "border-emerald-100 bg-emerald-50/10"
              : isSubmitted
                ? isModOfPacket ? "border-purple-300 bg-purple-50/30 ring-1 ring-purple-200" : "border-purple-100 bg-purple-50/10"
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

          {/* Context Role Badge */}
          {isModOfPacket ? (
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 w-fit">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              Moderator
            </span>
          ) : (
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1 w-fit">
              <FileText className="w-3 h-3 text-purple-600" />
              Author (Lecturer)
            </span>
          )}

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${statusInfo.bg}`}>
            {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : isSubmitted ? <Clock className="w-3 h-3" /> : null}
            {statusInfo.label}
          </span>
        </div>

        <h3 className="font-bold text-slate-800 text-sm">
          {packet.courseName}
        </h3>

        <p className="text-xs text-slate-400">
          {isModOfPacket ? (
            <>Author: <span className="text-slate-700 font-medium">{packet.lecturerName || "Unassigned"}</span></>
          ) : (
            <>Moderator: <span className="text-slate-700 font-medium">{packet.moderatorName || "Unassigned"}</span></>
          )}
          {" | "}Deadline: <span className={packet.overdue ? "text-red-500 font-semibold" : "text-slate-600"}>{packet.deadline || "N/A"}</span>
          {packet.taskType === "MARK_SCRIPTS" && isAuthorOfPacket && (
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

        {/* ── MODERATOR SPECIFIC ACTIONS ── */}
        {isModOfPacket ? (
          isSubmitted ? (
            <button
              onClick={() => onSelectDetail(packet.packetId || packet.id)}
              className="px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition-colors cursor-pointer text-xs animate-pulse"
              title="Review Exam Paper & Approve/Reject"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Review & Decide
            </button>
          ) : isApproved ? (
            <span className="px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approved by You
            </span>
          ) : isDraft || isPending ? (
            <span className="px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 bg-slate-50 text-slate-500 border border-slate-200 text-xs">
              <Clock className="w-3 h-3" />
              Author Preparing
            </span>
          ) : isRejected ? (
            <span className="px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs">
              Awaiting Revision
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 bg-slate-100 text-slate-700 text-xs">
              {statusInfo.label}
            </span>
          )
        ) : (
          /* ── AUTHOR SPECIFIC ACTIONS ── */
          <>
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
                onClick={() => onOpenSchedulePrint ? onOpenSchedulePrint(packet) : onSelectDetail(packet.packetId || packet.id)}
                className="px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 bg-[#7c4dff] text-white hover:bg-[#6a3df0] shadow-sm transition-colors cursor-pointer text-xs"
                title="Book 30-minute Printing Slot"
              >
                📅 Book Print Slot
              </button>
            ) : isPrinting ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenSchedulePrint ? onOpenSchedulePrint(packet) : onSelectDetail(packet.packetId || packet.id)}
                  className="px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 bg-purple-50 text-[#7c4dff] border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer text-xs"
                  title="View or Reschedule Printing Slot"
                >
                  📅 Slot Info
                </button>
                <button
                  onClick={() => onCompleteTask(packet.packetId || packet.id, "PAPERS_STORED")}
                  className="px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm transition-colors cursor-pointer text-xs"
                  title="Store Printed Papers in Safe Custody"
                >
                  📦 Store Papers
                </button>
              </div>
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
          </>
        )}
      </div>
    </div>
  );
}
