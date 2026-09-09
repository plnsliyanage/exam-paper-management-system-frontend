import React, { useEffect, useState } from "react";
import {
  X,
  BookOpen,
  Clock,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  Calendar,
  FileText,
  Printer,
  MapPin,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import SchedulePrintModal from "./printing/SchedulePrintModal";

export default function PacketDetailModal({
  packetId,
  onClose,
  onStatusUpdated,
}) {
  const { getUsername } = useAuth();
  const numericId = typeof packetId === "string" && packetId.includes("-")
    ? parseInt(packetId.split("-")[2], 10)
    : packetId;

  const [packet, setPacket] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [printSchedule, setPrintSchedule] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!numericId) return;
    loadPacketData();
  }, [numericId]);

  const loadPacketData = async () => {
    try {
      setLoading(true);
      setError("");

      const packetResponse = await axiosInstance.get(`/packets/${numericId}`);
      setPacket(packetResponse.data);

      try {
        const historyResponse = await axiosInstance.get(`/packets/${numericId}/history`);
        setHistory(Array.isArray(historyResponse.data) ? historyResponse.data : []);
      } catch {
        setHistory([]);
      }

      try {
        const commentResponse = await axiosInstance.get(`/packets/${numericId}/comments`);
        setComments(Array.isArray(commentResponse.data) ? commentResponse.data : []);
      } catch {
        setComments([]);
      }

      try {
        const scheduleResponse = await axiosInstance.get(`/printing/packet/${numericId}`);
        if (scheduleResponse.data && scheduleResponse.data.scheduleId) {
          setPrintSchedule(scheduleResponse.data);
        } else {
          setPrintSchedule(null);
        }
      } catch {
        setPrintSchedule(null);
      }
    } catch (err) {
      console.error("Failed to load packet details:", err);
      setError("Failed to load packet details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await axiosInstance.post(`/packets/${numericId}/comments`, {
        comment: newComment.trim(),
      });

      setComments((prev) => [...prev, response.data]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment:", err);
      alert(err.response?.data?.message || "Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusAction = async (action) => {
    try {
      setActionLoading(true);
      await axiosInstance.put(`/packets/${numericId}/status`, { action });
      alert(action === "SUBMIT" ? "Exam paper submitted successfully for moderation!" : "Status updated successfully!");
      if (onStatusUpdated) onStatusUpdated();
      await loadPacketData();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 text-center shadow-xl">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#7c4dff] mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading packet details...</p>
        </div>
      </div>
    );
  }

  if (error || !packet) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 text-center shadow-xl max-w-sm w-full space-y-4">
          <p className="text-xs text-rose-500 font-semibold">{error || "Packet not found"}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = packet.status === "COMPLETED";
  const isDraft = packet.status === "DRAFT" || !packet.status;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm">
                Packet #{packet.packetId} Details
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7c4dff]/10 text-[#7c4dff] border border-[#7c4dff]/20">
                {packet.status || "DRAFT"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {packet.courseCode} — {packet.courseName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs max-h-[70vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Department</span>
              <span className="font-bold text-slate-700">{packet.department || "N/A"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Moderator</span>
              <span className="font-bold text-slate-700">{packet.moderatorName || "Unassigned"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Submission Deadline</span>
              <span className={`font-bold ${packet.overdue ? "text-red-500" : "text-slate-700"}`}>{packet.deadline || "N/A"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Exam Date</span>
              <span className="font-bold text-slate-700">{packet.examDate || "N/A"}</span>
            </div>
          </div>

          {/* Exam Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-slate-200 rounded-xl p-3 bg-white">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Duration</span>
              <span className="font-medium text-slate-800">{packet.duration || "—"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Marks</span>
              <span className="font-medium text-slate-800">{packet.totalMarks || "—"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Questions</span>
              <span className="font-medium text-slate-800">{packet.questions || "—"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Format</span>
              <span className="font-medium text-slate-800">{packet.format || "—"}</span>
            </div>
          </div>

          {packet.moderatorNote && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-800">
              <span className="font-bold text-amber-900 block mb-0.5">Moderator Note:</span>
              <p className="text-xs">{packet.moderatorNote}</p>
            </div>
          )}

          {/* Printing Appointment Section for APPROVED or PRINTING */}
          {(packet.status === "APPROVED" || packet.status === "PRINTING" || packet.status === "PRINTING_QUEUE") && (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-slate-400">
                <Printer className="w-3.5 h-3.5 text-[#7c4dff]" />
                Exam Printing Schedule
              </h3>
              {printSchedule ? (
                <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#7c4dff]" />
                      {printSchedule.scheduleDate} ({printSchedule.timeLabel})
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-[#7c4dff] border border-purple-200">
                      {printSchedule.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {printSchedule.location} • {printSchedule.copies || 50} Copies
                  </p>
                  {printSchedule.notes && (
                    <p className="text-[10px] text-slate-500 italic">"{printSchedule.notes}"</p>
                  )}
                  {printSchedule.status === "SCHEDULED" && (
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPrintModalOpen(true)}
                        className="text-[#7c4dff] hover:text-[#6c3de8] font-bold text-[11px] underline cursor-pointer"
                      >
                        Reschedule Time Slot
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-amber-900">Printing Slot Required</p>
                    <p className="text-[11px] text-amber-700">Please book a 30-minute time slot at the printing center.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="px-3 py-1.5 bg-[#7c4dff] hover:bg-[#6c3de8] text-white font-bold rounded-lg shadow-sm text-xs cursor-pointer shrink-0"
                  >
                    📅 Book Slot
                  </button>
                </div>
              )}
            </div>
          )}

          {/* History / Movement Timeline */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-slate-400">
              <Clock className="w-3.5 h-3.5 text-[#7c4dff]" />
              Packet History & Activity Log
            </h3>
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50 max-h-48 overflow-y-auto">
              {history.length > 0 ? (
                history.map((h, idx) => (
                  <div
                    key={h.id || idx}
                    className="flex justify-between items-start text-xs border-b border-slate-200/60 pb-2.5 last:border-none last:pb-0"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">{h.message}</span>
                      <span className="text-[11px] text-slate-500">
                        By: <strong className="text-slate-700">{h.actorName || "System"}</strong>
                        {h.stageName && <> · Stage: <span className="text-[#7c4dff] font-semibold">{h.stageName}</span></>}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-3">
                      {h.createdAt || "Recent"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic text-center py-2 text-xs">No activity logged yet.</p>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-slate-400">
              <MessageSquare className="w-3.5 h-3.5 text-[#7c4dff]" />
              Comments & Discussion ({comments.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {comments.length > 0 ? (
                comments.map((comment, idx) => (
                  <div key={comment.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between font-semibold text-slate-700 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-5 h-5 rounded-full ${comment.userColor || "bg-[#7c4dff]"} text-white text-[10px] flex items-center justify-center font-bold`}>
                          {comment.userInitials || comment.userName?.charAt(0) || "U"}
                        </span>
                        {comment.userName || "User"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {comment.createdAt || "Recently"}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1.5 text-xs pl-6">{comment.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic text-xs">No comments recorded yet.</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submittingComment}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7c4dff] text-xs"
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="px-4 py-2 bg-[#7c4dff] text-white font-semibold rounded-xl hover:bg-[#6c3de8] disabled:opacity-50 flex items-center gap-1 cursor-pointer text-xs"
              >
                {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Post
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            {isDraft ? (
              <button
                onClick={() => handleStatusAction("SUBMIT")}
                disabled={actionLoading}
                className="px-4 py-2 bg-[#7c4dff] text-white font-semibold rounded-xl hover:bg-[#6c3de8] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer text-xs shadow-sm"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Submit for Moderation
              </button>
            ) : packet.status === "APPROVED" ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-4 py-2 bg-[#7c4dff] text-white font-bold rounded-xl hover:bg-[#6c3de8] flex items-center gap-1.5 cursor-pointer text-xs shadow-sm"
                >
                  📅 {printSchedule ? "Change Slot" : "Book Print Slot"}
                </button>
                {printSchedule && (
                  <button
                    onClick={() => handleStatusAction("PRINT")}
                    disabled={actionLoading}
                    className="px-3 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer text-xs shadow-sm"
                  >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "🖨️ Proceed to Print"}
                  </button>
                )}
              </div>
            ) : packet.status === "PRINTING" ? (
              <button
                onClick={() => handleStatusAction("PAPERS_STORED")}
                disabled={actionLoading}
                className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer text-xs shadow-sm"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "📦 Store Printed Papers"}
              </button>
            ) : packet.status === "PAPERS STORED" ? (
              <button
                onClick={() => handleStatusAction("ANSWER_SHEETS_TAKEN")}
                disabled={actionLoading}
                className="px-4 py-2 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer text-xs shadow-sm"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "📑 Take Answer Sheets"}
              </button>
            ) : packet.status === "ANSWER SHEETS TAKEN" ? (
              <button
                onClick={() => handleStatusAction("MARKING")}
                disabled={actionLoading}
                className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer text-xs shadow-sm"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "✏️ Start Marking"}
              </button>
            ) : packet.status === "MARKING" ? (
              <button
                onClick={() => handleStatusAction("MARKING_COMPLETE")}
                disabled={actionLoading}
                className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer text-xs shadow-sm"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "✓ Marking Complete & Stored"}
              </button>
            ) : isCompleted || packet.status === "MARKING COMPLETE" ? (
              <div className="px-4 py-2 bg-teal-50 border border-teal-200 text-teal-700 font-bold rounded-xl flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> Marking Completed
              </div>
            ) : (
              <button
                onClick={() => handleStatusAction("MARKING_COMPLETE")}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer text-xs shadow-sm"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Mark Complete"}
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>

      {isPrintModalOpen && (
        <SchedulePrintModal
          isOpen={isPrintModalOpen}
          packet={packet}
          existingSchedule={printSchedule}
          onClose={() => setIsPrintModalOpen(false)}
          onSuccess={async () => {
            setIsPrintModalOpen(false);
            await loadPacketData();
            if (onStatusUpdated) onStatusUpdated();
          }}
        />
      )}
    </div>
  );
}
