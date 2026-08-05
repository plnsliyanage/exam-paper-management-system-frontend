import React, { useEffect, useState } from "react";
import { lecturerApi } from "../../services/api";
import PacketDetailModal from "../../components/PacketDetailModal";
import MarkingEntryModal from "../../components/MarkingEntryModal";

import { FileText, Search, Eye, Edit3, Check } from "lucide-react";

export default function LecturerPacketsPage({ lecturerId = "U1" }) {
  const [packets, setPackets] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedPacketId, setSelectedPacketId] = useState(null);

  const [markingPacket, setMarkingPacket] = useState(null);

  // SAME API AS DASHBOARD
  const loadPackets = async () => {
    try {
      setLoading(true);

      const response = await lecturerApi.getPackets(lecturerId);

      console.log("Assigned Packets:", response.data);

      setPackets(response.data || []);
    } catch (error) {
      console.error("Failed to load packets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackets();
  }, [lecturerId]);

  const handleCompleteTask = async (packetId) => {
    try {
      await lecturerApi.completeTask(packetId);

      loadPackets();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredPackets = packets.filter((packet) => {
    const searchMatch =
      packet.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      packet.courseName?.toLowerCase().includes(searchQuery.toLowerCase());

    const statusMatch =
      statusFilter === "ALL" || packet.status === statusFilter;

    return searchMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="p-8 text-slate-500">Loading Assigned Packets...</div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Assigned Exam Packets
          </h1>

          <p className="text-sm text-slate-500">
            View and manage packets assigned to you
          </p>
        </div>

        <div className="relative">
          <Search
            className="
absolute
left-3
top-3
w-4
h-4
text-slate-400
"
          />

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search packets..."
            className="
pl-9
pr-4
py-2
border
rounded-xl
"
          />
        </div>
      </div>

      {/* Status Filter */}

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="
border
rounded-xl
px-3
py-2
"
      >
        <option value="ALL">All Status</option>

        <option value="PREPARATION">Preparation</option>

        <option value="MARKING">Marking</option>

        <option value="COMPLETED">Completed</option>
      </select>

      <div
        className="
bg-white
border
rounded-2xl
p-6
"
      >
        <div
          className="
flex
justify-between
border-b
pb-3
mb-4
"
        >
          <h2
            className="
font-bold
flex
gap-2
items-center
"
          >
            <FileText className="w-5 h-5" />
            Packets List
          </h2>

          <span className="text-slate-400">{filteredPackets.length} Items</span>
        </div>

        <div className="space-y-4">
          {filteredPackets.length > 0 ? (
            filteredPackets.map((packet) => (
              <div
                key={packet.packetId}
                className="
p-4
border
rounded-xl
bg-slate-50
flex
justify-between
items-center
"
              >
                <div>
                  <div className="flex gap-2">
                    <span
                      className="
px-2
py-1
rounded
bg-blue-50
text-blue-700
font-bold
text-xs
"
                    >
                      {packet.courseCode}
                    </span>

                    <span
                      className="
px-2
py-1
rounded-full
bg-slate-200
text-xs
"
                    >
                      {packet.status || "PREPARATION"}
                    </span>
                  </div>

                  <h3
                    className="
font-bold
mt-2
"
                  >
                    {packet.courseName}
                  </h3>

                  <p
                    className="
text-xs
text-slate-500
"
                  >
                    Department: {packet.departmentName || "N/A"}
                    <br />
                    Holder: {packet.currentHolderName || "Me"}
                    <br />
                    Deadline: {packet.deadline || "N/A"}
                  </p>
                </div>

                <div
                  className="
flex
gap-2
"
                >
                  <button
                    onClick={() => setSelectedPacketId(packet.packetId)}
                    className="
p-2
hover:bg-blue-100
rounded
"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setMarkingPacket(packet)}
                    className="
p-2
hover:bg-green-100
rounded
"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleCompleteTask(packet.packetId)}
                    className="
bg-slate-900
text-white
px-3
py-2
rounded-lg
flex
items-center
gap-1
text-xs
"
                  >
                    <Check className="w-3 h-3" />
                    Complete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div
              className="
text-center
text-slate-400
py-10
"
            >
              No Assigned Packets
            </div>
          )}
        </div>
      </div>

      {selectedPacketId && (
        <PacketDetailModal
          packetId={selectedPacketId}
          onClose={() => setSelectedPacketId(null)}
          onStatusUpdated={loadPackets}
        />
      )}

      {markingPacket && (
        <MarkingEntryModal
          packet={markingPacket}
          onClose={() => setMarkingPacket(null)}
          onSuccess={loadPackets}
        />
      )}
    </div>
  );
}
