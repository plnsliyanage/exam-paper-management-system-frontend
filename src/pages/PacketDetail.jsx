import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const statusColors = {
  PENDING: "bg-amber-100 text-amber-800 border border-amber-200",
  DRAFT: "bg-blue-100 text-blue-800 border border-blue-200",
  SUBMITTED: "bg-purple-100 text-purple-800 border border-purple-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  REJECTED: "bg-rose-100 text-rose-800 border border-rose-200",
  PRINTING: "bg-indigo-100 text-indigo-800 border border-indigo-200",
  PRINTING_QUEUE: "bg-indigo-100 text-indigo-800 border border-indigo-200",
  "PAPERS STORED": "bg-cyan-100 text-cyan-800 border border-cyan-200",
  "ANSWER SHEETS TAKEN": "bg-orange-100 text-orange-800 border border-orange-200",
  MARKING: "bg-violet-100 text-violet-800 border border-violet-200",
  "MARKING COMPLETE": "bg-teal-100 text-teal-800 border border-teal-200",
  COMPLETED: "bg-teal-100 text-teal-800 border border-teal-200",
  UNDER_MODERATION: "bg-purple-100 text-purple-800 border border-purple-200",
  DELAYED: "bg-red-100 text-red-700 border border-red-200",
};

const statusLabels = {
  PENDING: "Pending Drafting",
  DRAFT: "Drafting",
  SUBMITTED: "Submitted for Moderation",
  APPROVED: "Approved (Ready to Print)",
  REJECTED: "Rejected (Revision Needed)",
  PRINTING: "Printing in Progress",
  PRINTING_QUEUE: "Printing in Progress",
  "PAPERS STORED": "Papers Stored in Safe",
  "ANSWER SHEETS TAKEN": "Answer Sheets Taken",
  MARKING: "Marking in Progress",
  "MARKING COMPLETE": "Marking Complete & Stored",
  COMPLETED: "Completed",
  UNDER_MODERATION: "Submitted for Moderation",
  DELAYED: "Delayed",
};

const priorityColors = {
  HIGH: "text-yellow-500",
  MEDIUM: "text-yellow-500",
  LOW: "text-green-500",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function getInitials(name) {
  if (!name) return "??";
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

const avatarColors = [
  "bg-blue-500", "bg-purple-500", "bg-green-500",
  "bg-yellow-500", "bg-red-500", "bg-pink-500",
];

export default function PacketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRole, getUsername } = useAuth();
  const role = getRole();
  const username = getUsername();

  // Packet state
  const [packet, setPacket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Status action state
  const [actionLoading, setActionLoading] = useState("");
  const [noteModal, setNoteModal] = useState(null);
  const [note, setNote] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState("overview");
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [history, setHistory] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);

  const canUpdateStatus = ["ROLE_ADMIN", "ROLE_MODERATOR", "ROLE_GUEST", "ROLE_USER"].includes(role);

  // ── Fetch packet on mount ──
  useEffect(() => {
    fetchPacket();
  }, [id]);

  // ── Fetch tab data when tab changes ──
  useEffect(() => {
    if (activeTab === "comments") loadComments();
    if (activeTab === "attachments") loadAttachments();
    if (activeTab === "history") loadHistory();
  }, [activeTab]);

  const fetchPacket = async () => {
    try {
      const res = await axiosInstance.get(`/packets/${id}`);
      setPacket(res.data);
    } catch (err) {
      setError("Failed to load packet details.");
    } finally {
      setLoading(false);
    }
  };

  // ── Status actions ──
  const handleAction = async (action, actionNote = "") => {
    setActionLoading(action);
    try {
      const res = await axiosInstance.put(`/packets/${id}/status`, {
        action, note: actionNote,
      });
      setPacket(res.data);
      setSuccessMsg(
        action === "APPROVE" ? "Packet approved successfully." :
          action === "RETURN" ? "Packet returned for revision." :
            action === "SUBMIT" || action === "SUBMITTED" ? "Packet submitted for moderation successfully." :
              action === "COMPLETE" || action === "COMPLETED" ? "Packet marked as completed." :
                "Packet status updated."
      );
      setTimeout(() => setSuccessMsg(""), 3000);
      if (activeTab === "history") {
        loadHistory();
      }
    } catch (err) {
      setError("Failed to update status.");
    } finally {
      setActionLoading("");
      setNoteModal(null);
      setNote("");
    }
  };

  // ── Comments ──
  const loadComments = async () => {
    setTabLoading(true);
    try {
      const res = await axiosInstance.get(`/packets/${id}/comments`);
      setComments(res.data);
    } finally {
      setTabLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const res = await axiosInstance.post(`/packets/${id}/comments`, {
        comment: newComment,
      });
      setComments(prev => [...prev, res.data]);
      setNewComment("");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    await axiosInstance.delete(`/packets/comments/${commentId}`);
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  // ── Attachments ──
  const loadAttachments = async () => {
    setTabLoading(true);
    try {
      const res = await axiosInstance.get(`/packets/${id}/attachments`);
      setAttachments(res.data);
    } finally {
      setTabLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosInstance.post(`/packets/${id}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setAttachments(prev => [res.data, ...prev]);
  };

  const handleDeleteAttachment = async (attachmentId) => {
    await axiosInstance.delete(`/packets/attachments/${attachmentId}`);
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  // ── History ──
  const loadHistory = async () => {
    setTabLoading(true);
    try {
      const res = await axiosInstance.get(`/packets/${id}/history`);
      setHistory(res.data);
    } finally {
      setTabLoading(false);
    }
  };

  // ── Guards ──
  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Loading...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-400 text-sm">
      {error}
    </div>
  );

  if (!packet) return null;

  const participants = [
    { name: packet.lecturerName, role: "Lecturer", colorIndex: 0 },
    { name: packet.moderatorName, role: "Moderator", colorIndex: 1 },
  ];

  return (
    <div className="space-y-4">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/packets")}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#7c4dff] bg-white border border-gray-200 hover:border-[#7c4dff] rounded-lg px-4 py-2 transition"
        >
          ← Back to Packets
        </button>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${statusColors[packet.status]}`}>
            {statusLabels[packet.status] || packet.status}
          </span>
          <span className={`text-sm font-semibold ${priorityColors[packet.priority]}`}>
            ● {packet.priority.charAt(0) + packet.priority.slice(1).toLowerCase()} Priority
          </span>
        </div>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          ✓ {successMsg}
        </div>
      )}

      <div className="flex gap-4">

        {/* ── Left — main content ── */}
        <div className="flex-1 space-y-4">

          {/* Header card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-[#7c4dff] font-semibold mb-1">{packet.packetId}</p>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{packet.courseName}</h1>
            <p className="text-sm text-gray-400 mb-5">
              {packet.courseCode} · {packet.department}
            </p>
            <hr className="border-gray-100 mb-5" />
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "LECTURER", value: packet.lecturerName },
                { label: "MODERATOR", value: packet.moderatorName },
                { label: "DEADLINE", value: formatDate(packet.deadline), overdue: packet.overdue },
                { label: "EXAM DATE", value: formatDate(packet.examDate) },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400 font-semibold tracking-wide mb-1">{item.label}</p>
                  <p className={`text-sm font-medium ${item.overdue ? "text-red-500" : "text-gray-700"}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs + content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

            {/* Tab headers */}
            <div className="flex border-b border-gray-100 px-6">
              {[
                { key: "overview", label: "Overview" },
                { key: "comments", label: `Comments${comments.length > 0 ? ` (${comments.length})` : ""}` },
                { key: "attachments", label: "Attachments" },
                { key: "history", label: "History" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-sm py-4 mr-6 transition ${activeTab === tab.key
                    ? "font-medium text-[#7c4dff] border-b-2 border-[#7c4dff]"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">

              {/* ── OVERVIEW ── */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700">Exam Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Duration", value: packet.duration },
                      { label: "Total Marks", value: packet.totalMarks },
                      { label: "Questions", value: packet.questions },
                      { label: "Format", value: packet.format },
                    ].map((item) => (
                      <div key={item.label} className="border border-gray-100 rounded-xl p-4">
                        <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                        <p className="text-sm font-medium text-gray-700">{item.value || "—"}</p>
                      </div>
                    ))}
                  </div>
                  {packet.moderatorNote && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3">
                      <span className="text-yellow-500 mt-0.5">⚠</span>
                      <div>
                        <p className="text-xs font-semibold text-yellow-700 mb-1">Moderator Note</p>
                        <p className="text-sm text-yellow-800">{packet.moderatorNote}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── COMMENTS ── */}
              {activeTab === "comments" && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#7c4dff] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {username?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#7c4dff] focus:ring-1 focus:ring-[#7c4dff] resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleAddComment}
                          disabled={commentLoading || !newComment.trim()}
                          className="px-4 py-1.5 bg-[#7c4dff] text-white text-sm rounded-lg hover:bg-[#6a3df0] disabled:opacity-50 transition"
                        >
                          {commentLoading ? "Posting..." : "Post Comment"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {comments.length > 0 && <hr className="border-gray-100" />}

                  {tabLoading ? (
                    <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-2xl mb-2">💬</p>
                      <p className="text-sm text-gray-400">No comments yet. Be the first to comment.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((c) => (
                        <div key={c.id} className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full ${c.authorColor} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                            {c.authorInitials}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-800">{c.authorName}</p>
                                <p className="text-xs text-gray-400">{c.createdAt}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="text-gray-300 hover:text-red-400 text-sm transition"
                              >
                                🗑
                              </button>
                            </div>
                            <div className="bg-gray-50 rounded-xl px-4 py-3">
                              <p className="text-sm text-gray-700">{c.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── ATTACHMENTS ── */}
              {activeTab === "attachments" && (
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#7c4dff] hover:bg-purple-50 transition">
                    <p className="text-2xl mb-1">📎</p>
                    <p className="text-sm font-medium text-gray-600">Click to upload file</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, Word, Images up to 10MB</p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                    />
                  </label>

                  {tabLoading ? (
                    <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
                  ) : attachments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-2xl mb-2">📂</p>
                      <p className="text-sm text-gray-400">No attachments yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {attachments.map((a) => {
                        const icon =
                          a.fileType?.includes("pdf") ? "📄" :
                            a.fileType?.includes("word") || a.fileType?.includes("document") ? "📝" :
                              a.fileType?.includes("image") ? "🖼" : "📎";
                        return (
                          <div key={a.id} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                            <span className="text-2xl">{icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{a.fileName}</p>
                              <p className="text-xs text-gray-400">
                                {a.fileSize} · Uploaded by {a.uploadedBy} · {a.uploadedAt}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={`http://localhost:8080${a.downloadUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#7c4dff] hover:underline text-sm font-medium"
                              >

                                Download
                              </a>
                              <button
                                onClick={() => handleDeleteAttachment(a.id)}
                                className="text-gray-300 hover:text-red-400 transition"
                              >
                                🗑
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── HISTORY ── */}
              {activeTab === "history" && (
                <div>
                  {tabLoading ? (
                    <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
                  ) : history.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-2xl mb-2">📋</p>
                      <p className="text-sm text-gray-400">No history yet for this packet.</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {history.map((h, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full ${h.actorColor || "bg-gray-300"} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                              {h.actorInitials || "?"}
                            </div>
                            {i < history.length - 1 && (
                              <div className="w-px flex-1 bg-gray-100 my-1 min-h-4" />
                            )}
                          </div>
                          <div className="pb-5 flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                {h.stageName && (
                                  <span className="text-xs font-semibold text-[#7c4dff] uppercase tracking-wide">
                                    {h.stageName.replace("_", " ")}
                                  </span>
                                )}
                                <p className="text-sm text-gray-700 mt-0.5">{h.message}</p>
                                {h.actorName && (
                                  <p className="text-xs text-gray-400 mt-0.5">{h.actorName}</p>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 ml-4 whitespace-nowrap shrink-0">
                                {h.createdAt}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="w-80 space-y-4">

          {/* Update Status */}
          {canUpdateStatus && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Actions & Status</h3>
              <div className="space-y-3">

                {/* ── Lecturer Controls ── */}
                {role === "ROLE_USER" && (
                  <>
                    {packet.status === "PENDING" && (
                      <div className="space-y-2">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                          📌 Exam packet assigned to you. Click below to begin preparing the exam paper.
                        </div>
                        <button
                          onClick={() => handleAction("DRAFT")}
                          disabled={!!actionLoading}
                          className="w-full bg-[#7c4dff] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#6c3ce8] transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                        >
                          {actionLoading === "DRAFT" ? <span className="animate-spin">⟳</span> : "✏️"} Start Drafting Paper
                        </button>
                      </div>
                    )}

                    {packet.status === "DRAFT" && (
                      <div className="space-y-2">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                          📝 Drafting in progress. When questions & attachments are ready, submit for moderation.
                        </div>
                        <button
                          onClick={() => handleAction("SUBMIT")}
                          disabled={!!actionLoading}
                          className="w-full bg-[#7c4dff] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#6c3ce8] transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                        >
                          {actionLoading === "SUBMIT" ? <span className="animate-spin">⟳</span> : "📤"} Submit for Moderation
                        </button>
                      </div>
                    )}

                    {(packet.status === "SUBMITTED" || packet.status === "UNDER_MODERATION") && (
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center space-y-1">
                        <span className="text-xl">📋</span>
                        <p className="text-xs font-semibold text-purple-800">Submitted for Moderation</p>
                        <p className="text-[11px] text-purple-600">Awaiting review and approval from the assigned moderator.</p>
                      </div>
                    )}

                    {packet.status === "REJECTED" && (
                      <div className="space-y-3">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                          <p className="font-semibold flex items-center gap-1">⚠️ Paper Returned for Revision</p>
                          {packet.moderatorNote && (
                            <p className="text-red-700 bg-white/70 p-2 rounded border border-red-200 mt-1 italic">
                              "{packet.moderatorNote}"
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction("DRAFT")}
                            disabled={!!actionLoading}
                            className="flex-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl py-2.5 text-xs font-semibold hover:bg-amber-100 transition disabled:opacity-50"
                          >
                            ✏️ Edit Draft
                          </button>
                          <button
                            onClick={() => handleAction("SUBMIT")}
                            disabled={!!actionLoading}
                            className="flex-1 bg-[#7c4dff] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#6c3ce8] transition disabled:opacity-50"
                          >
                            📤 Resubmit
                          </button>
                        </div>
                      </div>
                    )}

                    {packet.status === "APPROVED" && (
                      <div className="space-y-2">
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                          🎉 Exam paper approved by moderator! You can now proceed to print.
                        </div>
                        <button
                          onClick={() => {
                            window.print();
                            handleAction("PRINT");
                          }}
                          disabled={!!actionLoading}
                          className="w-full bg-emerald-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                        >
                          {actionLoading === "PRINT" ? <span className="animate-spin">⟳</span> : "🖨️"} Proceed to Print Paper
                        </button>
                      </div>
                    )}

                    {(packet.status === "PRINTING" || packet.status === "PRINTING_QUEUE") && (
                      <div className="space-y-2">
                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800">
                          🖨️ Exam paper is currently printing. Once printing is complete, store the papers in secure custody.
                        </div>
                        <button
                          onClick={() => handleAction("PAPERS_STORED")}
                          disabled={!!actionLoading}
                          className="w-full bg-cyan-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-cyan-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                        >
                          {actionLoading === "PAPERS_STORED" ? <span className="animate-spin">⟳</span> : "📦"} Store Printed Papers
                        </button>
                      </div>
                    )}

                    {packet.status === "PAPERS STORED" && (
                      <div className="space-y-2">
                        <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-xs text-cyan-800">
                          📦 Printed exam papers are safely stored in custody awaiting the exam. After the exam is conducted, retrieve the student answer scripts from the store.
                        </div>
                        <button
                          onClick={() => handleAction("ANSWER_SHEETS_TAKEN")}
                          disabled={!!actionLoading}
                          className="w-full bg-orange-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-orange-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                        >
                          {actionLoading === "ANSWER_SHEETS_TAKEN" ? <span className="animate-spin">⟳</span> : "📑"} Take Answer Sheets from Store
                        </button>
                      </div>
                    )}

                    {packet.status === "ANSWER SHEETS TAKEN" && (
                      <div className="space-y-2">
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-800">
                          📑 Answer sheets have been retrieved from storage. Click below to begin evaluating and marking.
                        </div>
                        <button
                          onClick={() => handleAction("MARKING")}
                          disabled={!!actionLoading}
                          className="w-full bg-purple-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                        >
                          {actionLoading === "MARKING" ? <span className="animate-spin">⟳</span> : "✏️"} Start Marking Answer Sheets
                        </button>
                      </div>
                    )}

                    {packet.status === "MARKING" && (
                      <div className="space-y-2">
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800">
                          ✏️ Answer sheet marking is in progress. Once marking is finalized, store the mark sheets securely in the department.
                        </div>
                        <button
                          onClick={() => handleAction("MARKING_COMPLETE")}
                          disabled={!!actionLoading}
                          className="w-full bg-teal-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-teal-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                        >
                          {actionLoading === "MARKING_COMPLETE" ? <span className="animate-spin">⟳</span> : "✓"} Finish Marking & Store Mark Sheets
                        </button>
                      </div>
                    )}

                    {(packet.status === "MARKING COMPLETE" || packet.status === "COMPLETED") && (
                      <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-center space-y-1">
                        <span className="text-xl">✅</span>
                        <p className="text-xs font-semibold text-teal-800">Marking Complete & Stored</p>
                        <p className="text-[11px] text-teal-600">All examination workflow stages, marking, and custody storage finalized.</p>
                      </div>
                    )}
                  </>
                )}

                {/* ── Moderator Controls ── */}
                {role === "ROLE_MODERATOR" && (
                  <>
                    {(packet.status === "PENDING" || packet.status === "DRAFT") && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                        <span className="text-xl">⏳</span>
                        <p className="text-xs font-semibold text-slate-700">Drafting in Progress</p>
                        <p className="text-[11px] text-slate-500">
                          The assigned lecturer is preparing the draft paper. You will be able to review and approve once submitted.
                        </p>
                      </div>
                    )}

                    {(packet.status === "SUBMITTED" || packet.status === "UNDER_MODERATION") && (
                      <div className="space-y-2">
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 font-medium">
                          📋 Paper submitted for your review. Please evaluate questions and make your decision.
                        </div>
                        <button
                          onClick={() => handleAction("APPROVE")}
                          disabled={!!actionLoading}
                          className="w-full bg-emerald-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                        >
                          {actionLoading === "APPROVE" ? <span className="animate-spin">⟳</span> : "✓"} Approve Exam Paper
                        </button>
                        <button
                          onClick={() => setNoteModal("REJECT")}
                          disabled={!!actionLoading}
                          className="w-full bg-rose-50 text-rose-700 border border-rose-200 rounded-xl py-3 text-sm font-semibold hover:bg-rose-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          ✕ Reject / Request Revision
                        </button>
                      </div>
                    )}

                    {packet.status === "APPROVED" && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                        <span className="text-xl">✓</span>
                        <p className="text-xs font-semibold text-emerald-800">You Approved This Paper</p>
                        <p className="text-[11px] text-emerald-600">The paper has cleared moderation and moved to printing.</p>
                      </div>
                    )}

                    {packet.status === "REJECTED" && (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-1">
                        <span className="text-xl">⚠️</span>
                        <p className="text-xs font-semibold text-rose-800">Paper Rejected</p>
                        <p className="text-[11px] text-rose-600">Waiting for lecturer to revise and resubmit.</p>
                      </div>
                    )}

                    {(packet.status === "PRINTING" || packet.status === "PRINTING_QUEUE" || packet.status === "COMPLETED") && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                        <p className="text-xs font-semibold text-slate-700">Stage: {statusLabels[packet.status] || packet.status}</p>
                      </div>
                    )}
                  </>
                )}

                {/* ── AR / Admin & HOD Controls ── */}
                {["ROLE_ADMIN", "ROLE_GUEST"].includes(role) && (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600">
                      Current: <span className="font-semibold text-slate-800">{statusLabels[packet.status] || packet.status}</span>
                    </div>

                    {(packet.status === "SUBMITTED" || packet.status === "UNDER_MODERATION" || packet.status === "PENDING") && (
                      <>
                        <button
                          onClick={() => handleAction("APPROVE")}
                          disabled={!!actionLoading}
                          className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl py-2.5 text-xs font-semibold hover:bg-emerald-100 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {actionLoading === "APPROVE" ? <span className="animate-spin">⟳</span> : "✓"} Approve Packet
                        </button>
                        <button
                          onClick={() => setNoteModal("REJECT")}
                          disabled={!!actionLoading}
                          className="w-full bg-rose-50 text-rose-700 border border-rose-200 rounded-xl py-2.5 text-xs font-semibold hover:bg-rose-100 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          ✕ Reject / Return
                        </button>
                      </>
                    )}

                    {(packet.status === "APPROVED" || packet.status === "PRINTING" || packet.status === "PRINTING_QUEUE") && (
                      <button
                        onClick={() => handleAction("COMPLETE")}
                        disabled={!!actionLoading}
                        className="w-full bg-teal-600 text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-teal-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {actionLoading === "COMPLETE" ? <span className="animate-spin">⟳</span> : "✓"} Mark as Completed
                      </button>
                    )}

                    {(packet.status === "REJECTED" || packet.status === "PENDING") && (
                      <button
                        onClick={() => handleAction("DRAFT")}
                        disabled={!!actionLoading}
                        className="w-full bg-blue-50 text-blue-700 border border-blue-200 rounded-xl py-2.5 text-xs font-semibold hover:bg-blue-100 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        ✏️ Switch to Draft
                      </button>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Timeline</h3>
            <div className="space-y-3">
              {[
                { label: "Submission Deadline", date: packet.deadline },
                { label: "Moderation Deadline", date: packet.moderationDeadline },
                { label: "Exam Date", date: packet.examDate },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-gray-700">
                    {item.date
                      ? new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                      : "—"}
                  </p>
                </div>
              ))}
            </div>
            {packet.deadline && (
              <p className="text-xs text-[#7c4dff] mt-4">
                {packet.overdue
                  ? "⚠ Submission deadline has passed"
                  : `${Math.ceil((new Date(packet.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days remaining until submission deadline`}
              </p>
            )}
          </div>

          {/* Participants */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Participants</h3>
            <div className="space-y-3">
              {participants.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${avatarColors[p.colorIndex]} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                    {getInitials(p.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              {noteModal === "RETURN" ? "Return for Revision" : "Reject Packet"}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {noteModal === "RETURN"
                ? "Provide a reason for returning this packet."
                : "Provide a reason for rejecting this packet."}
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter reason (optional)..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#7c4dff] focus:ring-1 focus:ring-[#7c4dff] mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setNoteModal(null); setNote(""); }}
                className="px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(noteModal, note)}
                disabled={!!actionLoading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition ${noteModal === "RETURN"
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-red-500 hover:bg-red-600"
                  }`}
              >
                {actionLoading ? "Processing..." : noteModal === "RETURN" ? "Return" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}