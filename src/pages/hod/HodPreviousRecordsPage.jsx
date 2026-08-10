import React, { useState } from "react";
import { Search, Eye } from "lucide-react";

export default function HodPreviousRecordsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCycle, setSelectedCycle] = useState("2025/2026 Sem 2");

  const historicalRecords = [
    {
      id: "PKT-2025-89",
      course: "Object Oriented Programming",
      cycle: "2025/2026 Sem 2",
      lecturer: "Dr. Alice Smith",
      moderator: "Prof. Bob Jones",
      completedDate: "2026-06-12",
    },
    {
      id: "PKT-2025-72",
      course: "Web Development",
      cycle: "2025/2026 Sem 2",
      lecturer: "Dr. Charlie Brown",
      moderator: "Dr. Evans",
      completedDate: "2026-06-10",
    },
    {
      id: "PKT-2024-45",
      course: "Discrete Mathematics",
      cycle: "2025/2026 Sem 1",
      lecturer: "Prof. Diana Prince",
      moderator: "Dr. Alice Smith",
      completedDate: "2026-01-20",
    },
  ];

  const filteredRecords = historicalRecords.filter(
    (rec) =>
      (rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.course.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCycle === "All" || rec.cycle === selectedCycle),
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Previous Academic Records & Archives
        </h1>
        <p className="text-sm text-gray-500">
          Access and search historical assessment packets from past academic
          cycles.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search archive by course name, packet ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedCycle}
          onChange={(e) => setSelectedCycle(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
        >
          <option value="All">All Past Cycles</option>
          <option value="2025/2026 Sem 2">2025/2026 Sem 2</option>
          <option value="2025/2026 Sem 1">2025/2026 Sem 1</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                <th className="py-3 px-4">Packet ID</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Academic Cycle</th>
                <th className="py-3 px-4">Lecturer / Moderator</th>
                <th className="py-3 px-4">Archived Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {rec.id}
                  </td>
                  <td className="py-3 px-4 font-medium text-blue-600">
                    {rec.course}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600">
                    {rec.cycle}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600">
                    <div>{rec.lecturer}</div>
                    <div className="text-gray-400">Mod: {rec.moderator}</div>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {rec.completedDate}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Opening archive for ${rec.id}`)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1.5 ml-auto"
                    >
                      <Eye size={14} /> View Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
