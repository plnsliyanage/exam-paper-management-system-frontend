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
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

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
            ) : (
              <button
                onClick={() => handleStatusAction("COMPLETE")}
                disabled={isCompleted || actionLoading}
                className={`px-4 py-2 font-semibold rounded-xl text-white transition-colors flex items-center gap-2 cursor-pointer text-xs ${
                  isCompleted ? "bg-slate-900 cursor-not-allowed opacity-90" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {actionLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                ) : isCompleted ? (
                  <><CheckCircle2 className="w-4 h-4" /> Completed</>
                ) : (
                  "Mark Complete"
                )}
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
    </div>
  );
}
