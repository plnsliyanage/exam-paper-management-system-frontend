import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Clock,
  FileText,
  X,
  RefreshCw,
  User,
  MessageSquare,
  Send,
} from "lucide-react";
import { hodApi } from "../../services/api";

const DEPARTMENT_ID = "D1";

const STAGES = [
  "All",
  "Paper Setting",
  "Paper Moderation",
  "Paper Marking",
  "Second Marking",
  "Completed",
];

const getStageClass = (stage) => {
  switch (stage) {
    case "Paper Setting":
      return "bg-purple-100 text-purple-700";
    case "Paper Moderation":
      return "bg-yellow-100 text-yellow-700";
    case "Paper Marking":
      return "bg-blue-100 text-blue-700";
    case "Second Marking":
      return "bg-orange-100 text-orange-700";
    case "Completed":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function HodDepartmentPacketsPage() {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCycle, setSelectedCycle] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All");

  const [activeModalPacket, setActiveModalPacket] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  const [packetDetail, setPacketDetail] = useState(null);
  const [comments, setComments] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const loadPackets = () => {
    setLoading(true);
    setError(null);
    hodApi
      .getDepartmentPackets(DEPARTMENT_ID)
      .then((res) => {
        // Safely handle whether the API returns a direct array or a wrapped object (e.g. res.data or res.packets)
        const data = Array.isArray(res) ? res : res?.packets || res?.data || [];
        setPackets(data);
      })
      .catch((err) => setError(err?.message || "Failed to load packets."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPackets();
  }, []);

  const cycles = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          (Array.isArray(packets) ? packets : [])
            .map((p) => p.cycleId)
            .filter(Boolean),
        ),
      ),
    ],
    [packets],
  );

  const stageCounts = useMemo(() => {
    const counts = {};
    const safePackets = Array.isArray(packets) ? packets : [];
    STAGES.filter((s) => s !== "All").forEach((s) => {
      counts[s] = safePackets.filter((p) => p.status === s).length;
    });
    return counts;
  }, [packets]);

  const filteredPackets = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const safePackets = Array.isArray(packets) ? packets : [];
    return safePackets.filter((packet) => {
      const matchesSearch =
        !search ||
        packet.packetId?.toLowerCase().includes(search) ||
        packet.courseCode?.toLowerCase().includes(search) ||
        packet.courseName?.toLowerCase().includes(search) ||
        packet.currentHolderName?.toLowerCase().includes(search) ||
        packet.status?.toLowerCase().includes(search);

      const matchesCycle =
        selectedCycle === "All" || packet.cycleId === selectedCycle;
      const matchesStage =
        selectedStage === "All" || packet.status === selectedStage;

      return matchesSearch && matchesCycle && matchesStage;
    });
  }, [packets, searchTerm, selectedCycle, selectedStage]);

  const refreshData = () => {
    setSearchTerm("");
    setSelectedCycle("All");
    setSelectedStage("All");
    loadPackets();
  };

  const handleViewDetails = (packet) => {
    setActiveModalPacket(packet);
    setActiveTab("details");
    setPacketDetail(null);
    setComments([]);
    setDetailLoading(true);

    Promise.all([
      hodApi.getPacketDetails(packet.packetId),
      hodApi.getPacketComments(packet.packetId),
    ])
      .then(([detail, packetComments]) => {
        setPacketDetail(detail);
        setComments(Array.isArray(packetComments) ? packetComments : []);
      })
      .catch(() => setPacketDetail(null))
      .finally(() => setDetailLoading(false));
  };

  const closeModal = () => {
    setActiveModalPacket(null);
    setActiveTab("details");
    setPacketDetail(null);
    setComments([]);
    setNewComment("");
  };

  const handlePostComment = () => {
    if (!newComment.trim() || !activeModalPacket) return;
    setPostingComment(true);
    // NOTE: userId is hardcoded to the seeded HOD account ("U5"). Wire this to
    // the logged-in user's ID once authentication is in place.
    hodApi
      .addComment({
        packetId: activeModalPacket.packetId,
        userId: "U5",
        commentText: newComment.trim(),
      })
      .then((saved) => {
        setComments((prev) => [...prev, saved]);
        setNewComment("");
      })
      .finally(() => setPostingComment(false));
  };

  return (
    <div className="p-6 space-y-5 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Department Packets
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track examination packets across all processing stages.
          </p>
        </div>
        <button
          onClick={refreshData}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* STAGE CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          "Paper Setting",
          "Paper Moderation",
          "Paper Marking",
          "Second Marking",
        ].map((stage) => (
          <button
            key={stage}
            onClick={() => setSelectedStage(stage)}
            className={`bg-white border rounded-lg px-4 py-3 text-left hover:border-blue-300 ${
              selectedStage === stage
                ? "border-blue-400 ring-1 ring-blue-200"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-gray-500">{stage}</p>
                <p className="text-xl font-bold text-gray-900">
                  {stageCounts[stage] ?? 0}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText size={17} className="text-blue-600" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={17}
            />
            <input
              type="text"
              placeholder="Search packet, course, holder or stage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            >
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage === "All" ? "All Stages" : stage}
                </option>
              ))}
            </select>

            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            >
              {cycles.map((cycle) => (
                <option key={cycle} value={cycle}>
                  {cycle === "All" ? "All Cycles" : cycle}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCycle("All");
                setSelectedStage("All");
              }}
              className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredPackets.length}
          </span>{" "}
          packets
        </p>
        {selectedStage !== "All" && (
          <button
            onClick={() => setSelectedStage("All")}
            className="text-xs text-blue-600 hover:underline"
          >
            Show all stages
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                <th className="py-3 px-4">Packet ID</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Holder</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-12 text-center text-sm text-gray-500"
                  >
                    Loading packets...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-12 text-center text-sm text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : filteredPackets.length > 0 ? (
                filteredPackets.map((packet) => (
                  <tr key={packet.packetId} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-blue-600">
                        {packet.packetId}
                      </div>
                      {packet.isOverdue && (
                        <span className="text-[10px] text-red-600 font-bold">
                          OVERDUE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {packet.courseName}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {packet.courseCode} • {packet.cycleId}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStageClass(packet.status)}`}
                      >
                        {packet.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">
                      {packet.deadline}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-700">
                        {packet.currentHolderName}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewDetails(packet)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <FileText size={36} className="mx-auto text-gray-300" />
                    <p className="mt-3 text-sm font-medium text-gray-600">
                      No packets found
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {activeModalPacket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {activeModalPacket.packetId} - {activeModalPacket.courseName}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {activeModalPacket.courseCode} | {activeModalPacket.cycleId}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={21} />
              </button>
            </div>

            <div className="flex border-b border-gray-200 bg-gray-50 px-4">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-2.5 px-4 text-sm font-medium border-b-2 ${
                  activeTab === "details"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500"
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-2.5 px-4 text-sm font-medium border-b-2 ${
                  activeTab === "history"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500"
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`py-2.5 px-4 text-sm font-medium border-b-2 ${
                  activeTab === "comments"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500"
                }`}
              >
                Communication
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              {detailLoading ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Loading...
                </p>
              ) : (
                <>
                  {activeTab === "details" && packetDetail && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Packet ID</p>
                        <p className="font-semibold text-blue-600 mt-1">
                          {packetDetail.packetId}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Stage</p>
                        <span
                          className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getStageClass(packetDetail.status)}`}
                        >
                          {packetDetail.status}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Course</p>
                        <p className="font-medium text-gray-800 mt-1">
                          {packetDetail.courseName}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Academic Cycle</p>
                        <p className="font-medium text-gray-800 mt-1">
                          {packetDetail.cycleId}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Deadline</p>
                        <p className="font-semibold text-gray-800 mt-1">
                          {packetDetail.deadline}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <p className="text-xs text-gray-500">
                            Current Holder
                          </p>
                        </div>
                        <p className="font-medium text-gray-800 mt-1">
                          {packetDetail.currentHolderName}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                        <p className="text-xs text-gray-500">Last Updated By</p>
                        <p className="font-medium text-gray-800 mt-1">
                          {packetDetail.lastUpdatedUser}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "history" && (
                    <div className="space-y-2">
                      {(packetDetail?.movementHistory || []).length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">
                          No movement history yet.
                        </p>
                      ) : (
                        packetDetail.movementHistory.map((item) => (
                          <div
                            key={item.movementId}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                              <Clock size={14} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">
                                {item.action}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.fromUserName} → {item.toUserName} •{" "}
                                {item.timestamp}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "comments" && (
                    <div className="space-y-3">
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <div
                            key={comment.commentId}
                            className="bg-gray-50 border border-gray-100 rounded-lg p-3"
                          >
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-800 text-sm">
                                {comment.userName}
                              </span>
                              <span className="text-xs text-gray-400">
                                {comment.timestamp}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              {comment.commentText}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <MessageSquare
                            size={32}
                            className="mx-auto text-gray-300"
                          />
                          <p className="mt-2 text-sm text-gray-500">
                            No communication available.
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handlePostComment}
                          disabled={postingComment}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1.5"
                        >
                          <Send size={14} />
                          {postingComment ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
