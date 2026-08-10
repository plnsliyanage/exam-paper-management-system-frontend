import React, { useState } from "react";
import PacketDetailModal from "../../components/PacketDetailModal";
import MarkingEntryModal from "../../components/MarkingEntryModal";
import { Search, Filter, Eye, Edit3, BookOpen } from "lucide-react";

const INITIAL_PACKETS = [
  {
    packetId: "PKT-2026-01",
    courseCode: "CS1022",
    courseName: "Data Structures & Algorithms",
    status: "MARKING",
    deadline: "2026-06-15",
    semester: "2026-S1",
    department: "Computer Science",
    currentHolder: "Dr. Samantha Perera",
  },
  {
    packetId: "PKT-2026-02",
    courseCode: "CS2032",
    courseName: "Database Systems",
    status: "REVIEW",
    deadline: "2026-06-20",
    semester: "2026-S1",
    department: "Computer Science",
    currentHolder: "Dr. Samantha Perera",
  },
  {
    packetId: "PKT-2026-03",
    courseCode: "CS3041",
    courseName: "Software Engineering",
    status: "PREPARATION",
    deadline: "2026-07-01",
    semester: "2026-S1",
    department: "Computer Science",
    currentHolder: "Exam Branch",
  },
];

export default function LecturerPacketsPage() {
  const [packets, setPackets] = useState(INITIAL_PACKETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedPacketId, setSelectedPacketId] = useState(null);
  const [markingPacket, setMarkingPacket] = useState(null);

  const filteredPackets = packets.filter((p) => {
    const matchesSearch =
      p.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Exam Packets Workspace
          </h1>
          <p className="text-sm text-slate-500">
            Manage and update your assigned exam packets and grading workflows.
          </p>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by course code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-semibold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="PREPARATION">Preparation</option>
            <option value="MARKING">Marking</option>
            <option value="REVIEW">Review</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-600" /> Assigned Exam
            Packets ({filteredPackets.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredPackets.map((packet) => (
            <div
              key={packet.packetId}
              className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {packet.courseCode}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                    {packet.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mt-1">
                  {packet.courseName}
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Department: {packet.department} | Holder:{" "}
                  {packet.currentHolder} | Deadline: {packet.deadline}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPacketId(packet.packetId)}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-brand-50 hover:text-brand-600 text-slate-600 flex items-center gap-1 font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
                <button
                  onClick={() => setMarkingPacket(packet)}
                  className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 flex items-center gap-1 font-semibold px-3"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Mark Script Count
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPacketId && (
        <PacketDetailModal
          packetId={selectedPacketId}
          onClose={() => setSelectedPacketId(null)}
        />
      )}
      {markingPacket && (
        <MarkingEntryModal
          packet={markingPacket}
          onClose={() => setMarkingPacket(null)}
        />
      )}
    </div>
  );
}
