import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const statusColors = {
  PENDING: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-600",
  UNDER_MODERATION: "bg-yellow-100 text-yellow-700",
  PRINTING_QUEUE: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-teal-100 text-teal-700",
  DELAYED: "bg-red-100 text-red-600",
};

const statusLabels = {
  PENDING: "Submitted",
  APPROVED: "Approved",
  DRAFT: "Draft",
  UNDER_MODERATION: "Under Moderation",
  PRINTING_QUEUE: "Printing",
  COMPLETED: "Completed",
  DELAYED: "Delayed",
};

const priorityColors = {
  HIGH: "text-red-500",
  MEDIUM: "text-yellow-500",
  LOW: "text-green-500",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

function getInitials(name) {
  if (!name) return "??";
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

const avatarColors = [
  "bg-blue-500", "bg-purple-500", "bg-green-500",
  "bg-yellow-500", "bg-red-500", "bg-pink-500"
];

export default function PacketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [packet, setPacket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get(`/packets/${id}`);
        setPacket(res.data);
      } catch (err) {
        setError("Failed to load packet details.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-64 text-red-400 text-sm">{error}</div>;
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
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Packets
        </button>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[packet.status]}`}>
            {statusLabels[packet.status] || packet.status}
          </span>
          <span className={`text-sm font-semibold ${priorityColors[packet.priority]}`}>
            ● {packet.priority.charAt(0) + packet.priority.slice(1).toLowerCase()} Priority
          </span>
        </div>
      </div>

      <div className="flex gap-4">

        {/* Left — main content */}
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
                { label: "DEADLINE", value: formatDate(packet.deadline) },
                { label: "EXAM DATE", value: formatDate(packet.examDate) },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400 font-semibold tracking-wide mb-1">{item.label}</p>
                  <p className={`text-sm font-medium ${item.label === "DEADLINE" && packet.overdue ? "text-red-500" : "text-gray-700"}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs + content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex border-b border-gray-100 px-6">
              <button className="text-sm font-medium text-[#7c4dff] border-b-2 border-[#7c4dff] py-4 mr-6">
                Overview
              </button>
              <button className="text-sm text-gray-400 py-4 mr-6 hover:text-gray-600">Comments</button>
              <button className="text-sm text-gray-400 py-4 mr-6 hover:text-gray-600">Attachments</button>
              <button className="text-sm text-gray-400 py-4 hover:text-gray-600">History</button>
            </div>

            <div className="p-6 space-y-4">
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

              {/* Moderator note */}
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
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-80 space-y-4">

          {/* Update Status */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Update Status</h3>
            <div className="space-y-2">
              <button className="w-full bg-green-50 text-green-700 border border-green-200 rounded-xl py-3 text-sm font-medium hover:bg-green-100 transition">
                ✓ Approve Packet
              </button>
              <button className="w-full bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-xl py-3 text-sm font-medium hover:bg-yellow-100 transition">
                ↩ Return for Revision
              </button>
              <button className="w-full bg-red-50 text-red-600 border border-red-200 rounded-xl py-3 text-sm font-medium hover:bg-red-100 transition">
                ✕ Reject Packet
              </button>
            </div>
          </div>

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
                    {item.date ? new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
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
    </div>
  );
}