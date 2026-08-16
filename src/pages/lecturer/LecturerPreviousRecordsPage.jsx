import React, { useEffect, useState } from "react";
import { Archive, Search, Eye, Filter } from "lucide-react";
import PacketDetailModal from "../../components/PacketDetailModal";
import { lecturerApi } from "../../services/api";

export default function LecturerPreviousRecordsPage() {
  // Temporary logged-in user until login page is created
  const [currentUser] = useState({
    id: "U1",
    name: "Dr. Samantha Perera",
    department: "Department of Computer Science",
  });

  const [records, setRecords] = useState([]);
  const [selectedPacketId, setSelectedPacketId] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPreviousPackets();
  }, []);

  const loadPreviousPackets = async () => {
    try {
      setLoading(true);
      setError("");

      // Only change: pass current lecturer ID
      const response = await lecturerApi.getPreviousPackets(currentUser.id);

      console.log("Previous packets for lecturer:", currentUser.id);

      console.log("Previous packets API response:", response);

      const data = Array.isArray(response.data) ? response.data : [];

      console.log("Previous packets:", data);

      setRecords(data);
    } catch (err) {
      console.error("Failed to load previous packets:", err);

      setRecords([]);

      if (err.response) {
        setError(
          err.response.data?.message || `Server error: ${err.response.status}`,
        );
      } else if (err.request) {
        setError(
          "Cannot connect to the backend. Make sure Spring Boot is running.",
        );
      } else {
        setError("Failed to load previous academic records.");
      }
    } finally {
      setLoading(false);
    }
  };

  const semesters = [
    "ALL",
    ...Array.from(
      new Set(
        records
          .filter(
            (record) =>
              record.academicYear !== null &&
              record.academicYear !== undefined &&
              record.semester !== null &&
              record.semester !== undefined,
          )
          .map(
            (record) => `${record.academicYear} - Semester ${record.semester}`,
          ),
      ),
    ),
  ];

  const filtered = records.filter((record) => {
    const searchValue = search.toLowerCase().trim();

    const packetId = record.packetId?.toLowerCase() || "";

    const courseCode = record.courseCode?.toLowerCase() || "";

    const courseName = record.courseName?.toLowerCase() || "";

    const departmentName = record.departmentName?.toLowerCase() || "";

    const matchesSearch =
      packetId.includes(searchValue) ||
      courseCode.includes(searchValue) ||
      courseName.includes(searchValue) ||
      departmentName.includes(searchValue);

    const semesterValue =
      record.academicYear !== null &&
      record.academicYear !== undefined &&
      record.semester !== null &&
      record.semester !== undefined
        ? `${record.academicYear} - Semester ${record.semester}`
        : "";

    const matchesSemester =
      selectedSemester === "ALL" || semesterValue === selectedSemester;

    return matchesSearch && matchesSemester;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Previous Academic Records
        </h1>

        <p className="text-sm text-slate-500">
          Access archived exam packets from prior semesters and academic cycles.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        {/* Semester Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full sm:w-60 pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl outline-none appearance-none cursor-pointer text-slate-700 font-medium"
          >
            {semesters.map((semester) => (
              <option key={semester} value={semester}>
                {semester === "ALL" ? "All Semesters" : semester}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />

          <input
            type="text"
            placeholder="Search by packet, course or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none"
          />
        </div>
      </div>

      {/* Records */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Title */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800">
          <Archive className="w-4 h-4 text-brand-600" />
          Archived Semester Packets ({filtered.length})
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-10 text-center text-slate-400">
            Loading previous academic records...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-10 text-center">
            <p className="text-red-500 font-semibold">{error}</p>

            <button
              onClick={loadPreviousPackets}
              className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Data */}
        {!loading && !error && (
          <div className="divide-y divide-slate-100">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.packetId}
                  className="p-5 flex justify-between items-center gap-6"
                >
                  {/* Information */}
                  <div className="min-w-0">
                    {/* Course Code */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {item.courseCode || "N/A"}
                      </span>

                      <span className="text-[11px] font-semibold text-slate-500">
                        Academic Year: {item.academicYear ?? "N/A"}
                      </span>

                      <span className="text-[11px] font-semibold text-slate-500">
                        Semester: {item.semester ?? "N/A"}
                      </span>
                    </div>

                    {/* Course Name */}
                    <h4 className="font-bold text-slate-800 text-sm mt-2">
                      {item.courseName || "Unknown Course"}
                    </h4>

                    {/* Packet */}
                    <p className="text-slate-400 text-xs mt-1">
                      Packet ID: {item.packetId || "N/A"}
                    </p>

                    {/* Department */}
                    <p className="text-slate-500 text-xs mt-1">
                      Department: {item.departmentName || "N/A"}
                    </p>

                    {/* Status */}
                    <p className="text-slate-400 text-xs mt-1">
                      Status:{" "}
                      <span className="font-semibold text-green-600">
                        {item.status || "COMPLETED"}
                      </span>
                      {" | "}
                      Deadline: {item.deadline || "N/A"}
                    </p>

                    {/* Current Holder */}
                    <p className="text-slate-400 text-xs mt-1">
                      Current Holder:{" "}
                      <span className="font-medium text-slate-600">
                        {item.currentHolderName || "Archive"}
                      </span>
                    </p>
                  </div>

                  {/* View */}
                  <button
                    onClick={() => setSelectedPacketId(item.packetId)}
                    className="shrink-0 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold text-slate-700"
                  >
                    <Eye className="w-4 h-4" />
                    View Record
                  </button>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-400">
                No previous academic records found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Packet Detail Modal */}
      {selectedPacketId && (
        <PacketDetailModal
          packetId={selectedPacketId}
          onClose={() => setSelectedPacketId(null)}
        />
      )}
    </div>
  );
}
