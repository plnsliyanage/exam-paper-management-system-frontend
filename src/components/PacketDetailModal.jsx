import React, { useEffect, useState } from "react";
import {
  X,
  BookOpen,
  Clock,
  ShieldAlert,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { lecturerApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PacketDetailModal({
  packetId,
  onClose,
  onStatusUpdated,
}) {
  const { getUsername } = useAuth();
  const CURRENT_USER_ID = getUsername() || "1";

  const [packet, setPacket] = useState(null);
  const [movements, setMovements] = useState([]);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!packetId) return;
    loadPacket();
  }, [packetId]);

  const loadPacket = async () => {
    try {
      setLoading(true);
      setError("");

      const packetResponse = await lecturerApi.getPacketDetails(packetId);
      const packetData = packetResponse.data;
      setPacket(packetData);
      setIsCompleted(
        String(packetData?.status || "").toUpperCase() === "COMPLETED"
      );

      try {
        const movementResponse = await lecturerApi.getMovementHistory(packetId);
        setMovements(
          Array.isArray(movementResponse.data) ? movementResponse.data : []
        );
      } catch (movementError) {
        setMovements([]);
      }

      try {
        const commentResponse = await lecturerApi.getComments(packetId);
        setComments(
          Array.isArray(commentResponse.data) ? commentResponse.data : []
        );
      } catch (commentError) {
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
      const response = await lecturerApi.addComment({
        packetId: packetId,
        userId: CURRENT_USER_ID,
        commentText: newComment.trim(),
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

  const handleComplete = async () => {
    try {
      setCompleting(true);
      await lecturerApi.completeTask(packetId);
      setIsCompleted(true);
      setPacket((prev) => (prev ? { ...prev, status: "COMPLETED" } : prev));
      if (onStatusUpdated) onStatusUpdated();
      alert(`Packet ${packetId} marked as completed!`);
    } catch (err) {
      console.error("Failed to complete packet task:", err);
      alert(err.response?.data?.message || "Failed to complete task.");
    } finally {
      setCompleting(false);
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
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7c4dff]/10 text-[#7c4dff]">
                {packet.status || "PENDING"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {packet.courseCode} - {packet.courseName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
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
              <span className="font-bold text-slate-700">{packet.departmentName || "N/A"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Academic Year</span>
              <span className="font-bold text-slate-700">{packet.academicYear || 2026}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Deadline</span>
              <span className="font-bold text-slate-700">{packet.deadline || "N/A"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Assigned Lecturer</span>
              <span className="font-bold text-slate-700">{packet.currentHolderName || "Unassigned"}</span>
            </div>
          </div>

          {/* Movement History */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-slate-400">
              <Clock className="w-3.5 h-3.5 text-[#7c4dff]" />
              Packet Movement & Workflow History
            </h3>
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50 max-h-48 overflow-y-auto">
              {movements.length > 0 ? (
                movements.map((movement, idx) => (
                  <div
                    key={movement.movementId || idx}
                    className="flex justify-between items-center text-xs border-b border-slate-200/60 pb-2 last:border-none last:pb-0"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">{movement.action || "Movement"}</span>
                      <span className="text-[11px] text-slate-500">
                        From: <strong className="text-slate-700">{movement.fromUser || "System"}</strong> → To: <strong className="text-slate-700">{movement.toUser || "N/A"}</strong>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {movement.timestamp ? new Date(movement.timestamp).toLocaleString() : "N/A"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic text-center py-2 text-xs">No movements recorded yet.</p>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-slate-400">
              <MessageSquare className="w-3.5 h-3.5 text-[#7c4dff]" />
              Comments & Feedback
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {comments.length > 0 ? (
                comments.map((comment, idx) => (
                  <div key={comment.commentId || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between font-semibold text-slate-700 text-xs">
                      <span>{comment.userName || "User"}</span>
                      <span className="text-[10px] text-slate-400">
                        {comment.timestamp ? new Date(comment.timestamp).toLocaleString() : "Just now"}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1 text-xs">{comment.commentText}</p>
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
          <button
            onClick={handleComplete}
            disabled={isCompleted || completing}
            className={`px-4 py-2 font-semibold rounded-xl text-white transition-colors flex items-center gap-2 cursor-pointer text-xs ${
              isCompleted ? "bg-slate-900 cursor-not-allowed opacity-90" : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {completing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Completing...</>
            ) : isCompleted ? (
              <><CheckCircle2 className="w-4 h-4" /> Completed</>
            ) : (
              "Mark Complete"
            )}
          </button>
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
