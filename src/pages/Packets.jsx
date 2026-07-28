import { useEffect, useState } from "react";
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

export default function Packets() {
  const [packets, setPackets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPackets = async () => {
      try {
        const res = await axiosInstance.get("/packets");
        setPackets(res.data);
        setFiltered(res.data);
      } catch (err) {
        setError("Failed to load packets.");
      } finally {
        setLoading(false);
      }
    };
    fetchPackets();
  }, []);

  useEffect(() => {
    let result = packets;
    if (statusFilter !== "ALL") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.packetId.toLowerCase().includes(q) ||
          p.courseCode.toLowerCase().includes(q) ||
          p.courseName.toLowerCase().includes(q) ||
          p.lecturerName.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, packets]);

  const statusTabs = [
    "ALL", "DRAFT", "PENDING", "UNDER_MODERATION",
    "APPROVED", "PRINTING_QUEUE", "COMPLETED", "DELAYED"
  ];

  const countFor = (s) =>
    s === "ALL" ? packets.length : packets.filter((p) => p.status === s).length;

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading packets...</div>;
  if (error) return <div className="flex items-center justify-center h-64 text-red-400 text-sm">{error}</div>;

  return (
    <div className="space-y-4">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-72">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search packets, courses, lecturers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none text-gray-600 w-full"
            />
          </div>

          {/* Status filter dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none"
          >
            <option value="ALL">All Status</option>
            {statusTabs.slice(1).map((s) => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>

          {/* Export button */}
          <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            ⬇ Export
          </button>
        </div>

        {/* Add Packet */}
        <button className="bg-[#7c4dff] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#6a3df0] transition">
          + Add Packet
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusTabs.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              statusFilter === s
                ? "bg-[#7c4dff] text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {s === "ALL" ? "All" : statusLabels[s]} ({countFor(s)})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {["Packet ID", "Course", "Lecturer", "Moderator", "Deadline", "Status", "Priority", "Actions"].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-400 px-5 py-4 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 text-sm py-12">
                  No packets found.
                </td>
              </tr>
            ) : (
              filtered.map((p, index) => (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-5 py-4 text-sm font-semibold text-[#7c4dff]">{p.packetId}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-800">{p.courseCode}</p>
                    <p className="text-xs text-gray-400">{p.courseName}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{p.lecturerName}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{p.moderatorName}</td>
                  <td className="px-5 py-4">
                    <p className={`text-sm font-medium ${p.overdue ? "text-red-500" : "text-gray-700"}`}>
                      {new Date(p.deadline).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </p>
                    {p.overdue && <p className="text-xs text-red-400">Overdue</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[p.status] || "bg-gray-100 text-gray-500"}`}>
                      {statusLabels[p.status] || p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-semibold ${priorityColors[p.priority]}`}>
                      ● {p.priority.charAt(0) + p.priority.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-blue-400 hover:text-blue-600 text-lg">👁</button>
                      <button className="text-gray-400 hover:text-gray-600 text-lg">✏️</button>
                      <button className="text-red-400 hover:text-red-600 text-lg">🗑</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}