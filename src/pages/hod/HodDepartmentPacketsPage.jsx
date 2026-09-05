import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Clock,
  MessageSquare,
  Send,
  User,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Edit3,
  Printer,
  ChevronRight,
} from "lucide-react";
import { hodApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const TABS = [
  { key: "ALL", label: "All Packets" },
  { key: "PENDING", label: "Pending" },
  { key: "DRAFT", label: "In Draft" },
  { key: "SUBMITTED", label: "Under Moderation" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected / Revision" },
  { key: "PRINTING", label: "Printing" },
  { key: "PAPERS STORED", label: "Papers Stored" },
  { key: "ANSWER SHEETS TAKEN", label: "Sheets Taken" },
  { key: "MARKING", label: "Marking" },
  { key: "COMPLETED", label: "Completed" },
  { key: "OVERDUE", label: "Overdue" },
];

const STATUS_CONFIG = {
  PENDING: { label: "Pending", bg: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400" },
  DRAFT: { label: "Draft", bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  SUBMITTED: { label: "Under Moderation", bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  APPROVED: { label: "Approved", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  REJECTED: { label: "Changes Requested", bg: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  PRINTING: { label: "Printing", bg: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  "PAPERS STORED": { label: "Papers Stored", bg: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
  PAPERS_STORED: { label: "Papers Stored", bg: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
  "ANSWER SHEETS TAKEN": { label: "Sheets Taken", bg: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  ANSWER_SHEETS_TAKEN: { label: "Sheets Taken", bg: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  MARKING: { label: "Marking", bg: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  UNDER_MARKING: { label: "Marking", bg: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  "MARKING COMPLETE": { label: "Marking Complete", bg: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
  MARKING_COMPLETE: { label: "Marking Complete", bg: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
  COMPLETED: { label: "Completed", bg: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
};

export default function HodDepartmentPacketsPage({ deptId = "ALL" }) {
  const { getUsername } = useAuth();
  const username = getUsername() || "HOD";

  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedPacketId, setSelectedPacketId] = useState(null);
  const [packetDetail, setPacketDetail] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [activeModalTab, setActiveModalTab] = useState("details");
  const [detailLoading, setDetailLoading] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    loadPackets();
  }, [deptId]);

  const loadPackets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await hodApi.getDepartmentPackets(deptId);
      setPackets(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load department packets.");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (packet) => {
    const rawId = packet.id || packet.packetId;
    setSelectedPacketId(rawId);
    setDetailLoading(true);
    setActiveModalTab("details");
    try {
      const [detailRes, commentRes] = await Promise.all([
        hodApi.getPacketDetails(rawId),
        hodApi.getPacketComments(rawId),
      ]);
      setPacketDetail(detailRes.data || detailRes);
      setComments(Array.isArray(commentRes.data) ? commentRes.data : Array.isArray(commentRes) ? commentRes : []);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !selectedPacketId) return;
    setPostingComment(true);
    try {
      const res = await hodApi.addComment({
        packetId: selectedPacketId,
        commentText: newComment.trim(),
      });
      setComments((prev) => [...prev, res.data || {
        id: Date.now(),
        comment: newComment.trim(),
        authorName: username,
        createdAt: "Just now",
      }]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setPostingComment(false);
    }
  };

  const tabCounts = useMemo(() => {
    const counts = { ALL: packets.length, OVERDUE: 0 };
    TABS.forEach((t) => {
      if (t.key !== "ALL" && t.key !== "OVERDUE") {
        counts[t.key] = 0;
      }
    });

    packets.forEach((p) => {
      const st = (p.status || "PENDING").toUpperCase();
      if (st === "COMPLETED" || st === "MARKING COMPLETE" || st === "MARKING_COMPLETE") {
        counts["COMPLETED"] = (counts["COMPLETED"] || 0) + 1;
      } else if (st === "PAPERS STORED" || st === "PAPERS_STORED") {
        counts["PAPERS STORED"] = (counts["PAPERS STORED"] || 0) + 1;
      } else if (st === "ANSWER SHEETS TAKEN" || st === "ANSWER_SHEETS_TAKEN") {
        counts["ANSWER SHEETS TAKEN"] = (counts["ANSWER SHEETS TAKEN"] || 0) + 1;
      } else if (st === "PRINTING" || st === "PRINTING_QUEUE") {
        counts["PRINTING"] = (counts["PRINTING"] || 0) + 1;
      } else if (counts[st] !== undefined) {
        counts[st]++;
      }
      if (p.overdue || p.isOverdue) {
        counts.OVERDUE++;
      }
    });

    return counts;
  }, [packets]);

  const filteredPackets = useMemo(() => {
    return packets.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        String(p.packetId || "").toLowerCase().includes(q) ||
        (p.courseCode || "").toLowerCase().includes(q) ||
        (p.courseName || "").toLowerCase().includes(q) ||
        (p.lecturerName || "").toLowerCase().includes(q) ||
        (p.moderatorName || "").toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (statusFilter === "ALL") return true;
      if (statusFilter === "OVERDUE") return p.overdue || p.isOverdue;

      const st = (p.status || "PENDING").toUpperCase();
      if (statusFilter === "COMPLETED") {
        return ["COMPLETED", "MARKING COMPLETE", "MARKING_COMPLETE"].includes(st);
      }
      if (statusFilter === "PAPERS STORED") {
        return ["PAPERS STORED", "PAPERS_STORED"].includes(st);
      }
      if (statusFilter === "ANSWER SHEETS TAKEN") {
        return ["ANSWER SHEETS TAKEN", "ANSWER_SHEETS_TAKEN"].includes(st);
      }
      if (statusFilter === "PRINTING") {
        return ["PRINTING", "PRINTING_QUEUE"].includes(st);
      }
      return st === statusFilter.toUpperCase();
    });
  }, [packets, searchQuery, statusFilter]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Department Exam Packets</h1>
          <p className="text-slate-500 text-xs mt-1">
            Track and oversee all course units and exam packets in your department across each workflow phase.
          </p>
        </div>

        <button
          onClick={loadPackets}
          className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm cursor-pointer font-semibold text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {TABS.map((tab) => {
          const isActive = statusFilter === tab.key;
          const count = tabCounts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-[#7c4dff] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by course code, title, lecturer, or moderator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7c4dff]/20 text-xs text-slate-800"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
          Showing {filteredPackets.length} of {packets.length}
        </span>
      </div>

      {/* Packets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#7c4dff]" />
            <span>Loading department packets...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-50 border border-rose-200 text-rose-600 font-semibold">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Packet / Course</th>
                  <th className="py-3 px-4">Lecturer</th>
                  <th className="py-3 px-4">Moderator</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPackets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      No matching exam packets found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredPackets.map((pkt) => {
                    const statusKey = (pkt.status || "PENDING").toUpperCase();
                    const statusMeta = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;
                    return (
                      <tr key={pkt.id || pkt.packetId} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block text-xs">
                            {pkt.courseCode}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {pkt.courseName}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium text-xs">
                          {pkt.lecturerName || "Unassigned"}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">
                          {pkt.moderatorName || "Unassigned"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">
                          <span className="font-medium">{pkt.deadline || "N/A"}</span>
                          {pkt.overdue && (
                            <span className="ml-1.5 px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[9px] font-bold">
                              Overdue
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              pkt.priority === "HIGH"
                                ? "bg-rose-50 text-rose-700"
                                : pkt.priority === "MEDIUM"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {pkt.priority || "NORMAL"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openDetail(pkt)}
                            className="px-3 py-1.5 bg-[#7c4dff]/10 text-[#7c4dff] hover:bg-[#7c4dff]/20 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ml-auto text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Packet Detail Modal */}
      {selectedPacketId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-[#7c4dff] uppercase tracking-wider">
                  Department Examination Packet
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {packetDetail?.courseCode} - {packetDetail?.courseName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPacketId(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-white border border-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-100 px-5 bg-slate-50/50">
              {[
                { id: "details", label: "Packet Info" },
                { id: "comments", label: `Notes & Communication (${comments.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveModalTab(tab.id)}
                  className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition ${
                    activeModalTab === tab.id
                      ? "border-[#7c4dff] text-[#7c4dff]"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
              {detailLoading ? (
                <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#7c4dff]" />
                  <span>Loading packet details...</span>
                </div>
              ) : activeModalTab === "details" && packetDetail ? (
                <div className="space-y-4">
                  {/* Status & Priority Overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                      <span className="font-bold text-[#7c4dff] text-xs">{packetDetail.status}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Priority</span>
                      <span className="font-bold text-slate-800 text-xs">{packetDetail.priority || "NORMAL"}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Duration</span>
                      <span className="font-bold text-slate-800 text-xs">{packetDetail.duration || "3 Hours"}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Marks</span>
                      <span className="font-bold text-slate-800 text-xs">{packetDetail.totalMarks || "100"}</span>
                    </div>
                  </div>

                  {/* Staff Assignments */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100">
                      <span className="text-[10px] text-blue-600 font-bold uppercase block">Assigned Lecturer</span>
                      <p className="font-bold text-slate-900 mt-0.5 text-xs">
                        {packetDetail.lecturerName || "Unassigned"}
                      </p>
                    </div>
                    <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100">
                      <span className="text-[10px] text-purple-600 font-bold uppercase block">Assigned Moderator</span>
                      <p className="font-bold text-slate-900 mt-0.5 text-xs">
                        {packetDetail.moderatorName || "Unassigned"}
                      </p>
                    </div>
                  </div>

                  {/* Deadlines */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Drafting Deadline</span>
                      <p className="font-semibold text-slate-800 mt-0.5 text-xs">
                        {packetDetail.deadline || "Not Scheduled"}
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Moderation Deadline</span>
                      <p className="font-semibold text-slate-800 mt-0.5 text-xs">
                        {packetDetail.moderationDeadline || "Not Scheduled"}
                      </p>
                    </div>
                  </div>

                  {/* Moderator Note if any */}
                  {packetDetail.moderatorNote && (
                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
                      <span className="text-[10px] font-bold uppercase block text-amber-700">Moderator Remarks</span>
                      <p className="mt-1 text-xs">{packetDetail.moderatorNote}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {comments.length === 0 ? (
                      <p className="text-slate-400 italic text-center py-6">
                        No comments or instructions recorded yet.
                      </p>
                    ) : (
                      comments.map((c, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800">{c.authorName || c.userName || "Staff"}</span>
                            <span className="text-[10px] text-slate-400">{c.createdAt || ""}</span>
                          </div>
                          <p className="text-slate-600 text-xs leading-relaxed">{c.comment || c.commentText}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="Add HOD instruction or memo..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7c4dff]/20 text-xs text-slate-800"
                    />
                    <button
                      onClick={handlePostComment}
                      disabled={postingComment || !newComment.trim()}
                      className="px-4 py-2 bg-[#7c4dff] text-white rounded-xl font-bold hover:bg-[#6c3de8] disabled:opacity-50 transition cursor-pointer text-xs flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
