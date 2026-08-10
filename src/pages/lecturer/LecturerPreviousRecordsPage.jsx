import React, { useState } from "react";
import { Archive, Search, Eye, Filter } from "lucide-react";
import PacketDetailModal from "../../components/PacketDetailModal";

const PAST_PACKETS = [
  {
    packetId: "PKT-2025-09",
    courseCode: "CS3012",
    courseName: "Advanced Operating Systems",
    status: "COMPLETED",
    semester: "2025-S2",
    deadline: "2025-12-10",
    currentHolder: "Archive",
  },
  {
    packetId: "PKT-2025-04",
    courseCode: "CS2021",
    courseName: "Computer Architecture",
    status: "COMPLETED",
    semester: "2025-S1",
    deadline: "2025-06-18",
    currentHolder: "Archive",
  },
];

export default function LecturerPreviousRecordsPage() {
  const [records] = useState(PAST_PACKETS);
  const [selectedPacketId, setSelectedPacketId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("ALL");

  // Extract unique semesters dynamically from the records dataset
  const semesters = ["ALL", ...new Set(records.map((r) => r.semester))];

  // Filter records based on search query and selected semester
  const filtered = records.filter((r) => {
    const matchesSearch =
      r.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      r.courseName.toLowerCase().includes(search.toLowerCase());

    const matchesSemester =
      selectedSemester === "ALL" || r.semester === selectedSemester;

    return matchesSearch && matchesSemester;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Previous Academic Records
          </h1>
          <p className="text-sm text-slate-500">
            Access archived exam packets from prior semesters and academic
            cycles.
          </p>
        </div>
      </header>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        {/* Semester Filter Dropdown */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full sm:w-48 pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl outline-none appearance-none cursor-pointer text-slate-700 font-medium"
          >
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem === "ALL" ? "All Semesters" : `Semester: ${sem}`}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search archive..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800">
          <Archive className="w-4 h-4 text-brand-600" /> Archived Semester
          Packets ({filtered.length})
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.packetId}
                className="p-4 flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {item.courseCode}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Semester: {item.semester}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mt-1">
                    {item.courseName}
                  </h4>
                  <p className="text-slate-400 text-xs">
                    Completed & Archived | Deadline was: {item.deadline}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPacketId(item.packetId)}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1 font-semibold text-slate-700"
                >
                  <Eye className="w-4 h-4" /> View Record
                </button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400">
              No archived packets match your selected filters.
            </div>
          )}
        </div>
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
