import React, { useEffect, useState } from "react";
import { Archive, Eye, Filter, Search } from "lucide-react";
import { lecturerApi } from "../../services/api";
import PacketDetailModal from "../../components/PacketDetailModal";

export default function LecturerPreviousRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("ALL");
  const [selectedPacketId, setSelectedPacketId] = useState(null);

  useEffect(() => {
    loadPreviousPackets();
  }, []);

  const loadPreviousPackets = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await lecturerApi.getPreviousPackets();
      const data = Array.isArray(response.data) ? response.data : [];
      setRecords(data);
    } catch (err) {
      console.error("Failed to load previous packets:", err);
      setError("Failed to load previous academic records.");
    } finally {
      setLoading(false);
    }
  };

  const semesters = [
    "ALL",
    ...Array.from(
      new Set(
        records
          .filter((r) => r.academicYear && r.semester)
          .map((r) => `${r.academicYear} - Semester ${r.semester}`)
      )
    ),
  ];

  const filtered = records.filter((record) => {
    const searchValue = search.toLowerCase().trim();
    const packetId = String(record.packetId || "").toLowerCase();
    const courseCode = (record.courseCode || "").toLowerCase();
    const courseName = (record.courseName || "").toLowerCase();
    const departmentName = (record.departmentName || "").toLowerCase();

    const matchesSearch =
      packetId.includes(searchValue) ||
      courseCode.includes(searchValue) ||
      courseName.includes(searchValue) ||
      departmentName.includes(searchValue);

    const semesterValue =
      record.academicYear && record.semester
        ? `${record.academicYear} - Semester ${record.semester}`
        : "";

    const matchesSemester =
      selectedSemester === "ALL" || semesterValue === selectedSemester;

    return matchesSearch && matchesSemester;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Previous Academic Records
        </h1>
        <p className="text-sm text-slate-500">
          Access archived exam packets from prior semesters and academic cycles.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full sm:w-60 pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl outline-none cursor-pointer text-slate-700 font-medium"
          >
            {semesters.map((semester) => (
              <option key={semester} value={semester}>
                {semester === "ALL" ? "All Semesters" : semester}
              </option>
            ))}
          </select>
        </div>

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

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800 text-sm">
          <Archive className="w-4 h-4 text-[#7c4dff]" />
          Archived Semester Packets ({filtered.length})
        </div>

        {loading && (
          <div className="p-10 text-center text-slate-400">
            Loading previous academic records...
          </div>
        )}

        {!loading && error && (
          <div className="p-10 text-center">
            <p className="text-red-500 font-semibold">{error}</p>
            <button
              onClick={loadPreviousPackets}
              className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer text-xs"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="divide-y divide-slate-100">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.packetId}
                  className="p-5 flex justify-between items-center gap-6"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#7c4dff] bg-[#7c4dff]/10 px-2 py-0.5 rounded border border-[#7c4dff]/20">
                        {item.courseCode || "N/A"}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Academic Year: {item.academicYear ?? 2026}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Semester: {item.semester ?? 1}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm mt-1">
                      {item.courseName || "Course"}
                    </h4>
                    <p className="text-slate-400 text-xs">Packet ID: #{item.packetId}</p>
                    <p className="text-slate-500 text-xs">Department: {item.departmentName || "N/A"}</p>
                    <p className="text-slate-400 text-xs">
                      Status:{" "}
                      <span className="font-semibold text-emerald-600">
                        {item.status || "COMPLETED"}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedPacketId(item.packetId)}
                    className="shrink-0 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold text-slate-700 cursor-pointer"
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

      {selectedPacketId && (
        <PacketDetailModal
          packetId={selectedPacketId}
          onClose={() => setSelectedPacketId(null)}
        />
      )}
    </div>
  );
}
