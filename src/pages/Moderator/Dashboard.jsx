import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import {
  MdAccessTime,
  MdCheckCircle,
  MdReplay,
  MdBookmarkBorder,
  MdVisibility,
  MdCheck,
  MdClose,
} from "react-icons/md";

const DEFAULT_CHECKLIST = [
  "Exam paper format follows university template",
  "All questions are clearly worded and unambiguous",
  "Marking scheme totals are correct",
  "Difficulty distribution is appropriate",
  "Learning outcomes are adequately covered",
  "No plagiarism or copyright issues detected",
];

export default function ModeratorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPacket, setSelectedPacket] = useState(null);

  // Checklist state map: { packetId: { [index]: boolean } }
  const [checklistState, setChecklistState] = useState({});
  const [feedbackText, setFeedbackText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/dashboard/moderator/summary");
      setData(res.data);

      if (res.data.pendingPackets && res.data.pendingPackets.length > 0) {
        // Retain selected packet if still in list, or select first
        setSelectedPacket((prev) => {
          if (!prev) return res.data.pendingPackets[0];
          const found = res.data.pendingPackets.find((p) => p.id === prev.id);
          return found || res.data.pendingPackets[0];
        });
      } else {
        setSelectedPacket(null);
      }
    } catch (err) {
      console.error("Failed to load moderator dashboard data:", err);
      setError("Failed to load moderator dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCheck = (index) => {
    if (!selectedPacket) return;
    const pId = selectedPacket.id;
    setChecklistState((prev) => {
      const current = prev[pId] || {};
      return {
        ...prev,
        [pId]: {
          ...current,
          [index]: !current[index],
        },
      };
    });
  };

  const isChecklistChecked = (index) => {
    if (!selectedPacket) return false;
    return !!(checklistState[selectedPacket.id] && checklistState[selectedPacket.id][index]);
  };

  const handleAction = async (actionType) => {
    if (!selectedPacket) return;

    if ((actionType === "RETURN" || actionType === "REJECT") && !feedbackText.trim()) {
      setActionMessage({
        text: "Please provide review feedback before returning or rejecting the packet.",
        type: "error",
      });
      setTimeout(() => setActionMessage({ text: "", type: "" }), 4000);
      return;
    }

    setActionLoading(true);
    try {
      await axiosInstance.put(`/packets/${selectedPacket.id}/status`, {
        action: actionType,
        note: feedbackText.trim(),
      });

      const actionLabel =
        actionType === "APPROVE"
          ? "approved"
          : actionType === "RETURN"
          ? "returned for revision"
          : "rejected";

      setActionMessage({
        text: `Packet ${selectedPacket.packetId} (${selectedPacket.courseCode}) has been ${actionLabel}.`,
        type: "success",
      });
      setFeedbackText("");

      // Refresh data
      await fetchDashboardData();
    } catch (err) {
      console.error("Action error:", err);
      setActionMessage({
        text: "Failed to update packet status. Please try again.",
        type: "error",
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMessage({ text: "", type: "" }), 4000);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-72 text-gray-400 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c4dff] mr-3"></div>
        Loading Moderator Dashboard...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-red-400 text-sm">
        <p>{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-2 bg-[#7c4dff] text-white rounded-lg text-xs hover:bg-[#6a3df0]"
        >
          Retry
        </button>
      </div>
    );
  }

  const { kpis, pendingPackets, recentReviews } = data || {
    kpis: { pendingReview: 0, approvedToday: 0, returned: 0, totalReviewed: 0 },
    pendingPackets: [],
    recentReviews: [],
  };

  return (
    <div className="space-y-5">
      {/* Action Toast / Banner */}
      {actionMessage.text && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm transition ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage({ text: "", type: "" })}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── TOP KPI ROW (4 Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending Review */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <MdAccessTime size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {kpis.pendingReview}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Pending Review
            </p>
          </div>
        </div>

        {/* Card 2: Approved Today */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <MdCheckCircle size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {kpis.approvedToday}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Approved Today
            </p>
          </div>
        </div>

        {/* Card 3: Returned */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <MdReplay size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {kpis.returned}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Returned</p>
          </div>
        </div>

        {/* Card 4: Total Reviewed */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <MdBookmarkBorder size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {kpis.totalReviewed}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Total Reviewed
            </p>
          </div>
        </div>
      </div>

      {/* ── MIDDLE SPLIT SECTION (Pending Reviews + Active Workspace) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Pending Reviews (5 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Pending Reviews</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {pendingPackets.length} packets awaiting review
            </p>
          </div>

          <div className="divide-y divide-gray-50 max-h-[580px] overflow-y-auto">
            {pendingPackets.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-xs">
                <MdCheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">All caught up!</p>
                <p className="text-gray-400 mt-0.5">No packets awaiting review.</p>
              </div>
            ) : (
              pendingPackets.map((pkt) => {
                const isSelected = selectedPacket && selectedPacket.id === pkt.id;
                const priorityColor =
                  pkt.priority === "High"
                    ? "text-red-500"
                    : pkt.priority === "Medium"
                    ? "text-amber-500"
                    : "text-emerald-500";

                return (
                  <div
                    key={pkt.id}
                    onClick={() => {
                      setSelectedPacket(pkt);
                      setFeedbackText(pkt.moderatorNote || "");
                    }}
                    className={`p-4 cursor-pointer transition relative ${
                      isSelected
                        ? "bg-rose-50/40 border-l-4 border-rose-400"
                        : "hover:bg-gray-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-gray-400 font-medium">
                        {pkt.packetId}
                      </span>
                      <span className={`font-semibold flex items-center gap-1 ${priorityColor}`}>
                        ● {pkt.priority}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      {pkt.courseCode}
                    </p>
                    <p className="text-xs text-gray-700 font-medium truncate">
                      {pkt.courseName}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      by {pkt.lecturerName}
                    </p>

                    <div className="flex items-center justify-end mt-2">
                      <span className="text-[11px] text-red-500 font-medium">
                        Due: {pkt.deadline}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Review Workspace (7 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          {selectedPacket ? (
            <>
              {/* Workspace Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">
                    {selectedPacket.packetId}
                  </p>
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">
                    {selectedPacket.courseName}
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedPacket.courseCode} · by {selectedPacket.lecturerName}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/packets/${selectedPacket.id}`)}
                  className="bg-white border border-gray-200 text-gray-700 hover:text-[#7c4dff] hover:border-[#7c4dff] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <MdVisibility size={16} /> View Full Packet
                </button>
              </div>

              {/* Info Strip (Submitted, Deadline, Priority) */}
              <div className="bg-gray-50/80 rounded-xl p-4 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 font-medium mb-1">Submitted</p>
                  <p className="font-bold text-gray-800">
                    {selectedPacket.submittedDate}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-1">Deadline</p>
                  <p className="font-bold text-gray-800">
                    {selectedPacket.deadline}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-1">Priority</p>
                  <p className="font-bold text-gray-800">
                    {selectedPacket.priority}
                  </p>
                </div>
              </div>

              {/* Moderation Checklist */}
              <div>
                <h3 className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-wider">
                  Moderation Checklist
                </h3>
                <div className="space-y-2.5">
                  {DEFAULT_CHECKLIST.map((itemText, idx) => {
                    const checked = isChecklistChecked(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleCheck(idx)}
                        className="flex items-center gap-3 cursor-pointer select-none group"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition shrink-0 ${
                            checked
                              ? "bg-[#0f172a] border-[#0f172a] text-white"
                              : "bg-white border-gray-300 group-hover:border-gray-400"
                          }`}
                        >
                          {checked && <MdCheck size={12} />}
                        </div>
                        <span
                          className={`text-xs ${
                            checked
                              ? "text-gray-900 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          {itemText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Feedback Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-800 mb-2 uppercase tracking-wider">
                  Review Feedback
                </h3>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Provide detailed feedback for the lecturer (required for return/rejection)..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#7c4dff] focus:ring-1 focus:ring-[#7c4dff] resize-none bg-white text-gray-800 placeholder:text-gray-400"
                />
              </div>

              {/* 3 Bottom Action Buttons */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {/* Approve Button (Green) */}
                <button
                  onClick={() => handleAction("APPROVE")}
                  disabled={actionLoading}
                  className="bg-[#dcfce7] text-[#166534] hover:bg-[#bbf7d0] py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  <MdCheck size={16} /> Approve
                </button>

                {/* Return Button (Yellow) */}
                <button
                  onClick={() => handleAction("RETURN")}
                  disabled={actionLoading}
                  className="bg-[#fef9c3] text-[#854d0e] hover:bg-[#fef08a] py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  <MdReplay size={16} /> Return
                </button>

                {/* Reject Button (Red) */}
                <button
                  onClick={() => handleAction("REJECT")}
                  disabled={actionLoading}
                  className="bg-[#fee2e2] text-[#991b1b] hover:bg-[#fecaca] py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  <MdClose size={16} /> Reject
                </button>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-gray-400 text-xs">
              <p className="text-sm font-semibold text-gray-700">No Packet Selected</p>
              <p className="text-gray-400 mt-1">Select a packet from the pending list to review.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM SECTION: RECENT REVIEWS ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Recent Reviews</h2>

        <div className="space-y-3">
          {recentReviews.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">
              No recent moderation reviews recorded yet.
            </p>
          ) : (
            recentReviews.map((rev, i) => {
              const isReturn = rev.iconType === "RETURN";
              const isApprove = rev.iconType === "APPROVE";
              const isReject = rev.iconType === "REJECT";

              const iconBg = isReturn
                ? "bg-amber-50 text-amber-600"
                : isApprove
                ? "bg-emerald-50 text-emerald-600"
                : isReject
                ? "bg-rose-50 text-rose-600"
                : "bg-blue-50 text-blue-600";

              const statusColor = isReturn
                ? "text-amber-700"
                : isApprove
                ? "text-emerald-700"
                : isReject
                ? "text-rose-700"
                : "text-blue-700";

              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/70 transition border border-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
                    >
                      {isReturn ? (
                        <MdReplay size={14} />
                      ) : isApprove ? (
                        <MdCheckCircle size={14} />
                      ) : (
                        <MdAccessTime size={14} />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 mr-2">
                        {rev.courseCode}
                      </span>
                      <span className="text-xs text-gray-500">{rev.note}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-xs font-semibold ${statusColor}`}>
                      {rev.status}
                    </p>
                    <p className="text-[10px] text-gray-400">{rev.date}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
