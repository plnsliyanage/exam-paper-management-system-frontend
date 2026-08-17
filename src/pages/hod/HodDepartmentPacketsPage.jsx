import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Clock,
  FileText,
  X,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  BookOpen,
  MessageSquare,
} from "lucide-react";

import { hodApi } from "../../services/api";

// ============================================================
// HOD DEPARTMENT
// ============================================================
//
// Change this only if the logged-in HOD belongs to another
// department.
//
// Example:
// D1 = Computer Science
// D2 = Information Technology
//
// ============================================================

const DEPARTMENT_ID = "D1";

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getValue = (object, ...keys) => {
  if (!object) return undefined;

  for (const key of keys) {
    if (object[key] !== undefined && object[key] !== null) {
      return object[key];
    }
  }

  return undefined;
};

const getPacketId = (packet) =>
  getValue(packet, "packetId", "id", "packetID", "PKTId");

const getCourseName = (packet) =>
  getValue(packet, "courseName", "course", "courseTitle", "subjectName") ||
  "Unknown Course";

const getCourseCode = (packet) =>
  getValue(packet, "courseCode", "code", "courseId") || "-";

const getCycle = (packet) =>
  getValue(
    packet,
    "academicCycle",
    "cycle",
    "cycleName",
    "academicCycleName",
  ) || "-";

const getLecturer = (packet) =>
  getValue(
    packet,
    "lecturerName",
    "lecturer",
    "assignedLecturer",
    "lecturerFullName",
  ) || "-";

const getLecturerId = (packet) =>
  getValue(packet, "lecturerId", "assignedLecturerId");

const getModerator = (packet) =>
  getValue(
    packet,
    "moderatorName",
    "moderator",
    "assignedModerator",
    "moderatorFullName",
  ) || "-";

const getStatus = (packet) =>
  getValue(packet, "status", "packetStatus", "currentStatus") || "UNKNOWN";

const getCurrentHolder = (packet) =>
  getValue(
    packet,
    "currentHolder",
    "holder",
    "currentUser",
    "currentHolderName",
  ) || "-";

const getLastUpdatedUser = (packet) =>
  getValue(
    packet,
    "lastUpdatedUser",
    "updatedBy",
    "lastUpdatedBy",
    "lastUpdatedUserName",
  ) || "-";

const getLastUpdatedTime = (packet) =>
  getValue(
    packet,
    "lastUpdatedTime",
    "updatedAt",
    "lastUpdated",
    "updatedDate",
  ) || "-";

const getTotalPapers = (packet) =>
  getValue(
    packet,
    "totalPapers",
    "totalScripts",
    "numberOfPapers",
    "paperCount",
    "scriptCount",
  ) ?? 0;

const getIsOverdue = (packet) => {
  const directValue = getValue(packet, "isOverdue", "overdue");

  if (typeof directValue === "boolean") {
    return directValue;
  }

  if (typeof directValue === "string") {
    return directValue.toLowerCase() === "true";
  }

  return false;
};

const normalizePacket = (packet) => {
  if (!packet) return null;

  return {
    ...packet,

    packetId: getPacketId(packet),

    courseName: getCourseName(packet),

    courseCode: getCourseCode(packet),

    academicCycle: getCycle(packet),

    lecturerName: getLecturer(packet),

    lecturerId: getLecturerId(packet),

    moderatorName: getModerator(packet),

    status: getStatus(packet),

    currentHolder: getCurrentHolder(packet),

    lastUpdatedUser: getLastUpdatedUser(packet),

    lastUpdatedTime: getLastUpdatedTime(packet),

    totalPapers: getTotalPapers(packet),

    isOverdue: getIsOverdue(packet),

    history: getValue(packet, "history", "movementHistory", "movements") || [],

    comments: getValue(packet, "comments", "communication") || [],
  };
};

// ============================================================
// STATUS DISPLAY
// ============================================================

const getStatusClass = (status) => {
  const normalized = String(status).toUpperCase().replaceAll("_", " ");

  if (normalized.includes("COMPLETED") || normalized.includes("APPROVED")) {
    return "bg-green-100 text-green-700";
  }

  if (
    normalized.includes("PROGRESS") ||
    normalized.includes("IN PROGRESS") ||
    normalized.includes("MARKING")
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (normalized.includes("MODERATION") || normalized.includes("PENDING")) {
    return "bg-yellow-100 text-yellow-700";
  }

  if (normalized.includes("OVERDUE") || normalized.includes("REJECTED")) {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
};

// ============================================================
// COMPONENT
// ============================================================

export default function HodDepartmentPacketsPage() {
  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [packets, setPackets] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCycle, setSelectedCycle] = useState("All");

  const [selectedStatus, setSelectedStatus] = useState("All");

  const [selectedLecturer, setSelectedLecturer] = useState("All");

  const [activeModalPacket, setActiveModalPacket] = useState(null);

  const [activeTab, setActiveTab] = useState("details");

  const [loading, setLoading] = useState(true);

  const [searching, setSearching] = useState(false);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const [error, setError] = useState("");

  const [detailsError, setDetailsError] = useState("");

  const [lastLoaded, setLastLoaded] = useState(null);

  // ----------------------------------------------------------
  // LOAD ALL DEPARTMENT PACKETS
  // ----------------------------------------------------------

  const loadDepartmentPackets = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading department packets for:", DEPARTMENT_ID);

      const response = await hodApi.getDepartmentPackets(DEPARTMENT_ID);

      console.log("Department packets response:", response.data);

      const data = Array.isArray(response.data) ? response.data : [];

      const normalizedData = data.map(normalizePacket).filter(Boolean);

      setPackets(normalizedData);

      setLastLoaded(new Date());
    } catch (err) {
      console.error("Failed to load department packets:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load department packets from the backend.",
      );

      setPackets([]);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // INITIAL LOAD
  // ----------------------------------------------------------

  useEffect(() => {
    loadDepartmentPackets();
  }, []);

  // ----------------------------------------------------------
  // GET UNIQUE CYCLES
  // ----------------------------------------------------------

  const cycles = useMemo(() => {
    const values = packets
      .map((packet) => packet.academicCycle)
      .filter((value) => value && value !== "-");

    return ["All", ...Array.from(new Set(values))];
  }, [packets]);

  // ----------------------------------------------------------
  // GET UNIQUE LECTURERS
  // ----------------------------------------------------------

  const lecturers = useMemo(() => {
    const values = packets
      .map((packet) => packet.lecturerName)
      .filter((value) => value && value !== "-");

    return ["All", ...Array.from(new Set(values))];
  }, [packets]);

  // ----------------------------------------------------------
  // GET UNIQUE STATUSES
  // ----------------------------------------------------------

  const statuses = useMemo(() => {
    const values = packets
      .map((packet) => packet.status)
      .filter((value) => value && value !== "-");

    return ["All", ...Array.from(new Set(values))];
  }, [packets]);

  // ----------------------------------------------------------
  // SEARCH / FILTER
  // ----------------------------------------------------------
  //
  // Uses your existing backend:
  //
  // GET
  // /api/hod/department/{deptId}/packets/search
  //
  // ----------------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCycle, selectedStatus, selectedLecturer]);

  const performSearch = async () => {
    const hasFilters =
      searchTerm.trim() !== "" ||
      selectedCycle !== "All" ||
      selectedStatus !== "All" ||
      selectedLecturer !== "All";

    // If nothing is selected, load normal list.
    if (!hasFilters) {
      if (!loading) {
        loadDepartmentPackets();
      }

      return;
    }

    try {
      setSearching(true);
      setError("");

      const params = {};

      if (searchTerm.trim()) {
        params.query = searchTerm.trim();
      }

      if (selectedStatus !== "All") {
        params.status = selectedStatus;
      }

      if (selectedCycle !== "All") {
        params.cycleId = selectedCycle;
      }

      if (selectedLecturer !== "All") {
        const matchingLecturer = packets.find(
          (packet) => packet.lecturerName === selectedLecturer,
        );

        if (matchingLecturer?.lecturerId) {
          params.lecturerId = matchingLecturer.lecturerId;
        } else {
          // If the backend expects the lecturer
          // name instead of ID, send the selected
          // value.
          params.lecturerId = selectedLecturer;
        }
      }

      console.log("HOD search parameters:", params);

      const response = await hodApi.searchPackets(DEPARTMENT_ID, params);

      console.log("HOD search response:", response.data);

      const data = Array.isArray(response.data) ? response.data : [];

      setPackets(data.map(normalizePacket).filter(Boolean));
    } catch (err) {
      console.error("HOD packet search failed:", err);

      setError(
        err?.response?.data?.message || "Unable to search department packets.",
      );
    } finally {
      setSearching(false);
    }
  };

  // ----------------------------------------------------------
  // VIEW PACKET DETAILS
  // ----------------------------------------------------------

  const handleViewDetails = async (packetId) => {
    if (!packetId) {
      console.error("Packet ID is missing.");
      return;
    }

    try {
      setDetailsLoading(true);
      setDetailsError("");

      setActiveModalPacket(null);

      setActiveTab("details");

      console.log("Loading HOD packet details:", packetId);

      const response = await hodApi.getPacketDetails(packetId);

      console.log("Packet details response:", response.data);

      const normalized = normalizePacket(response.data);

      setActiveModalPacket(normalized);
    } catch (err) {
      console.error("Failed to load packet details:", err);

      setDetailsError(
        err?.response?.data?.message || "Unable to load packet details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // ----------------------------------------------------------
  // CLOSE MODAL
  // ----------------------------------------------------------

  const closeModal = () => {
    setActiveModalPacket(null);
    setActiveTab("details");
    setDetailsError("");
  };

  // ----------------------------------------------------------
  // RESET FILTERS
  // ----------------------------------------------------------

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCycle("All");
    setSelectedStatus("All");
    setSelectedLecturer("All");
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Department Packets Management
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            View, track, search, filter, and review all department assessment
            packets.
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Department: {DEPARTMENT_ID}
          </p>
        </div>

        <button
          onClick={loadDepartmentPackets}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          Refresh
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5" />

          <div className="flex-1">
            <p className="font-semibold text-red-800">Failed to load packets</p>

            <p className="text-sm text-red-700 mt-1">{error}</p>

            <button
              onClick={loadDepartmentPackets}
              className="mt-2 text-sm font-medium text-red-700 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />

            <input
              type="text"
              placeholder="Search by course, lecturer, status, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {searching && (
              <Loader2
                size={17}
                className="absolute right-3 top-3 text-blue-500 animate-spin"
              />
            )}
          </div>

          {/* FILTERS */}

          <div className="flex flex-wrap gap-2">
            {/* CYCLE */}

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

            {/* STATUS */}

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All Statuses" : status}
                </option>
              ))}
            </select>

            {/* LECTURER */}

            <select
              value={selectedLecturer}
              onChange={(e) => setSelectedLecturer(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            >
              {lecturers.map((lecturer) => (
                <option key={lecturer} value={lecturer}>
                  {lecturer === "All" ? "All Lecturers" : lecturer}
                </option>
              ))}
            </select>

            {/* RESET */}

            <button
              onClick={resetFilters}
              className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
            >
              Reset
            </button>
          </div>
        </div>

        {/* LAST LOADED */}

        {lastLoaded && (
          <div className="text-xs text-gray-400">
            Last loaded: {lastLoaded.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader2 size={36} className="text-blue-600 animate-spin" />

            <p className="mt-3 text-sm font-medium text-gray-700">
              Loading department packets...
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Connecting to Spring Boot backend
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ====================================================
              PACKET COUNT
          ==================================================== */}

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {packets.length}
              </span>{" "}
              packet
              {packets.length !== 1 ? "s" : ""}
            </p>

            {searching && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 size={15} className="animate-spin" />
                Searching...
              </div>
            )}
          </div>

          {/* ====================================================
              TABLE
          ==================================================== */}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">Packet ID</th>

                    <th className="py-3 px-4">Course & Papers</th>

                    <th className="py-3 px-4">Lecturer / Moderator</th>

                    <th className="py-3 px-4">Status & Holder</th>

                    <th className="py-3 px-4">Last Updated</th>

                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-sm">
                  {packets.length > 0 ? (
                    packets.map((packet) => {
                      const packetId = packet.packetId;

                      return (
                        <tr key={packetId} className="hover:bg-gray-50">
                          {/* PACKET ID */}

                          <td className="py-3 px-4 font-medium text-blue-600">
                            <div>{packetId || "-"}</div>

                            {packet.isOverdue && (
                              <span className="block text-[10px] text-red-600 font-bold mt-1">
                                OVERDUE
                              </span>
                            )}
                          </td>

                          {/* COURSE */}

                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">
                              {packet.courseName}
                            </div>

                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                              <span>{packet.courseCode}</span>

                              <span>•</span>

                              <span>{packet.academicCycle}</span>

                              <span>•</span>

                              <span className="flex items-center gap-1 font-medium text-gray-700">
                                <FileText size={12} className="text-gray-400" />
                                {packet.totalPapers} Papers
                              </span>
                            </div>
                          </td>

                          {/* LECTURER */}

                          <td className="py-3 px-4">
                            <div className="text-gray-800">
                              {packet.lecturerName}
                            </div>

                            <div className="text-xs text-gray-500">
                              Mod: {packet.moderatorName}
                            </div>
                          </td>

                          {/* STATUS */}

                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${getStatusClass(
                                packet.status,
                              )}`}
                            >
                              {packet.status}
                            </span>

                            <div className="text-xs text-gray-500">
                              Holder:{" "}
                              <span className="font-medium text-gray-700">
                                {packet.currentHolder}
                              </span>
                            </div>
                          </td>

                          {/* UPDATED */}

                          <td className="py-3 px-4 text-xs text-gray-500">
                            <div>{packet.lastUpdatedTime}</div>

                            <div className="text-gray-400">
                              by {packet.lastUpdatedUser}
                            </div>
                          </td>

                          {/* ACTION */}

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleViewDetails(packetId)}
                              disabled={!packetId || detailsLoading}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium flex items-center gap-1.5 ml-auto disabled:opacity-50"
                            >
                              <Eye size={14} />
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FileText size={36} className="text-gray-300" />

                          <p className="mt-3 text-sm font-medium text-gray-600">
                            No packets found
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Try changing your search or filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ======================================================
          PACKET DETAILS MODAL
      ====================================================== */}

      {(activeModalPacket || detailsLoading || detailsError) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* HEADER */}

            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                {activeModalPacket ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-900">
                      {activeModalPacket.packetId}

                      {" - "}

                      {activeModalPacket.courseName}
                    </h3>

                    <p className="text-xs text-gray-500">
                      {activeModalPacket.academicCycle}

                      {" | Code: "}

                      {activeModalPacket.courseCode}
                    </p>
                  </>
                ) : (
                  <h3 className="text-lg font-bold text-gray-900">
                    Packet Details
                  </h3>
                )}
              </div>

              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            {/* DETAILS LOADING */}

            {detailsLoading && (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader2 size={36} className="text-blue-600 animate-spin" />

                <p className="mt-3 text-sm font-medium text-gray-700">
                  Loading packet details...
                </p>
              </div>
            )}

            {/* DETAILS ERROR */}

            {!detailsLoading && detailsError && (
              <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600" />

                  <div>
                    <p className="font-semibold text-red-800">
                      Unable to load packet
                    </p>

                    <p className="text-sm text-red-700 mt-1">{detailsError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL CONTENT */}

            {!detailsLoading && !detailsError && activeModalPacket && (
              <>
                {/* TABS */}

                <div className="flex border-b border-gray-200 bg-gray-50 px-4">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`py-2.5 px-4 text-sm font-medium border-b-2 ${
                      activeTab === "details"
                        ? "border-blue-600 text-blue-600 bg-white"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Full Details
                  </button>

                  <button
                    onClick={() => setActiveTab("history")}
                    className={`py-2.5 px-4 text-sm font-medium border-b-2 ${
                      activeTab === "history"
                        ? "border-blue-600 text-blue-600 bg-white"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Movement History
                  </button>

                  <button
                    onClick={() => setActiveTab("comments")}
                    className={`py-2.5 px-4 text-sm font-medium border-b-2 ${
                      activeTab === "comments"
                        ? "border-blue-600 text-blue-600 bg-white"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Communication
                  </button>
                </div>

                {/* CONTENT */}

                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                  {/* ========================================
                        DETAILS
                    ======================================== */}

                  {activeTab === "details" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-500 block">
                          Packet ID
                        </span>

                        <span className="font-semibold text-blue-600 text-base">
                          {activeModalPacket.packetId}
                        </span>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-500 block">
                          Course
                        </span>

                        <span className="font-semibold text-gray-800">
                          {activeModalPacket.courseName}
                        </span>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-500 block">
                          Course Code
                        </span>

                        <span className="font-semibold text-gray-800">
                          {activeModalPacket.courseCode}
                        </span>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-500 block">
                          Academic Cycle
                        </span>

                        <span className="font-semibold text-gray-800">
                          {activeModalPacket.academicCycle}
                        </span>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-500 block">
                          Total Papers
                        </span>

                        <span className="font-semibold text-blue-600 text-base">
                          {activeModalPacket.totalPapers} Papers
                        </span>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-500 block">
                          Current Status
                        </span>

                        <span
                          className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getStatusClass(
                            activeModalPacket.status,
                          )}`}
                        >
                          {activeModalPacket.status}
                        </span>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <User size={14} className="text-gray-400" />

                          <span className="text-xs text-gray-500">
                            Lecturer
                          </span>
                        </div>

                        <span className="font-medium text-gray-800">
                          {activeModalPacket.lecturerName}
                        </span>

                        {activeModalPacket.lecturerId && (
                          <span className="block text-xs text-gray-400 mt-1">
                            ID: {activeModalPacket.lecturerId}
                          </span>
                        )}
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <User size={14} className="text-gray-400" />

                          <span className="text-xs text-gray-500">
                            Moderator
                          </span>
                        </div>

                        <span className="font-medium text-gray-800">
                          {activeModalPacket.moderatorName}
                        </span>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-500 block">
                          Current Holder
                        </span>

                        <span className="font-medium text-gray-800">
                          {activeModalPacket.currentHolder}
                        </span>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-500 block">
                          Last Updated
                        </span>

                        <span className="font-medium text-gray-800">
                          {activeModalPacket.lastUpdatedTime}
                        </span>

                        <span className="block text-xs text-gray-400 mt-1">
                          By {activeModalPacket.lastUpdatedUser}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ========================================
                        MOVEMENT HISTORY
                    ======================================== */}

                  {activeTab === "history" && (
                    <div className="space-y-3">
                      {Array.isArray(activeModalPacket.history) &&
                      activeModalPacket.history.length > 0 ? (
                        activeModalPacket.history.map((hist, index) => {
                          const stage =
                            getValue(
                              hist,
                              "stage",
                              "movementStage",
                              "status",
                              "action",
                            ) || "Movement";

                          const user =
                            getValue(
                              hist,
                              "user",
                              "userName",
                              "handledBy",
                              "performedBy",
                            ) || "-";

                          const time =
                            getValue(
                              hist,
                              "time",
                              "timestamp",
                              "createdAt",
                              "movementDate",
                            ) || "-";

                          return (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm"
                            >
                              <div className="p-2 bg-blue-100 text-blue-600 rounded-full mt-0.5">
                                <Clock size={14} />
                              </div>

                              <div>
                                <p className="font-semibold text-gray-800">
                                  {stage}
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                  Handled by: {user}
                                  {" at "}
                                  {time}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12">
                          <Clock size={36} className="mx-auto text-gray-300" />

                          <p className="mt-3 text-sm text-gray-500">
                            No movement history available.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ========================================
                        COMMENTS
                    ======================================== */}

                  {activeTab === "comments" && (
                    <div className="space-y-4">
                      {Array.isArray(activeModalPacket.comments) &&
                      activeModalPacket.comments.length > 0 ? (
                        activeModalPacket.comments.map((comment, index) => {
                          const sender =
                            getValue(
                              comment,
                              "sender",
                              "senderName",
                              "userName",
                              "author",
                            ) || "-";

                          const text =
                            getValue(
                              comment,
                              "text",
                              "comment",
                              "message",
                              "content",
                            ) || "";

                          const time =
                            getValue(
                              comment,
                              "time",
                              "createdAt",
                              "timestamp",
                            ) || "-";

                          return (
                            <div
                              key={index}
                              className="p-3 bg-gray-50 rounded-lg text-sm border border-gray-100"
                            >
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span className="font-semibold text-gray-800">
                                  {sender}
                                </span>

                                <span>{time}</span>
                              </div>

                              <p className="text-gray-700">{text}</p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12">
                          <MessageSquare
                            size={36}
                            className="mx-auto text-gray-300"
                          />

                          <p className="mt-3 text-sm text-gray-500">
                            No comments or feedback available.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* FOOTER */}

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
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
