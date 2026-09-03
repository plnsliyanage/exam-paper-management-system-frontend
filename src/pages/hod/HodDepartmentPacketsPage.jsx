import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { hodApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

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
  const [activeTab, setActiveTab] = useState("details");
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
      setPackets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load department packets.");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (packetId) => {
    setSelectedPacketId(packetId);
    setDetailLoading(true);
    setActiveTab("details");
    try {
      const [detailRes, commentRes] = await Promise.all([
        hodApi.getPacketDetails(packetId),
        hodApi.getPacketComments(packetId),
      ]);
      setPacketDetail(detailRes.data);
      setComments(Array.isArray(commentRes.data) ? commentRes.data : []);
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
        userId: username,
        commentText: newComment.trim(),
      });
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setPostingComment(false);
    }
  };

  const filteredPackets = packets.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      String(p.packetId || "").toLowerCase().includes(q) ||
      (p.courseCode || "").toLowerCase().includes(q) ||
      (p.courseName || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL" ||
      (p.status || "").toUpperCase() === statusFilter.toUpperCase();

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Department Exam Packets</h1>
          <p className="text-slate-500 text-xs mt-1">
            Track and search all examination packets in your faculty.
          </p>
        </div>

        <button
          onClick={loadPackets}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm cursor-pointer font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by packet, course code or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7c4dff]/20 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs text-slate-700 cursor-pointer font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="APPROVED">Approved</option>
          </select>
        </div>
      </div>

      {/* Packets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading packets...</div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-50 border border-rose-200 text-rose-600">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Packet ID</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Cycle</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Current Holder</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPackets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400">
                      No matching exam packets found.
                    </td>
                  </tr>
                ) : (
                  filteredPackets.map((pkt) => (
                    <tr key={pkt.packetId} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        #{pkt.packetId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block text-xs">{pkt.courseCode}</span>
                        <span className="text-[11px] text-slate-400">{pkt.courseName}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        {pkt.cycleId || "2026"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pkt.status === "COMPLETED" || pkt.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {pkt.status || "PENDING"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {pkt.currentHolderName || "Unassigned"}
                        {pkt.isOverdue && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[9px] font-bold">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {pkt.deadline || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openDetail(pkt.packetId)}
                          className="px-2.5 py-1.5 bg-[#7c4dff]/10 text-[#7c4dff] hover:bg-[#7c4dff]/20 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ml-auto text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPacketId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Packet #{selectedPacketId} Overview</h3>
              <button onClick={() => setSelectedPacketId(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex border-b border-slate-100 px-4 bg-slate-50/50">
              {["details", "history", "comments"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-4 text-xs font-bold capitalize border-b-2 cursor-pointer transition ${
                    activeTab === tab ? "border-[#7c4dff] text-[#7c4dff]" : "border-transparent text-slate-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5 overflow-y-auto flex-1 text-xs">
              {detailLoading ? (
                <div className="text-center py-8 text-slate-400">Loading details...</div>
              ) : activeTab === "details" && packetDetail ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Course</span>
                    <span className="font-bold text-slate-800">{packetDetail.courseCode} - {packetDetail.courseName}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                    <span className="font-bold text-[#7c4dff]">{packetDetail.status}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Holder</span>
                    <span className="font-bold text-slate-800">{packetDetail.currentHolderName}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Deadline</span>
                    <span className="font-bold text-slate-800">{packetDetail.deadline}</span>
                  </div>
                </div>
              ) : activeTab === "history" ? (
                <div className="space-y-2">
                  {(packetDetail?.movementHistory || []).map((m, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800 block">{m.action}</span>
                        <span className="text-[11px] text-slate-500">{m.fromUserName} → {m.toUserName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{m.timestamp ? new Date(m.timestamp).toLocaleDateString() : ""}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {comments.map((c, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between font-semibold text-slate-700">
                          <span>{c.userName}</span>
                          <span className="text-[10px] text-slate-400">{c.timestamp ? new Date(c.timestamp).toLocaleString() : ""}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{c.commentText}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add note..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl outline-none text-xs"
                    />
                    <button
                      onClick={handlePostComment}
                      disabled={postingComment}
                      className="px-4 py-1.5 bg-[#7c4dff] text-white rounded-xl font-bold hover:bg-[#6c3de8] cursor-pointer text-xs"
                    >
                      Post
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
