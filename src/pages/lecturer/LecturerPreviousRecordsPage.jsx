import React, { useEffect, useState } from "react";
import PacketDetailModal from "../../components/PacketDetailModal";
import { History, Eye, Search } from "lucide-react";

// Hardcoded Mock Data for previewing and testing previous records
const MOCK_CURRENT_USER = {
  id: "LEC-101",
  name: "Dr. Samantha Perera",
  username: "samantha.p",
};

const MOCK_PREVIOUS_PACKETS = [
  {
    id: "PKT-2025-09",
    courseCode: "CS3012",
    courseName: "Advanced Operating Systems",
    academicCycle: "2025 Semester 2",
    lecturerId: "LEC-101",
  },
  {
    id: "PKT-2025-04",
    courseCode: "CS2013",
    courseName: "Computer Architecture",
    academicCycle: "2025 Semester 1",
    lecturerId: "LEC-101",
  },
  {
    id: "PKT-2024-12",
    courseCode: "CS1011",
    courseName: "Introduction to Programming",
    academicCycle: "2024 Semester 2",
    lecturerId: "LEC-101",
  },
];

export default function LecturerPreviousRecordsPage() {
  // Use mock user profile
  const [currentUser] = useState(MOCK_CURRENT_USER);

  // Extract the active user ID/username
  const lecturerId =
    currentUser?.id || currentUser?.userId || currentUser?.username;

  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPacketId, setSelectedPacketId] = useState(null);

  useEffect(() => {
    if (!lecturerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Simulate API fetch delay with hardcoded mock records
    const timer = setTimeout(() => {
      const allPackets = MOCK_PREVIOUS_PACKETS;

      // Filter packets that match the logged-in user
      const myPackets = allPackets.filter((p) => {
        const owner =
          p.lecturerId || p.userId || p.assignedTo || p.lecturerName;

        if (!owner) return false;

        return String(owner).toLowerCase() === String(lecturerId).toLowerCase();
      });

      setPackets(myPackets);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [lecturerId]);

  const filtered = packets.filter(
    (p) =>
      p.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.courseName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!lecturerId) {
    return (
      <div className="p-8 text-red-500 text-xs">
        No active session found. Please log in again.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-slate-400 text-xs">
        Loading previous archives for user ID {lecturerId}...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Previous Academic Packets ({currentUser?.name || lecturerId})
            [Preview Mode]
          </h1>
          <p className="text-sm text-slate-500">
            Access historical semester exam records and completed archives
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search archive..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none shadow-sm focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-4 h-4 text-brand-600" />
          <h2 className="font-bold text-slate-800">Archive Records</h2>
        </div>

        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((packet) => {
              const pId = packet.id || packet.packetId;
              return (
                <div
                  key={pId}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {packet.courseCode}
                    </span>
                    <h3 className="font-bold text-slate-800 text-sm mt-1">
                      {packet.courseName}
                    </h3>
                    <p className="text-slate-400">
                      Academic Cycle:{" "}
                      <span className="text-slate-600">
                        {packet.academicCycle || "Past Semester"}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedPacketId(pId)}
                    className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-slate-400 text-center py-10">
              No previous records found for ID ({lecturerId}).
            </p>
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
