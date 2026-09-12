import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAcademicCycle } from "../context/AcademicCycleContext";
import SemesterRolloverModal from "../components/SemesterRolloverModal";


const statusColors = {
  PENDING: "bg-amber-100 text-amber-800",
  DRAFT: "bg-blue-100 text-blue-800",
  SUBMITTED: "bg-purple-100 text-purple-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  PRINTING: "bg-indigo-100 text-indigo-800",
  PRINTING_QUEUE: "bg-indigo-100 text-indigo-800",
  "PAPERS STORED": "bg-cyan-100 text-cyan-800",
  PAPERS_STORED: "bg-cyan-100 text-cyan-800",
  "ANSWER SHEETS TAKEN": "bg-orange-100 text-orange-800",
  ANSWER_SHEETS_TAKEN: "bg-orange-100 text-orange-800",
  MARKING: "bg-violet-100 text-violet-800",
  UNDER_MARKING: "bg-violet-100 text-violet-800",
  "MARKING COMPLETE": "bg-teal-100 text-teal-800",
  MARKING_COMPLETE: "bg-teal-100 text-teal-800",
  COMPLETED: "bg-teal-100 text-teal-800",
  UNDER_MODERATION: "bg-purple-100 text-purple-800",
  DELAYED: "bg-red-100 text-red-700",
};

const statusLabels = {
  PENDING: "Pending",
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PRINTING: "Printing",
  PRINTING_QUEUE: "Printing",
  "PAPERS STORED": "Papers Stored",
  PAPERS_STORED: "Papers Stored",
  "ANSWER SHEETS TAKEN": "Sheets Taken",
  ANSWER_SHEETS_TAKEN: "Sheets Taken",
  MARKING: "Marking",
  UNDER_MARKING: "Marking",
  "MARKING COMPLETE": "Completed",
  MARKING_COMPLETE: "Completed",
  COMPLETED: "Completed",
  UNDER_MODERATION: "Submitted",
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
  const [roleScope, setRoleScope] = useState("ALL"); // ALL | AUTHORED | MODERATING
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { getRole, getUsername } = useAuth();
  const role = getRole();
  const currentUsername = (getUsername() || "").toLowerCase();
  const isSystemAdmin = role === "ROLE_SYSTEM_ADMIN";
  const isLecturer = role === "ROLE_USER" || role === "ROLE_MODERATOR";
  const navigate = useNavigate();

  const { selectedCycleId, selectedCycle, isHistoricalView } = useAcademicCycle();
  const [isRolloverModalOpen, setIsRolloverModalOpen] = useState(false);

  const fetchPackets = useCallback(async () => {
    setLoading(true);
    try {
      const cycleParam = selectedCycleId ? `?cycleId=${selectedCycleId}` : "";
      const res = await axiosInstance.get(`/packets${cycleParam}`);
      setPackets(res.data);
      setFiltered(res.data);
    } catch (err) {
      setError("Failed to load packets.");
    } finally {
      setLoading(false);
    }
  }, [selectedCycleId]);

  useEffect(() => {
    fetchPackets();
  }, [fetchPackets]);


  useEffect(() => {
    let result = packets;

    // Role scope filter for Lecturer/Academic staff
    if (isLecturer && roleScope !== "ALL") {
      if (roleScope === "AUTHORED") {
        result = result.filter((p) => {
          const lecUser = (p.lecturerUsername || "").toLowerCase();
          const lecName = (p.lecturerName || "").toLowerCase();
          return lecUser === currentUsername || lecName === currentUsername;
        });
      } else if (roleScope === "MODERATING") {
        result = result.filter((p) => {
          const modUser = (p.moderatorUsername || "").toLowerCase();
          const modName = (p.moderatorName || "").toLowerCase();
          return modUser === currentUsername || modName === currentUsername;
        });
      }
    }

    if (statusFilter !== "ALL") {
      if (statusFilter === "MARKING COMPLETE" || statusFilter === "COMPLETED") {
        result = result.filter((p) => ["COMPLETED", "MARKING COMPLETE", "MARKING_COMPLETE"].includes(p.status));
      } else if (statusFilter === "PAPERS STORED") {
        result = result.filter((p) => ["PAPERS STORED", "PAPERS_STORED"].includes(p.status));
      } else if (statusFilter === "ANSWER SHEETS TAKEN") {
        result = result.filter((p) => ["ANSWER SHEETS TAKEN", "ANSWER_SHEETS_TAKEN"].includes(p.status));
      } else if (statusFilter === "PRINTING") {
        result = result.filter((p) => ["PRINTING", "PRINTING_QUEUE"].includes(p.status));
      } else {
        result = result.filter((p) => p.status === statusFilter);
      }
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.packetId.toLowerCase().includes(q) ||
          p.courseCode.toLowerCase().includes(q) ||
          p.courseName.toLowerCase().includes(q) ||
          p.lecturerName.toLowerCase().includes(q) ||
          (p.moderatorName && p.moderatorName.toLowerCase().includes(q))
      );
    }
    setFiltered(result);
  }, [search, statusFilter, roleScope, packets, currentUsername, isLecturer]);

  const statusTabs = [
    "ALL",
    "PENDING",
    "DRAFT",
    "SUBMITTED",
    "APPROVED",
    "REJECTED",
    "PRINTING",
    "PAPERS STORED",
    "ANSWER SHEETS TAKEN",
    "MARKING",
    "COMPLETED",
  ];

  const handleExportCSV = async () => {
    try {
      const res = await axiosInstance.get("/packets/export/csv", {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "packets.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export CSV.");
    }
  };

  const handleDelete = async (packetId, id) => {
    if (!isSystemAdmin) {
      alert("Only System Administrator can delete exam packets.");
      return;
    }
    if (!confirm(`Are you sure you want to delete packet ${packetId}?`)) return;
    const targetId = id || parseInt(packetId.split("-")[2], 10);
    try {
      await axiosInstance.delete(`/packets/${targetId}`);
      setPackets((prev) => prev.filter((p) => p.packetId !== packetId && p.id !== targetId));
    } catch (err) {
      console.error("Failed to delete packet:", err);
      alert(err.response?.data?.message || "Failed to delete packet.");
    }
  };

  const countFor = (s) => {
    if (s === "ALL") return packets.length;
    if (s === "COMPLETED" || s === "MARKING COMPLETE") {
      return packets.filter((p) => ["COMPLETED", "MARKING COMPLETE", "MARKING_COMPLETE"].includes(p.status)).length;
    }
    if (s === "PAPERS STORED") {
      return packets.filter((p) => ["PAPERS STORED", "PAPERS_STORED"].includes(p.status)).length;
    }
    if (s === "ANSWER SHEETS TAKEN") {
      return packets.filter((p) => ["ANSWER SHEETS TAKEN", "ANSWER_SHEETS_TAKEN"].includes(p.status)).length;
    }
    if (s === "PRINTING") {
      return packets.filter((p) => ["PRINTING", "PRINTING_QUEUE"].includes(p.status)).length;
    }
    return packets.filter((p) => p.status === s).length;
  };

  const tableHeaders = [
    "Packet ID",
    "Course",
    ...(isLecturer ? ["My Role"] : []),
    "Lecturer",
    "Moderator",
    "Deadline",
    "Status",
    "Priority",
    "Actions",
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c4dff] mr-3"></div>
        Loading packets...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        {error}
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Role scope selector for Lecturer */}
      {isLecturer && (
        <div className="flex items-center gap-2 bg-purple-50/60 p-1.5 rounded-xl border border-purple-100 w-fit">
          <button
            onClick={() => setRoleScope("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${roleScope === "ALL"
                ? "bg-[#7c4dff] text-white shadow-sm"
                : "text-slate-600 hover:bg-white/80"
              }`}
          >
            📚 All My Packets ({packets.length})
          </button>
          <button
            onClick={() => setRoleScope("AUTHORED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${roleScope === "AUTHORED"
                ? "bg-[#7c4dff] text-white shadow-sm"
                : "text-slate-600 hover:bg-white/80"
              }`}
          >
            ✍️ Authored by Me (Teaching)
          </button>
          <button
            onClick={() => setRoleScope("MODERATING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${roleScope === "MODERATING"
                ? "bg-[#7c4dff] text-white shadow-sm"
                : "text-slate-600 hover:bg-white/80"
              }`}
          >
            🔍 Assigned for Moderation (Review)
          </button>
        </div>
      )}

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

          {/* Export button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition shadow-xs"
          >
            ⬇ Export
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Semester Rollover (Only for System Admin) */}
          {isSystemAdmin && (
            <button
              onClick={() => setIsRolloverModalOpen(true)}
              className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3.5 py-2 rounded-lg text-sm font-medium transition shadow-xs"
              title="Automatically clone and initialize courses/packets for a new semester"
            >
              Semester Rollover
            </button>
          )}

          {/* Add Packet (Only for SystemAdmin) */}
          {isSystemAdmin && !isHistoricalView && (
            <button
              onClick={() => navigate("/packets/add")}
              className="bg-[#7c4dff] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#6a3df0] transition shadow-xs"
            >
              + Add Packet
            </button>
          )}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-1.5 shadow-xs overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-1 min-w-max">
          {statusTabs.map((s) => {
            const count = countFor(s);
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  isActive
                    ? "bg-[#7c4dff] text-white shadow-xs font-semibold"
                    : count > 0
                    ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 font-medium"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50 font-normal"
                }`}
              >
                <span>{s === "ALL" ? "All" : statusLabels[s]}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold transition ${
                    isActive
                      ? "bg-white/25 text-white"
                      : count > 0
                      ? "bg-purple-100 text-[#7c4dff]"
                      : "bg-gray-100 text-gray-400 font-normal"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {tableHeaders.map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold text-gray-400 px-5 py-4 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={tableHeaders.length}
                  className="text-center text-gray-400 text-sm py-12"
                >
                  No packets found.
                </td>
              </tr>
            ) : (
              filtered.map((p, index) => {
                const numericId = p.id || parseInt(p.packetId.split("-")[2], 10);
                const isAuthorOfPacket = (p.lecturerUsername && p.lecturerUsername.toLowerCase() === currentUsername) ||
                                         (p.lecturerName && p.lecturerName.toLowerCase() === currentUsername);
                const isModOfPacket = (p.moderatorUsername && p.moderatorUsername.toLowerCase() === currentUsername) ||
                                      (p.moderatorName && p.moderatorName.toLowerCase() === currentUsername);

                return (
                  <tr
                    key={p.id || p.packetId || index}
                    onClick={() => navigate(`/packets/${numericId}`)}
                    className="border-b border-gray-50 hover:bg-purple-50/30 transition cursor-pointer"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-[#7c4dff]">
                      {p.packetId}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {p.courseCode}
                      </p>
                      <p className="text-xs text-gray-400">{p.courseName}</p>
                    </td>

                    {isLecturer && (
                      <td className="px-5 py-4">
                        {isModOfPacket ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                            🔍 Moderator
                          </span>
                        ) : isAuthorOfPacket ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                            ✍️ Author
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    )}

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {p.lecturerName}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {p.moderatorName || "Unassigned"}
                    </td>

                    <td className="px-5 py-4">
                      <p
                        className={`text-sm font-medium ${p.overdue ? "text-red-500" : "text-gray-700"
                          }`}
                      >
                        {p.deadline
                          ? new Date(p.deadline).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          : "—"}
                      </p>
                      {p.overdue && (
                        <p className="text-xs text-red-400">Overdue</p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[p.status] || "bg-gray-100 text-gray-500"
                          }`}
                      >
                        {statusLabels[p.status] || p.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-sm font-semibold ${priorityColors[p.priority]}`}
                      >
                        ● {p.priority.charAt(0) + p.priority.slice(1).toLowerCase()}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/packets/${numericId}`);
                          }}
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                          title="View Packet"
                        >
                          👁
                        </button>
                        {isSystemAdmin && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/packets/edit/${numericId}`);
                              }}
                              className="text-gray-400 hover:text-[#7c4dff] text-base transition"
                              title="Edit Packet"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(p.packetId, numericId);
                              }}
                              className="text-red-400 hover:text-red-600 text-base transition"
                              title="Delete Packet"
                            >
                              🗑
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <SemesterRolloverModal
        isOpen={isRolloverModalOpen}
        onClose={() => setIsRolloverModalOpen(false)}
        onSuccess={() => fetchPackets()}
      />
    </div>
  );
}


