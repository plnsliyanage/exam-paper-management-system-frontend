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

export default function PacketDetailModal({
  packetId,
  onClose,
  onStatusUpdated,
}) {
  // =========================================================
  // TEMPORARY USER ID
  // LOGIN IS NOT IMPLEMENTED YET
  // =========================================================
  const CURRENT_USER_ID = "U1";

  // =========================================================
  // STATE
  // =========================================================

  const [packet, setPacket] = useState(null);
  const [movements, setMovements] = useState([]);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // =========================================================
  // LOAD PACKET WHEN packetId CHANGES
  // =========================================================

  useEffect(() => {
    if (!packetId) {
      return;
    }

    loadPacket();
  }, [packetId]);

  // =========================================================
  // LOAD PACKET DETAILS
  // =========================================================

  const loadPacket = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading packet:", packetId);

      // =====================================================
      // 1. PACKET DETAILS
      // =====================================================

      const packetResponse = await lecturerApi.getPacketDetails(packetId);

      console.log("Packet response:", packetResponse.data);

      const packetData = packetResponse.data;

      setPacket(packetData);

      setIsCompleted(
        String(packetData?.status || "").toUpperCase() === "COMPLETED",
      );

      // =====================================================
      // 2. MOVEMENT HISTORY
      // =====================================================

      try {
        const movementResponse = await lecturerApi.getMovementHistory(packetId);

        console.log("Movement response:", movementResponse.data);

        setMovements(
          Array.isArray(movementResponse.data) ? movementResponse.data : [],
        );
      } catch (movementError) {
        console.error("Movement history error:", movementError);
        setMovements([]);
      }

      // =====================================================
      // 3. COMMENTS
      // =====================================================

      try {
        const commentsResponse = await lecturerApi.getComments(packetId);

        console.log("Comments response:", commentsResponse.data);

        setComments(
          Array.isArray(commentsResponse.data) ? commentsResponse.data : [],
        );
      } catch (commentsError) {
        console.error("Comments error:", commentsError);

        setComments(
          Array.isArray(packetData?.comments) ? packetData.comments : [],
        );
      }
    } catch (err) {
      console.error("Error loading packet:", err);

      if (err.response) {
        if (err.response.status === 404) {
          setError(`Packet ${packetId} was not found.`);
        } else if (err.response.status === 403) {
          setError("You are not authorized to view this packet.");
        } else if (err.response.status === 500) {
          setError(
            err.response.data?.message ||
              err.response.data?.error ||
              "Backend server error while loading packet.",
          );
        } else {
          setError(
            err.response.data?.message ||
              err.response.data?.error ||
              "Failed to load packet.",
          );
        }
      } else if (err.request) {
        setError(
          "Cannot connect to the backend. Make sure Spring Boot is running on port 8080.",
        );
      } else {
        setError(err.message || "Failed to load packet.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD COMMENTS ONLY
  // =========================================================

  const loadComments = async () => {
    if (!packetId) {
      return;
    }

    try {
      const response = await lecturerApi.getComments(packetId);

      console.log("Reloaded comments:", response.data);

      setComments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  };

  // =========================================================
  // ADD COMMENT
  // =========================================================

  const handleAddComment = async (event) => {
    event.preventDefault();

    if (!newComment.trim()) {
      return;
    }

    if (!packet) {
      return;
    }

    try {
      setSubmittingComment(true);

      // =====================================================
      // ALWAYS USE U1
      // LOGIN HAS NOT BEEN IMPLEMENTED
      // =====================================================

      const userId = CURRENT_USER_ID;

      console.log("Current user ID:", userId);

      // =====================================================
      // REQUEST BODY
      // =====================================================

      const data = {
        packetId: packet.packetId || packetId,
        userId: "U1",
        commentText: newComment.trim(),
      };

      console.log("Sending comment:", data);

      // =====================================================
      // SEND COMMENT
      // =====================================================

      const response = await lecturerApi.addComment(data);

      console.log("Comment created:", response.data);

      // =====================================================
      // UPDATE UI
      // =====================================================

      if (response.data) {
        setComments((previous) => [...previous, response.data]);
      }

      setNewComment("");

      // =====================================================
      // RELOAD FROM DATABASE
      // =====================================================

      await loadComments();
    } catch (err) {
      console.error("Error adding comment:", err);
      console.error("Backend response:", err.response?.data);

      const backendMessage =
        err.response?.data?.message || err.response?.data?.error;

      alert(
        backendMessage ||
          "Failed to add comment. Check the Spring Boot console.",
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  // =========================================================
  // COMPLETE TASK
  // =========================================================

  const handleComplete = async () => {
    if (!packet) {
      return;
    }

    if (isCompleted) {
      return;
    }

    try {
      setCompleting(true);

      console.log("Completing packet:", packet.packetId);

      await lecturerApi.completeTask(packet.packetId);

      setIsCompleted(true);

      setPacket((previous) => ({
        ...previous,
        status: "COMPLETED",
      }));

      if (onStatusUpdated) {
        onStatusUpdated(packet.packetId);
      }

      try {
        const movementResponse = await lecturerApi.getMovementHistory(
          packet.packetId,
        );

        setMovements(
          Array.isArray(movementResponse.data) ? movementResponse.data : [],
        );
      } catch (movementError) {
        console.error("Failed to reload movements:", movementError);
      }
    } catch (err) {
      console.error("Complete task error:", err);

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to complete packet.",
      );
    } finally {
      setCompleting(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-3 text-xs">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />

          <p className="text-slate-500 font-medium">
            Loading packet details...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !packet) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full text-xs space-y-4">
          <div className="flex items-center gap-2 text-rose-600 font-bold">
            <ShieldAlert className="w-5 h-5" />

            <span>Error Loading Packet</span>
          </div>

          <p className="text-slate-600">{error || "Packet was not found."}</p>

          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN MODAL
  // =========================================================

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-xs">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {packet.courseCode || packet.course?.courseCode || "Course"}

                {": "}

                {packet.courseName ||
                  packet.course?.courseName ||
                  "Course Name"}
              </h2>

              <p className="text-[11px] text-slate-400">
                Packet ID: {packet.packetId}
                {" | "}
                Semester: {packet.semester || "N/A"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================================================= */}
        {/* BODY */}
        {/* ================================================= */}

        <div className="p-6 space-y-6">
          {/* ================================================= */}
          {/* INFORMATION */}
          {/* ================================================= */}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">Department</span>

              <span className="font-bold text-slate-800 mt-0.5 block">
                {packet.department || packet.departmentName || "N/A"}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">Current Status</span>

              <span className="font-bold text-brand-600 mt-0.5 block">
                {isCompleted ? "COMPLETED" : packet.status || "N/A"}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">Current Holder</span>

              <span className="font-bold text-slate-800 mt-0.5 block">
                {packet.currentHolder || packet.currentHolderName || "N/A"}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">Deadline</span>

              <span className="font-bold text-rose-600 mt-0.5 block">
                {packet.deadline || "N/A"}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">Answer Scripts</span>

              <span className="font-bold text-slate-800 mt-0.5 block">
                {packet.scriptsCount ?? packet.totalScripts ?? 0} Scripts
              </span>
            </div>
          </div>

          {/* ================================================= */}
          {/* MOVEMENT HISTORY */}
          {/* ================================================= */}

          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-slate-400">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              Packet Movement & Workflow History
            </h3>

            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50 max-h-60 overflow-y-auto">
              {movements.length > 0 ? (
                movements.map((movement, index) => (
                  <div
                    key={movement.movementId || movement.id || index}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs border-b border-slate-200/60 pb-3 last:border-none last:pb-0 gap-1 sm:gap-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0" />

                      <div>
                        <span className="font-bold text-slate-800 block">
                          {movement.action ||
                            movement.status ||
                            movement.movementType ||
                            "Movement"}
                        </span>

                        <span className="text-[11px] text-slate-500">
                          From:{" "}
                          <strong className="text-slate-700">
                            {movement.fromUser ||
                              movement.fromUserName ||
                              "System"}
                          </strong>
                          {" → To: "}
                          <strong className="text-slate-700">
                            {movement.toUser || movement.toUserName || "N/A"}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium bg-white px-2 py-1 rounded-lg border border-slate-100">
                      {movement.timestamp
                        ? new Date(movement.timestamp).toLocaleString()
                        : movement.createdAt
                          ? new Date(movement.createdAt).toLocaleString()
                          : "N/A"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic text-center py-2">
                  No movement history recorded yet for this packet.
                </p>
              )}

              {isCompleted && (
                <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />

                    <span className="font-bold text-slate-700">
                      Marked Completed
                    </span>
                  </div>

                  <span className="text-slate-500 font-medium">Completed</span>
                </div>
              )}
            </div>
          </div>

          {/* ================================================= */}
          {/* COMMENTS */}
          {/* ================================================= */}

          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-slate-400">
              <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
              Comments & Feedback
            </h3>

            {/* ================================================= */}
            {/* COMMENT LIST */}
            {/* ================================================= */}

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div
                    key={comment.commentId || comment.id || index}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>
                        {comment.userName || comment.userId || "User"}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {comment.timestamp
                          ? new Date(comment.timestamp).toLocaleString()
                          : comment.createdAt
                            ? new Date(comment.createdAt).toLocaleString()
                            : "Just now"}
                      </span>
                    </div>

                    <p className="text-slate-600 mt-1">
                      {comment.commentText || ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">
                  No comments recorded yet.
                </p>
              )}
            </div>

            {/* ================================================= */}
            {/* ADD COMMENT */}
            {/* ================================================= */}

            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Write a comment or feedback..."
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                disabled={submittingComment}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100"
              />

              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="px-4 py-2 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {submittingComment ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Posting
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Post
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleComplete}
            disabled={isCompleted || completing}
            className={`px-4 py-2 font-semibold rounded-xl text-white transition-colors flex items-center gap-2 ${
              isCompleted
                ? "bg-slate-900 cursor-not-allowed opacity-90"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {completing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Completing...
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </>
            ) : (
              "Complete"
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
